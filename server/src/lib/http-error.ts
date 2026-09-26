export class HttpError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message);
    this.name = 'HttpError';
  }

  static badRequest(message: string, details?: unknown) {
    return new HttpError(400, message, details);
  }

  static unauthorized(message = 'Потрібна авторизація') {
    return new HttpError(401, message);
  }

  static forbidden(message = 'Недостатньо прав доступу') {
    return new HttpError(403, message);
  }

  static notFound(message = 'Ресурс не знайдено') {
    return new HttpError(404, message);
  }

  static conflict(message: string) {
    return new HttpError(409, message);
  }
}
