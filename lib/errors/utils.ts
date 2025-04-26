import { BaseError, ErrorSeverity } from './types';
import { PostgrestError } from '@supabase/supabase-js';
import {
  QueryError,
  UnauthorizedError,
  ConnectionError,
  ResourceNotFoundError,
  TokenExpiredError,
  InputValidationError
} from './specific';

/**
 * Konvertiert einen unbekannten Fehler in einen BaseError
 */
export function normalizeError(error: unknown): BaseError {
  // Wenn es bereits ein BaseError ist, gib ihn direkt zurück
  if (error instanceof BaseError) {
    return error;
  }

  // Wenn es ein Standard-Error ist
  if (error instanceof Error) {
    return new BaseError({
      code: 'UNKNOWN',
      userMessage: 'Ein unerwarteter Fehler ist aufgetreten.',
      technical: error.message,
      severity: ErrorSeverity.ERROR,
      recoverable: false,
      stack: error.stack,
    });
  }

  // Für alle anderen Fälle
  return new BaseError({
    code: 'UNKNOWN',
    userMessage: 'Ein unerwarteter Fehler ist aufgetreten.',
    technical: String(error),
    severity: ErrorSeverity.ERROR,
    recoverable: false,
  });
}

/**
 * Konvertiert einen Supabase PostgrestError in einen spezifischen Fehler
 */
export function handleSupabaseError(error: PostgrestError): BaseError {
  // Extrahiere den Code und die Nachricht
  const { code, message, details } = error;

  // Mapping von Supabase-Fehlercodes zu unseren Fehlertypen
  switch (code) {
    case '42P01': // Relation does not exist
    case '42703': // Column does not exist
      return new QueryError(
        'Ein Datenbankfehler ist aufgetreten.',
        `${message} (${details})`
      );

    case '23505': // Unique violation
      return new ResourceNotFoundError(
        'Diese Resource existiert bereits.',
        message
      );

    case '23503': // Foreign key violation
      return new ResourceNotFoundError(
        'Die referenzierte Resource existiert nicht.',
        message
      );

    case '28000': // Invalid authorization
    case '28P01': // Invalid password
      return new UnauthorizedError(
        'Ungültige Anmeldedaten.',
        message
      );

    case '40001': // Serialization failure
    case '40P01': // Deadlock
      return new ConnectionError(
        'Bitte versuchen Sie es erneut.',
        message
      );

    default:
      return new QueryError(
        'Ein Datenbankfehler ist aufgetreten.',
        `${message} (Code: ${code})`
      );
  }
}

/**
 * Prüft, ob ein Fehler automatisch behoben werden kann
 */
export function isAutoRecoverable(error: BaseError): boolean {
  return (
    error.isRecoverable() &&
    (error instanceof TokenExpiredError || error instanceof ConnectionError)
  );
}

/**
 * Prüft, ob ein Fehler vom Benutzer behoben werden kann
 */
export function isUserRecoverable(error: BaseError): boolean {
  return (
    error.isRecoverable() &&
    (error instanceof UnauthorizedError || error instanceof InputValidationError)
  );
}

/**
 * Erstellt eine benutzerfreundliche Fehlermeldung
 */
export function createErrorMessage(error: BaseError): string {
  const message = error.getUserMessage();
  const technical = error.getTechnicalDetails();

  if (process.env.NODE_ENV === 'development' && technical) {
    return `${message}\n\nTechnische Details: ${technical}`;
  }

  return message;
}

/**
 * Erstellt ein Fehler-Log-Objekt
 */
export function createErrorLog(error: BaseError): Record<string, unknown> {
  return {
    ...error.toJSON(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  };
}

/**
 * Gruppiert Fehler nach Schweregrad
 */
export function groupErrorsBySeverity(errors: BaseError[]): Record<ErrorSeverity, BaseError[]> {
  return errors.reduce((acc, error) => {
    const severity = error.getSeverity();
    if (!acc[severity]) {
      acc[severity] = [];
    }
    acc[severity].push(error);
    return acc;
  }, {} as Record<ErrorSeverity, BaseError[]>);
}
