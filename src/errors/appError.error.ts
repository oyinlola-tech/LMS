export class AppError extends Error {
  code: string;
  statusCode: number;

  constructor(message: string, code: string, statusCode: number = 500) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}
