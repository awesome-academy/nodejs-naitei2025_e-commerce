export interface CreateVnpayPaymentParams {
  amount: number;
  orderId?: string;
  orderInfo?: string;
  orderType?: string;
  bankCode?: string;
  locale?: string;
  returnUrl?: string;
  ipnUrl?: string;
  order?: {
    id?: string;
    orderId?: string;
    txnRef?: string;
    userId?: string | null;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    shippingAddress?: string;
    paymentMethod?: string;
    status?: string;
    note?: string;
    items?: Array<{
      productId?: string;
      productName?: string;
      quantity?: number;
      price?: number;
      id?: string;
    }>;
    total?: number;
    metadata?: Record<string, unknown>;
  };
}

export interface VnpayCreateResponse {
  paymentUrl: string;
  txnRef: string;
  data?: Record<string, unknown>;
}

export interface VnpayVerifyResult {
  success: boolean;
  code?: string;
  message?: string;
  orderId?: string;
  amount?: number;
  bankCode?: string;
  transactionNo?: string;
  payDate?: string;
  raw?: Record<string, unknown>;
}

const resolveApiBaseUrl = () =>
  import.meta.env.VITE_PAYMENT_API_URL ||
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_AI_API_URL ||
  import.meta.env.VITE_COLAB_URL ||
  'http://localhost:4000';

export const createVnpayPaymentUrl = async (
  params: CreateVnpayPaymentParams
): Promise<VnpayCreateResponse> => {
  const response = await fetch(`${resolveApiBaseUrl()}/payments/vnpay/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });

  const payload = await response.json();

  if (!response.ok || !payload?.success || !payload?.paymentUrl) {
    throw new Error(payload?.error || 'Không thể khởi tạo thanh toán VNPay');
  }

  return {
    paymentUrl: payload.paymentUrl as string,
    txnRef: payload?.data?.orderId ?? payload?.data?.vnp_TxnRef ?? '',
    data: payload?.data
  };
};

export const verifyVnpayReturn = async (
  queryString: string
): Promise<VnpayVerifyResult> => {
  const normalized = queryString.startsWith('?') ? queryString.slice(1) : queryString;
  const response = await fetch(`${resolveApiBaseUrl()}/payments/vnpay/verify?${normalized}`, {
    method: 'GET'
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.message || 'Không thể xác thực kết quả thanh toán');
  }

  return payload as VnpayVerifyResult;
};
