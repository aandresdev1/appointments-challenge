// Logger utility for consistent logging across all services

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  service?: string;
  requestId?: string;
  data?: any;
}

class Logger {
  private service: string;

  constructor(service: string) {
    this.service = service;
  }

  private log(level: LogLevel, message: string, data?: any, requestId?: string): void {
    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      service: this.service,
      requestId,
      ...(data && { data }),
    };

    // In AWS Lambda, console.log writes to CloudWatch
    console.log(JSON.stringify(logEntry));
  }

  debug(message: string, data?: any, requestId?: string): void {
    this.log(LogLevel.DEBUG, message, data, requestId);
  }

  info(message: string, data?: any, requestId?: string): void {
    this.log(LogLevel.INFO, message, data, requestId);
  }

  warn(message: string, data?: any, requestId?: string): void {
    this.log(LogLevel.WARN, message, data, requestId);
  }

  error(message: string, error?: Error | any, requestId?: string): void {
    const errorData =
      error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : error;

    this.log(LogLevel.ERROR, message, errorData, requestId);
  }
}

// Factory function to create service-specific loggers
export const createLogger = (serviceName: string): Logger => {
  return new Logger(serviceName);
};

// Default logger for shared utilities
export const logger = createLogger('shared');
