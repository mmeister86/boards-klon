import { BaseError } from "../types";

/**
 * Interface für Error-Tracking-Konfiguration
 */
interface ErrorTrackingConfig {
  environment: string;
  release?: string;
  defaultTags?: Record<string, string>;
  shouldTrack?: (error: BaseError) => boolean;
}

/**
 * Error-Tracking-Service
 * Verwaltet das Logging und Tracking von Fehlern
 */
export class ErrorTrackingService {
  private static instance: ErrorTrackingService;
  private config: ErrorTrackingConfig;
  private isInitialized = false;

  private constructor(config: ErrorTrackingConfig) {
    this.config = {
      ...config,
      shouldTrack: config.shouldTrack || (() => true),
    };
  }

  /**
   * Initialisiert den Error-Tracking-Service
   */
  public static init(config: ErrorTrackingConfig): ErrorTrackingService {
    if (!ErrorTrackingService.instance) {
      ErrorTrackingService.instance = new ErrorTrackingService(config);
      ErrorTrackingService.instance.isInitialized = true;
    }
    return ErrorTrackingService.instance;
  }

  /**
   * Gibt die Instanz des Error-Tracking-Service zurück
   */
  public static getInstance(): ErrorTrackingService {
    if (!ErrorTrackingService.instance) {
      throw new Error("ErrorTrackingService muss zuerst initialisiert werden");
    }
    return ErrorTrackingService.instance;
  }

  /**
   * Trackt einen Fehler
   */
  public async trackError(error: BaseError, context?: Record<string, unknown>): Promise<void> {
    if (!this.isInitialized) {
      console.warn("ErrorTrackingService wurde nicht initialisiert");
      return;
    }

    // Prüfe, ob der Fehler getrackt werden soll
    const shouldTrack = this.config.shouldTrack || (() => true);
    if (!shouldTrack(error)) {
      return;
    }

    const errorData = {
      name: error.name,
      message: error.message,
      metadata: {
        ...error.metadata,
        environment: this.config.environment,
        release: this.config.release,
        tags: this.config.defaultTags,
        context: {
          ...error.metadata.context,
          ...context,
        },
      },
    };

    // Logging in der Entwicklungsumgebung
    if (process.env.NODE_ENV === "development") {
      console.error("[Error Tracking]", errorData);
    }

    try {
      // Hier können Sie die Integration mit einem Error-Tracking-Service wie Sentry implementieren
      // Beispiel für console.error in Produktion:
      if (process.env.NODE_ENV === "production") {
        // Senden Sie den Fehler an Ihren Error-Tracking-Service
        await this.sendErrorToTrackingService(errorData);
      }
    } catch (trackingError) {
      // Fehler beim Tracking sollten die Anwendung nicht beeinträchtigen
      console.error("Fehler beim Error-Tracking:", trackingError);
    }
  }

  /**
   * Sendet einen Fehler an den Error-Tracking-Service
   * Diese Methode sollte überschrieben werden, um einen spezifischen Service anzubinden
   */
  protected async sendErrorToTrackingService(errorData: unknown): Promise<void> {
    // Implementieren Sie hier die Integration mit Ihrem Error-Tracking-Service
    console.error("[Production Error]", errorData);
  }
}
