/**
 * Logging utility for rescue agents
 */

type LogLevel = 'info' | 'success' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  agent?: string;
  timestamp: Date;
}

class Logger {
  private logs: LogEntry[] = [];

  info(message: string, data?: any, agent?: string): void {
    this.log('info', message, data, agent);
  }

  success(message: string, data?: any, agent?: string): void {
    this.log('success', message, data, agent);
  }

  warn(message: string, data?: any, agent?: string): void {
    this.log('warn', message, data, agent);
  }

  error(message: string, data?: any, agent?: string): void {
    this.log('error', message, data, agent);
  }

  private log(level: LogLevel, message: string, data?: any, agent?: string): void {
    const entry: LogEntry = {
      level,
      message,
      data,
      agent,
      timestamp: new Date()
    };

    this.logs.push(entry);

    // Console output with colors
    const prefix = agent ? `[${agent}]` : '';
    const emoji = this.getEmoji(level);
    const color = this.getColor(level);

    console.log(`${emoji} ${prefix} ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }

  private getEmoji(level: LogLevel): string {
    switch (level) {
      case 'info': return 'ℹ️';
      case 'success': return '✅';
      case 'warn': return '⚠️';
      case 'error': return '❌';
    }
  }

  private getColor(level: LogLevel): string {
    switch (level) {
      case 'info': return '\x1b[36m'; // Cyan
      case 'success': return '\x1b[32m'; // Green
      case 'warn': return '\x1b[33m'; // Yellow
      case 'error': return '\x1b[31m'; // Red
    }
  }

  getLogs(): LogEntry[] {
    return this.logs;
  }
}

let loggerInstance: Logger;

export function getLogger(): Logger {
  if (!loggerInstance) {
    loggerInstance = new Logger();
  }
  return loggerInstance;
}
