export const formatPaymentMethod = (value?: string | null) => {
  if (!value) return 'Chưa rõ';
  const v = String(value).toLowerCase();
  if (v === 'cod' || v === 'cash') return 'Thanh toán khi nhận hàng (COD)';
  if (v === 'card' || v === 'card_payment') return 'Thẻ tín dụng/ghi nợ';
  if (v === 'bank' || v === 'bank_transfer') return 'Chuyển khoản ngân hàng';
  if (v === 'momo' || v === 'zalopay' || v === 'wallet') return 'Ví điện tử (MoMo, ZaloPay)';
  return String(value);
};

export default formatPaymentMethod;
