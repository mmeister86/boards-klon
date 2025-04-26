"use client";

import React from "react";
import "./styles.css";

interface Props {
  children: React.ReactNode;
  feature: string;
}

interface State {
  hasError: boolean;
}

/**
 * Error Boundary für spezifische Features
 * Bietet isolierte Fehlerbehandlung für Feature-Bereiche
 */
export class FeatureErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="feature-error-container">
          <div className="error-content">
            <h2 className="error-title">Feature nicht verfügbar</h2>
            <p className="error-message">
              Das Feature &quot;{this.props.feature}&quot; ist momentan nicht
              verfügbar. Bitte versuchen Sie es später erneut.
            </p>
            <button
              className="error-button"
              onClick={() => window.location.reload()}
            >
              Seite neu laden
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
