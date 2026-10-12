const formatPrice = (value) =>
  Number(value).toLocaleString('vi-VN', { maximumFractionDigits: 0 }) + ' đ';

// id hợp lệ = số nguyên dương; sai định dạng thì coi như không tồn tại (404)
const parseId = (value) => (/^\d{1,9}$/.test(String(value)) && Number(value) > 0 ? Number(value) : null);

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { formatPrice, parseId, asyncHandler };
