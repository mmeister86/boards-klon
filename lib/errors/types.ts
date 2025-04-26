/**
 * Schweregrade für Fehler
 */
export enum ErrorSeverity {
  FATAL = 'FATAL',   // App muss neu geladen werden
  ERROR = 'ERROR',   // Feature ist nicht nutzbar
  WARNING = 'WARNING', // Feature eingeschränkt nutzbar
  INFO = 'INFO'      // Informationeller Fehler
}

/**
 * Metadaten für Fehler
 */
export interface ErrorMetadata {
  // Eindeutiger Fehlercode (z.B. "AUTH001")
  code: string;

  // HTTP-Status-Code (optional)
  httpStatus?: number;

  // Benutzerfreundliche Nachricht
  userMessage: string;

  // Technische Details (für Entwickler)
  technical?: string;

  // Zusätzliche Kontextinformationen
  context?: Record<string, unknown>;

  // Gibt an, ob der Fehler behebbar ist
  recoverable: boolean;

  // Schweregrad des Fehlers
  severity: ErrorSeverity;

  // Zeitstempel des Fehlers
  timestamp: Date;

  // Stack trace (wird automatisch gefüllt)
  stack?: string;
}

/**
 * Basis-Fehlerklasse für alle App-spezifischen Fehler
 */
export class BaseError extends Error {
  readonly metadata: ErrorMetadata;

  constructor(metadata: Omit<ErrorMetadata, 'timestamp'>) {
    // Konstruiere die Basis Error-Klasse
    super(metadata.userMessage);

    // Setze den Namen der Fehlerklasse
    this.name = this.constructor.name;

    // Erstelle die Metadaten mit Timestamp
    this.metadata = {
      ...metadata,
      timestamp: new Date(),
    };

    // Erfasse den Stack Trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    // Füge den Stack Trace zu den Metadaten hinzu
    this.metadata.stack = this.stack;
  }

  /**
   * Gibt eine benutzerfreundliche Nachricht zurück
   */
  public getUserMessage(): string {
    return this.metadata.userMessage;
  }

  /**
   * Gibt technische Details zurück (falls vorhanden)
   */
  public getTechnicalDetails(): string | undefined {
    return this.metadata.technical;
  }

  /**
   * Gibt den HTTP-Status-Code zurück (falls vorhanden)
   */
  public getHttpStatus(): number | undefined {
    return this.metadata.httpStatus;
  }

  /**
   * Prüft, ob der Fehler behebbar ist
   */
  public isRecoverable(): boolean {
    return this.metadata.recoverable;
  }

  /**
   * Gibt den Schweregrad des Fehlers zurück
   */
  public getSeverity(): ErrorSeverity {
    return this.metadata.severity;
  }

  /**
   * Gibt die Fehlerdaten als JSON-Objekt zurück
   */
  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      metadata: this.metadata,
    };
  }
}

/**
 * Netzwerk-Fehler Basis-Klasse
 */
export class NetworkError extends BaseError {
  constructor(metadata: Omit<ErrorMetadata, 'timestamp'>) {
    super({
      ...metadata,
      code: `NET${metadata.code}`,
      httpStatus: metadata.httpStatus || 500,
    });
  }
}

/**
 * Authentifizierungs-Fehler Basis-Klasse
 */
export class AuthError extends BaseError {
  constructor(metadata: Omit<ErrorMetadata, 'timestamp'>) {
    super({
      ...metadata,
      code: `AUTH${metadata.code}`,
      httpStatus: metadata.httpStatus || 401,
    });
  }
}

/**
 * Datenbank-Fehler Basis-Klasse
 */
export class DatabaseError extends BaseError {
  constructor(metadata: Omit<ErrorMetadata, 'timestamp'>) {
    super({
      ...metadata,
      code: `DB${metadata.code}`,
      httpStatus: metadata.httpStatus || 500,
    });
  }
}

/**
 * Validierungs-Fehler Basis-Klasse
 */
export class ValidationError extends BaseError {
  constructor(metadata: Omit<ErrorMetadata, 'timestamp'>) {
    super({
      ...metadata,
      code: `VAL${metadata.code}`,
      httpStatus: metadata.httpStatus || 400,
    });
  }
}

/**
 * Business-Logik-Fehler Basis-Klasse
 */
export class BusinessError extends BaseError {
  constructor(metadata: Omit<ErrorMetadata, 'timestamp'>) {
    super({
      ...metadata,
      code: `BUS${metadata.code}`,
      httpStatus: metadata.httpStatus || 422,
    });
  }
}
