// backend/src/utils/AppError.ts

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    // Capturer la stack trace
    Error.captureStackTrace(this, this.constructor);
    
    // Définir le nom de l'erreur
    this.name = this.constructor.name;
  }
}