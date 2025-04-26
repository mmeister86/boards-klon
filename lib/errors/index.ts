// Re-export alle Fehlertypen
export * from './types';
export * from './specific';
export * from './utils';
export * from './boundaries';

// Exportiere auch die Standard-Fehlermeldungen
export const DEFAULT_ERROR_MESSAGES = {
  UNKNOWN: 'Ein unerwarteter Fehler ist aufgetreten.',
  NETWORK: 'Bitte überprüfen Sie Ihre Internetverbindung.',
  AUTH: 'Bitte melden Sie sich erneut an.',
  DATABASE: 'Ein Datenbankfehler ist aufgetreten.',
  VALIDATION: 'Bitte überprüfen Sie Ihre Eingaben.',
  BUSINESS: 'Die Aktion konnte nicht ausgeführt werden.',
} as const;
