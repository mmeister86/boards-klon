import { NetworkError, AuthError, DatabaseError, ValidationError, BusinessError, ErrorSeverity } from './types';

/**
 * Netzwerk-Fehler
 */
export class RequestTimeoutError extends NetworkError {
  constructor(message: string, technical?: string) {
    super({
      code: '001',
      userMessage: message,
      technical,
      severity: ErrorSeverity.ERROR,
      recoverable: true,
      httpStatus: 408,
    });
  }
}

export class ConnectionError extends NetworkError {
  constructor(message: string, technical?: string) {
    super({
      code: '002',
      userMessage: message,
      technical,
      severity: ErrorSeverity.ERROR,
      recoverable: true,
      httpStatus: 503,
    });
  }
}

/**
 * Authentifizierungs-Fehler
 */
export class UnauthorizedError extends AuthError {
  constructor(message: string, technical?: string) {
    super({
      code: '001',
      userMessage: message,
      technical,
      severity: ErrorSeverity.ERROR,
      recoverable: true,
      httpStatus: 401,
    });
  }
}

export class TokenExpiredError extends AuthError {
  constructor(message: string, technical?: string) {
    super({
      code: '002',
      userMessage: message,
      technical,
      severity: ErrorSeverity.WARNING,
      recoverable: true,
      httpStatus: 401,
    });
  }
}

export class PermissionDeniedError extends AuthError {
  constructor(message: string, technical?: string) {
    super({
      code: '003',
      userMessage: message,
      technical,
      severity: ErrorSeverity.ERROR,
      recoverable: false,
      httpStatus: 403,
    });
  }
}

/**
 * Datenbank-Fehler
 */
export class QueryError extends DatabaseError {
  constructor(message: string, technical?: string) {
    super({
      code: '001',
      userMessage: message,
      technical,
      severity: ErrorSeverity.ERROR,
      recoverable: false,
      httpStatus: 500,
    });
  }
}

export class ConstraintViolationError extends DatabaseError {
  constructor(message: string, technical?: string) {
    super({
      code: '002',
      userMessage: message,
      technical,
      severity: ErrorSeverity.ERROR,
      recoverable: true,
      httpStatus: 409,
    });
  }
}

export class RLSError extends DatabaseError {
  constructor(message: string, technical?: string) {
    super({
      code: '003',
      userMessage: message,
      technical,
      severity: ErrorSeverity.ERROR,
      recoverable: false,
      httpStatus: 403,
    });
  }
}

/**
 * Validierungs-Fehler
 */
export class InputValidationError extends ValidationError {
  constructor(message: string, fieldErrors?: Record<string, string[]>) {
    super({
      code: '001',
      userMessage: message,
      severity: ErrorSeverity.WARNING,
      recoverable: true,
      context: { fieldErrors },
      httpStatus: 400,
    });
  }
}

export class SchemaValidationError extends ValidationError {
  constructor(message: string, technical?: string) {
    super({
      code: '002',
      userMessage: message,
      technical,
      severity: ErrorSeverity.ERROR,
      recoverable: false,
      httpStatus: 400,
    });
  }
}

/**
 * Business-Logik-Fehler
 */
export class ResourceNotFoundError extends BusinessError {
  constructor(message: string, resource?: string) {
    super({
      code: '001',
      userMessage: message,
      severity: ErrorSeverity.ERROR,
      recoverable: false,
      context: { resource },
      httpStatus: 404,
    });
  }
}

export class ConflictError extends BusinessError {
  constructor(message: string, technical?: string) {
    super({
      code: '002',
      userMessage: message,
      technical,
      severity: ErrorSeverity.WARNING,
      recoverable: true,
      httpStatus: 409,
    });
  }
}

export class LimitExceededError extends BusinessError {
  constructor(message: string, limit?: number) {
    super({
      code: '003',
      userMessage: message,
      severity: ErrorSeverity.WARNING,
      recoverable: false,
      context: { limit },
      httpStatus: 429,
    });
  }
}
