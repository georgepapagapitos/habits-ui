class Logger {
  private isProduction: boolean;

  constructor() {
    this.isProduction = import.meta.env.PROD || false;
  }

  debug(...args: unknown[]): void {
    if (!this.isProduction) {
      // eslint-disable-next-line no-console
      console.debug(...args);
    }
  }

  info(...args: unknown[]): void {
    if (!this.isProduction) {
      // eslint-disable-next-line no-console
      console.info(...args);
    }
  }

  warn(...args: unknown[]): void {
    // Warnings are shown in all environments
    console.warn(...args);
  }

  error(...args: unknown[]): void {
    // Errors are shown in all environments
    console.error(...args);
  }
}

// Single instance to use throughout the app
export const logger = new Logger();
