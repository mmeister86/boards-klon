/* globals.d.ts */

// Diese Datei erweitert das globale Window-Interface um benutzerdefinierte Eigenschaften,
// die in den Standard-Typdefinitionen nicht definiert sind.
// Hier fügen wir die optionale Funktion 'resetDropAreaContentHover' hinzu, die den Hover-Zustand von Drop Areas zurücksetzt.

declare global {
  interface Window {
    // Diese optionale Funktion ermöglicht das Zurücksetzen des Hover-Zustands in Drop Areas.
    resetDropAreaContentHover?: () => void;
  }
}

export {};
