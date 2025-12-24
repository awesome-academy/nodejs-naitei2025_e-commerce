export const format = (price?: number) => {
  const val = Number(price || 0);
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
};

export default format;
