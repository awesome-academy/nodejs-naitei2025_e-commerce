import crypto from 'crypto';
import express from 'express';
import { createClient } from '@supabase/supabase-js';

const DEFAULT_PAYMENT_URL = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const DEFAULT_API_URL = 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction';
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

const formatDate = (date = new Date()) => {
  const pad = (value) => value.toString().padStart(2, '0');
  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
};

const sortObject = (obj) => {
  return Object.keys(obj)
    .sort()
    .reduce((acc, key) => {
      acc[key] = encodeURIComponent(obj[key]).replace(/%20/g, '+');
      return acc;
    }, {});
};

const signPayload = (params, secretKey) => {
  const sortedParams = sortObject(params);
  const signData = Object.keys(sortedParams)
    .map((key) => `${key}=${sortedParams[key]}`)
    .join('&');
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  return { signed, sortedParams, signData };
};

const verifySignature = (params, secretKey) => {
  const receivedHash = params.vnp_SecureHash || params.vnp_SecureHashType;
  const cloned = { ...params };
  delete cloned.vnp_SecureHash;
  delete cloned.vnp_SecureHashType;

  const { signed, sortedParams } = signPayload(cloned, secretKey);
  return {
    isValid: receivedHash === signed,
    receivedHash,
    computedHash: signed,
    sortedParams
  };
};

