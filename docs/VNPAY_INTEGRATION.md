# Tích hợp VNPay (NodeJS)

## Cấu hình môi trường (server/.env)

- `VNPAY_TMN_CODE`: mã Terminal do VNPay cung cấp.
- `VNPAY_HASH_SECRET`: secret key để ký/kiểm tra checksum.
- `VNPAY_PAYMENT_URL`: URL cổng thanh toán (sandbox: `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html`).
- `VNPAY_API_URL`: API sandbox `https://sandbox.vnpayment.vn/merchant_webapi/api/transaction`.
- `VNPAY_RETURN_URL`: URL front-end nhận kết quả (ví dụ: `http://localhost:5173/payment/vnpay-return`).
- `VNPAY_IPN_URL`: URL server nhận IPN (ví dụ: `http://localhost:4000/payments/vnpay/ipn`).

## Endpoints mới (server)

- `POST /payments/vnpay/create`
  - Body: `{ amount: number, orderId?: string, orderInfo?: string, bankCode?: string, orderType?: string, locale?: string, returnUrl?: string, ipnUrl?: string }`
  - Trả về: `{ success, paymentUrl, data }` (paymentUrl để redirect/mở tab mới tới VNPay).
- `GET /payments/vnpay/verify?...`
  - Nhận toàn bộ query trả về từ VNPay, kiểm tra checksum và phản hồi `{ success, code, message, orderId, amount, bankCode }`.
- `GET /payments/vnpay/ipn?...`
  - Endpoint nhận IPN. Hiện trả về `RspCode:00` khi checksum hợp lệ (cần gắn logic cập nhật DB nếu có).

## Luồng front-end (Checkout)

- Bước thanh toán thẻ hiển thị nút "Thanh toán qua VNPay".
- Khi bấm, app gọi `POST /payments/vnpay/create` và mở VNPay trong tab mới.
- Trang `payment/vnpay-return` xác thực lại với server rồi đẩy kết quả sang `localStorage` (`vnpayLastResult`); tab Checkout lắng nghe sự kiện `storage` để tự đánh dấu `paymentConfirmed`.

> Lưu ý: Hãy đảm bảo CORS `ALLOWED_ORIGINS` chứa domain front-end, và cấu hình VNPay của bạn khớp với domain/port đang chạy.
