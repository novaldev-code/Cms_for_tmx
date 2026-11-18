export class ApiError extends Error {
  constructor(status, message, errors = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export function sendSuccess(
  res,
  data,
  message = 'Data berhasil diproses',
  status = 200,
) {
  return res.status(status).json({
    success: true,
    data,
    message,
  });
}

export function sendError(res, status, message, errors = {}) {
  return res.status(status).json({
    success: false,
    message,
    errors,
  });
}