const getClientIp = (req) => {
  return (
    req.headers['x-forwarded-for'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.connection?.socket?.remoteAddress ||
    ''
  );
};

const getVnpConfig = () => {
  const tmnCode = process.env.VNPAY_TMN_CODE || process.env.vnp_TmnCode;
  const secretKey = process.env.VNPAY_HASH_SECRET || process.env.vnp_HashSecret;
  const paymentUrl =
    process.env.VNPAY_PAYMENT_URL || process.env.vnp_Url || DEFAULT_PAYMENT_URL;
  const apiUrl = process.env.VNPAY_API_URL || process.env.vnp_Api || DEFAULT_API_URL;
  const returnUrl =
    process.env.VNPAY_RETURN_URL ||
    process.env.vnp_ReturnUrl ||
    `${process.env.ALLOWED_ORIGINS?.split(',')[0] ?? 'http://localhost:5173'}/payment/vnpay-return`;
  const ipnUrl = process.env.VNPAY_IPN_URL || process.env.vnp_IpnUrl || '';

  if (!tmnCode || !secretKey) {
    throw new Error('Thiếu cấu hình VNPAY: cần VNPAY_TMN_CODE và VNPAY_HASH_SECRET');
  }

  return {
    tmnCode,
    secretKey,
    paymentUrl,
    apiUrl,
    returnUrl,
    ipnUrl
  };
};

const updateOrderPayment = async (txnRef, amount, payload) => {
  if (!supabase) {
    console.warn('Supabase client not configured, skip updating order');
    return { updated: false, reason: 'no_supabase' };
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, total, status, metadata')
    .eq('id', txnRef)
    .maybeSingle();

  if (orderError) {
    console.error('Failed to fetch order for VNPAY IPN', orderError);
    throw orderError;
  }

  if (!order) {
    return { updated: false, reason: 'not_found' };
  }

  const expectedAmount = Number(order.total ?? 0);
  if (Number.isFinite(expectedAmount) && expectedAmount > 0) {
    const paidAmount = Number(amount);
    if (paidAmount && Math.abs(paidAmount - expectedAmount) > 0.01) {
      return { updated: false, reason: 'amount_mismatch', expected: expectedAmount, got: paidAmount };
    }
  }

  const mergedMetadata = {
    ...(order.metadata ?? {}),
    vnpay: payload
  };

  const isSuccess =
    payload.responseCode === '00' &&
    (payload.transactionStatus ? payload.transactionStatus === '00' : true);

  const { error: updateError } = await supabase
    .from('orders')
    .update({
      status: isSuccess ? 'Đã thanh toán' : 'Thanh toán thất bại',
      payment_method: 'card',
      metadata: mergedMetadata,
      last_status_change: new Date().toISOString()
    })
    .eq('id', txnRef);

  if (updateError) {
    console.error('Failed to update order after VNPAY IPN', updateError);
    throw updateError;
  }

  try {
    await supabase.from('order_status_history').insert({
      order_id: txnRef,
      status: isSuccess ? 'Đã thanh toán' : 'Thanh toán thất bại',
      note: 'Cập nhật từ VNPAY IPN/return'
    });
  } catch (err) {
    console.warn('Failed to insert order_status_history for VNPAY IPN', err);
  }

  return { updated: true, reason: 'updated' };
};

const upsertOrderServerSide = async (orderPayload = {}) => {
  if (!supabase) {
    return null;
  }

  const txnRef = orderPayload.id || orderPayload.orderId || orderPayload.txnRef;
  if (!txnRef) {
    return null;
  }

  const items = Array.isArray(orderPayload.items) ? orderPayload.items : [];
  const total = Number(orderPayload.total ?? 0);
  const itemsCount = items.reduce((sum, item) => sum + Number(item?.quantity ?? 0), 0);

  const payload = {
    id: txnRef,
    user_id: orderPayload.userId ?? null,
    customer_name: orderPayload.customerName ?? 'Khách hàng VNPay',
    customer_email: orderPayload.customerEmail ?? '',
    customer_phone: orderPayload.customerPhone ?? '',
    shipping_address: orderPayload.shippingAddress ?? '',
    payment_method: orderPayload.paymentMethod ?? 'card',
    status: orderPayload.status ?? 'Đang thanh toán',
    note: orderPayload.note ?? 'Khởi tạo thanh toán VNPay',
    total: Number.isFinite(total) ? total : 0,
    items_count: itemsCount,
    date: orderPayload.date ?? new Date().toISOString(),
    metadata: orderPayload.metadata ?? {}
  };

  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single();

  if (orderError) {
    throw orderError;
  }

  if (items.length) {
    // Replace items to avoid duplicates on retry
    await supabase.from('order_items').delete().eq('order_id', txnRef);
    const itemsPayload = items.map((item) => ({
      order_id: txnRef,
      product_id: item.productId ?? item.id ?? null,
      product_name: item.productName ?? 'Sản phẩm',
      quantity: Number(item.quantity ?? 1),
      price: Number(item.price ?? 0)
    }));
    const { error: itemsError } = await supabase.from('order_items').upsert(itemsPayload);
    if (itemsError) {
      throw itemsError;
    }
  }

  return orderData;
};

const createVnpayRouter = () => {
  const router = express.Router();

  router.post('/create', async (req, res) => {
    try {
      const config = getVnpConfig();
      const amount = Number(req.body?.amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        return res.status(400).json({ success: false, error: 'Số tiền không hợp lệ' });
      }

      const locale = req.body?.locale || 'vn';
      const orderInfo =
        req.body?.orderInfo || `Thanh toan cho don hang ${Date.now().toString()}`;
      const orderType = req.body?.orderType || 'other';
      const bankCode = req.body?.bankCode;
      const orderId =
        req.body?.orderId ||
        req.body?.order?.id ||
        req.body?.order?.orderId ||
        formatDate(new Date()).slice(-6) + Math.floor(Math.random() * 1000).toString();

      const createDate = formatDate(new Date());
      const expireDate = formatDate(new Date(Date.now() + 15 * 60 * 1000));
      const ipAddr = getClientIp(req) || '127.0.0.1';
      const returnUrl = req.body?.returnUrl || config.returnUrl;
      const ipnUrl = req.body?.ipnUrl || config.ipnUrl;
      const orderPayload = req.body?.order;

      let vnp_Params = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: config.tmnCode,
        vnp_Locale: locale,
        vnp_CurrCode: 'VND',
        vnp_TxnRef: orderId.toString(),
        vnp_OrderInfo: orderInfo,
        vnp_OrderType: orderType,
        vnp_Amount: Math.round(amount * 100),
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate,
        vnp_ExpireDate: expireDate
      };

      if (bankCode) {
        vnp_Params.vnp_BankCode = bankCode;
      }
      // VNPay sandbox có thể từ chối nếu IPN là localhost. Chỉ gửi khi là URL công khai.
      const shouldSendIpn = ipnUrl && !ipnUrl.includes('localhost') && !ipnUrl.includes('127.0.0.1');
      if (shouldSendIpn) {
        vnp_Params.vnp_IpnUrl = ipnUrl;
      }

      const { signed, sortedParams, signData } = signPayload(vnp_Params, config.secretKey);
      const query = `${signData}&vnp_SecureHashType=SHA512&vnp_SecureHash=${signed}`;
      const paymentUrl = `${config.paymentUrl}?${query}`;

      if (orderPayload && supabase) {
        try {
          await upsertOrderServerSide({
            ...orderPayload,
            id: orderId,
            orderId,
            txnRef: orderId
          });
        } catch (err) {
          console.warn('Failed to upsert order before redirecting to VNPAY', err);
        }
      }

      console.log('[VNPAY][create]', {
        orderId,
        amount,
        bankCode,
        orderInfo,
        returnUrl,
        ipnUrl: shouldSendIpn ? ipnUrl : '(omitted)',
        paymentUrl
      });

      return res.json({
        success: true,
        paymentUrl,
        data: {
          vnp_SecureHashType: 'SHA512',
          ...sortedParams,
          vnp_SecureHash: signed,
          orderId,
          amount,
          orderInfo,
          bankCode,
          returnUrl,
          ipnUrl
        }
      });
    } catch (error) {
      console.error('Không thể tạo URL thanh toán VNPAY:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Lỗi máy chủ khi tạo thanh toán'
      });
    }
  });

  router.get('/verify', async (req, res) => {
    try {
      const config = getVnpConfig();
      const vnp_Params = { ...req.query };
      const { isValid } = verifySignature(vnp_Params, config.secretKey);
      const responseCode = vnp_Params.vnp_ResponseCode || '00';
      const transactionStatus = vnp_Params.vnp_TransactionStatus;
      const txnRef = vnp_Params.vnp_TxnRef;
      const paidAmount = vnp_Params.vnp_Amount ? Number(vnp_Params.vnp_Amount) / 100 : undefined;

      let dbUpdate;
      if (isValid && txnRef && supabase) {
        try {
          dbUpdate = await updateOrderPayment(txnRef, paidAmount, {
            responseCode,
            transactionStatus,
            transactionNo: vnp_Params.vnp_TransactionNo,
            bankCode: vnp_Params.vnp_BankCode,
            amount: paidAmount,
            payDate: vnp_Params.vnp_PayDate
          });
        } catch (err) {
          console.error('Failed to update order on VNPAY return', err);
          dbUpdate = { updated: false, reason: 'db_error' };
        }
      }

      return res.json({
        success: isValid && responseCode === '00',
        code: responseCode,
        message: isValid
          ? responseCode === '00'
            ? 'Thanh toán thành công'
            : 'Giao dịch chưa thành công'
          : 'Chữ ký không hợp lệ',
        orderId: txnRef,
        amount: paidAmount,
        bankCode: vnp_Params.vnp_BankCode,
        transactionNo: vnp_Params.vnp_TransactionNo,
        payDate: vnp_Params.vnp_PayDate,
        dbUpdate,
        raw: vnp_Params
      });
    } catch (error) {
      console.error('Xác thực VNPAY return thất bại:', error);
      return res.status(500).json({
        success: false,
        code: '99',
        message: 'Lỗi máy chủ khi xác thực kết quả thanh toán'
      });
    }
  });

  router.get('/ipn', async (req, res) => {
    try {
      const config = getVnpConfig();
      const vnp_Params = { ...req.query };
      const { isValid } = verifySignature(vnp_Params, config.secretKey);

      if (!isValid) {
        return res.status(200).json({ RspCode: '97', Message: 'Checksum failed' });
      }

      const txnRef = vnp_Params.vnp_TxnRef;
      const responseCode = vnp_Params.vnp_ResponseCode;
      const transactionStatus = vnp_Params.vnp_TransactionStatus;
      const paidAmount = vnp_Params.vnp_Amount ? Number(vnp_Params.vnp_Amount) / 100 : undefined;

      if (!txnRef) {
        return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
      }

      const paymentPayload = {
        responseCode,
        transactionStatus,
        transactionNo: vnp_Params.vnp_TransactionNo,
        bankCode: vnp_Params.vnp_BankCode,
        amount: paidAmount,
        payDate: vnp_Params.vnp_PayDate
      };

      if (!supabase) {
        console.warn('Supabase not configured, skipping DB update for IPN');
        return res.status(200).json({ RspCode: '00', Message: 'Success' });
      }

      try {
        const result = await updateOrderPayment(txnRef, paidAmount, paymentPayload);
        if (result.reason === 'not_found') {
          return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
        }
        if (result.reason === 'amount_mismatch') {
          return res.status(200).json({ RspCode: '04', Message: 'Amount invalid' });
        }
        return res.status(200).json({ RspCode: '00', Message: 'Success' });
      } catch (err) {
        console.error('Failed to handle VNPAY IPN DB update', err);
        return res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
      }
    } catch (error) {
      console.error('IPN VNPAY lỗi:', error);
      return res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
    }
  });

  return router;
};

export default createVnpayRouter;
