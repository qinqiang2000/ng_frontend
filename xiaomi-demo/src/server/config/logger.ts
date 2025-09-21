import path from 'path';

export interface LoggerConfig {
    logDir: string;
    level: string;
    file: {
        datePattern: string;
        maxSize: string;
        maxFiles: string;
        zippedArchive: boolean;
    };
    format: {
        timestamp: () => string;
    };
    console: {
        enabled: boolean;
        level: string;
    };
}

class LoggerConfigService {
    private config: LoggerConfig;

    constructor() {
        const isDevelopment = process.env.NODE_ENV === 'development';

        this.config = {
            logDir: process.env.LOG_DIR || path.join(process.cwd(), 'logs'),
            level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),

            file: {
                datePattern: 'YYYY-MM-DD',
                maxSize: '20m',
                maxFiles: '30d',
                zippedArchive: false
            },

            format: {
                timestamp: () => {
                    const now = new Date();
                    const year = now.getFullYear();
                    const month = String(now.getMonth() + 1).padStart(2, '0');
                    const day = String(now.getDate()).padStart(2, '0');
                    const hours = String(now.getHours()).padStart(2, '0');
                    const minutes = String(now.getMinutes()).padStart(2, '0');
                    const seconds = String(now.getSeconds()).padStart(2, '0');
                    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

                    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds},${milliseconds}`;
                }
            },

            console: {
                enabled: isDevelopment,
                level: 'debug'
            }
        };
    }

    getConfig(): LoggerConfig {
        return this.config;
    }

    getLogDir(): string {
        return this.config.logDir;
    }

    getLevel(): string {
        return this.config.level;
    }

    getFileConfig() {
        return this.config.file;
    }

    getFormatConfig() {
        return this.config.format;
    }

    getConsoleConfig() {
        return this.config.console;
    }

    // 简化的配置，不再需要 DailyRotateFile 特定选项
}

const loggerConfig = new LoggerConfigService();

export { loggerConfig, LoggerConfigService };