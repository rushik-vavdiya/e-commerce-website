// Every expected failure in the API is one of these. The status code travels
// with the error instead of being guessed from its message, so the error
// middleware stays short and a new message can never silently become a 500.
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}

export const badRequest = (message) => new AppError(message, 400);
export const unauthorized = (message) => new AppError(message, 401);
export const forbidden = (message) => new AppError(message, 403);
export const notFound = (message) => new AppError(message, 404);
export const conflict = (message) => new AppError(message, 409);
export const badGateway = (message) => new AppError(message, 502);
export const unavailable = (message) => new AppError(message, 503);

export default AppError;
