"use client";

import React from "react";
import {
  BaseError,
  ErrorSeverity,
  normalizeError,
  NetworkError,
  AuthError,
  DatabaseError,
  ValidationError,
  BusinessError,
} from "../";
import { ErrorTrackingService } from "../tracking/error-tracking-service";
import "./styles.css";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Ban,
  RefreshCw,
  LogOut,
  Database,
  AlertCircle,
} from "lucide-react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorBoundaryFallbackProps>;
  onError?: (error: BaseError) => void;
  onReset?: () => void;
}

export interface ErrorBoundaryFallbackProps {
  error: BaseError;
  resetError: () => void;
}

interface ErrorBoundaryState {
  error: BaseError | null;
}

/**
 * Basis-Komponente für Error Boundaries
 * Fängt Fehler in der React-Komponenten-Hierarchie ab
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private errorTrackingService: ErrorTrackingService;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };

    try {
      this.errorTrackingService = ErrorTrackingService.getInstance();
    } catch {
      // Initialisiere den Service, falls noch nicht geschehen
      this.errorTrackingService = ErrorTrackingService.init({
        environment: process.env.NODE_ENV || "development",
        release: process.env.NEXT_PUBLIC_APP_VERSION,
        defaultTags: {
          framework: "react",
          component: "ErrorBoundary",
        },
      });
    }
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { error: normalizeError(error) };
  }

  async componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const normalizedError = normalizeError(error);
    normalizedError.metadata.context = {
      ...normalizedError.metadata.context,
      componentStack: errorInfo.componentStack,
    };

    // Tracke den Fehler
    await this.errorTrackingService.trackError(normalizedError, {
      componentStack: errorInfo.componentStack,
      reactInfo: {
        componentName: this.constructor.name,
      },
    });

    this.props.onError?.(normalizedError);
  }

  resetError = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  handleLogout = () => {
    // Hier können Sie die Logout-Logik implementieren
    window.location.href = "/auth/sign-out";
  };

  renderErrorContent = (error: BaseError) => {
    // Bestimme den Fehlertyp
    if (error instanceof NetworkError) {
      return {
        icon: <Ban className="h-12 w-12 text-destructive mb-4" />,
        title: "Netzwerkfehler",
        message: "Es konnte keine Verbindung zum Server hergestellt werden.",
        action: (
          <Button
            onClick={() => window.location.reload()}
            className="error-button"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Seite neu laden
          </Button>
        ),
      };
    }

    if (error instanceof AuthError) {
      return {
        icon: <AlertCircle className="h-12 w-12 text-destructive mb-4" />,
        title: "Authentifizierungsfehler",
        message:
          "Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.",
        action: (
          <Button onClick={this.handleLogout} className="error-button">
            <LogOut className="h-4 w-4 mr-2" />
            Erneut anmelden
          </Button>
        ),
      };
    }

    if (error instanceof DatabaseError) {
      return {
        icon: <Database className="h-12 w-12 text-destructive mb-4" />,
        title: "Datenbankfehler",
        message:
          "Es ist ein Fehler beim Zugriff auf die Datenbank aufgetreten.",
        action: error.isRecoverable() ? (
          <Button onClick={this.resetError} className="error-button">
            <RefreshCw className="h-4 w-4 mr-2" />
            Erneut versuchen
          </Button>
        ) : (
          <Button
            onClick={() => window.location.reload()}
            className="error-button"
          >
            Seite neu laden
          </Button>
        ),
      };
    }

    if (error instanceof ValidationError) {
      return {
        icon: <AlertTriangle className="h-12 w-12 text-warning mb-4" />,
        title: "Validierungsfehler",
        message: error.getUserMessage(),
        action: (
          <Button onClick={this.resetError} className="error-button">
            <RefreshCw className="h-4 w-4 mr-2" />
            Zurück
          </Button>
        ),
      };
    }

    if (error instanceof BusinessError) {
      return {
        icon: <AlertTriangle className="h-12 w-12 text-warning mb-4" />,
        title: "Geschäftslogik-Fehler",
        message: error.getUserMessage(),
        action: error.isRecoverable() ? (
          <Button onClick={this.resetError} className="error-button">
            <RefreshCw className="h-4 w-4 mr-2" />
            Erneut versuchen
          </Button>
        ) : null,
      };
    }

    // Standardfehler
    return {
      icon: <AlertTriangle className="h-12 w-12 text-destructive mb-4" />,
      title:
        error.getSeverity() === ErrorSeverity.FATAL
          ? "Kritischer Fehler"
          : "Ein Fehler ist aufgetreten",
      message: error.getUserMessage(),
      action:
        error.getSeverity() === ErrorSeverity.FATAL ? (
          <Button
            onClick={() => window.location.reload()}
            className="error-button"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Seite neu laden
          </Button>
        ) : error.isRecoverable() ? (
          <Button onClick={this.resetError} className="error-button">
            <RefreshCw className="h-4 w-4 mr-2" />
            Erneut versuchen
          </Button>
        ) : null,
    };
  };

  render() {
    const { error } = this.state;
    const { children, fallback: Fallback } = this.props;

    if (error) {
      if (Fallback) {
        return <Fallback error={error} resetError={this.resetError} />;
      }

      const errorContent = this.renderErrorContent(error);

      return (
        <div className="error-container" role="alert">
          <div className="error-content">
            {errorContent.icon}
            <h2 className="error-title">{errorContent.title}</h2>
            <p className="error-message">{errorContent.message}</p>
            {errorContent.action}
            {error.metadata.technical && (
              <details className="mt-4 text-sm text-muted-foreground">
                <summary className="cursor-pointer">Technische Details</summary>
                <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                  {error.metadata.technical}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return children;
  }
}
