import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { loggerConfig } from '../config/logger';
import { getFormattedTraceId } from './traceId';

// 获取当天的日志文件名
const getTodayLogFileName = (type: 'info' | 'error'): string => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const logDir = loggerConfig.getLogDir();

    // 确保日志目录存在
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }

    return path.join(logDir, `${type}-${today}.log`);
};

// 创建链接到当前日志文件
const createSymlink = (type: 'info' | 'error'): void => {
    const logDir = loggerConfig.getLogDir();
    const todayFile = getTodayLogFileName(type);
    const linkPath = path.join(logDir, `${type}.log`);

    try {
        // 删除已存在的链接
        if (fs.existsSync(linkPath)) {
            // 检查是否是目录（Junction）或文件
            const stat = fs.lstatSync(linkPath);
            if (stat.isDirectory()) {
                fs.rmSync(linkPath, { recursive: true, force: true });
            } else {
                fs.unlinkSync(linkPath);
            }
        }

        // Windows 系统的多种链接尝试策略
        if (process.platform === 'win32') {
            // 方法 1: 尝试硬链接（不需要管理员权限）
            try {
                fs.linkSync(todayFile, linkPath);
                return;
            } catch (hardLinkError) {
                // 硬链接失败，尝试复制文件作为备选方案
                try {
                    fs.copyFileSync(todayFile, linkPath);
                    return;
                } catch (copyError) {
                    // 复制也失败，静默忽略
                }
            }
        } else {
            // Linux/macOS 使用软链接
            fs.symlinkSync(path.basename(todayFile), linkPath);
        }
    } catch (error) {
        // 所有方法都失败，静默忽略
        // 用户仍然可以通过带日期的文件名访问日志
    }
};

// 创建自定义时间格式
const customTimestamp = winston.format((info) => {
    info.timestamp = loggerConfig.getFormatConfig().timestamp();
    return info;
});

// 创建日志格式
const createLogFormat = () => {
    return winston.format.combine(
        customTimestamp(),
        winston.format.errors({ stack: true }),
        winston.format.printf((info) => {
            const { timestamp, level, message, ...meta } = info;
            const traceId = getFormattedTraceId();
            let log = `${timestamp} [${level.toUpperCase()}]${traceId}`;

            // 如果有message，直接添加
            if (message !== undefined) {
                log += ` ${message}`;
            }

            // 如果有其他元数据，以 JSON 格式附加
            if (Object.keys(meta).length > 0) {
                log += ` ${JSON.stringify(meta)}`;
            }

            return log;
        })
    );
};

// 创建 logger
const createLogger = () => {
    const logFormat = createLogFormat();

    // 创建软链接
    createSymlink('info');
    createSymlink('error');

    const infoTransport = new winston.transports.File({
        filename: getTodayLogFileName('info'),
        level: loggerConfig.getLevel(),
        format: logFormat
    });

    const errorTransport = new winston.transports.File({
        filename: getTodayLogFileName('error'),
        level: 'error',
        format: logFormat
    });

    const logger = winston.createLogger({
        level: loggerConfig.getLevel(),
        transports: [infoTransport, errorTransport],
        exitOnError: false
    });

    // 开发环境控制台输出
    const consoleConfig = loggerConfig.getConsoleConfig();
    if (consoleConfig.enabled) {
        logger.add(new winston.transports.Console({
            level: consoleConfig.level,
            format: winston.format.combine(
                winston.format.colorize(),
                customTimestamp(),
                winston.format.printf((info) => {
                    const { timestamp, level, message, ...meta } = info;
                    const traceId = getFormattedTraceId();
                    let log = `[${timestamp}] [${level}]${traceId}`;

                    // 如果有message，直接添加
                    if (message !== undefined) {
                        log += ` ${message}`;
                    }

                    // 如果有其他元数据，以 JSON 格式附加
                    if (Object.keys(meta).length > 0) {
                        log += ` ${JSON.stringify(meta)}`;
                    }
                    return log;
                })
            )
        }));
    }

    // 处理未捕获的异常和Promise拒绝
    logger.exceptions.handle(
        new winston.transports.File({
            filename: getTodayLogFileName('error'),
            handleExceptions: true
        })
    );

    logger.rejections.handle(
        new winston.transports.File({
            filename: getTodayLogFileName('error'),
            handleRejections: true
        })
    );

    return logger;
};

// 日期变更检查和日志轮转
let lastLogDate = new Date().toDateString();
const checkAndRotateLogs = () => {
    const currentDate = new Date().toDateString();
    if (currentDate !== lastLogDate) {
        lastLogDate = currentDate;
        // 重新创建 logger 以使用新的日志文件
        Object.assign(logger, createLogger());
    }
};

// 每小时检查一次日期变更（用于日志轮转）
setInterval(checkAndRotateLogs, 60 * 60 * 1000); // 1 hour

const logger = createLogger();

// 格式化参数的辅助函数 - 保持原始格式
const formatLogArgs = (...args: any[]): string => {
    if (args.length === 0) {
        return '';
    }

    // 将所有参数转换为字符串并用空格连接，保持原始格式
    return args.map(arg => {
        if (typeof arg === 'string') {
            return arg;
        } else if (typeof arg === 'object' && arg !== null) {
            return JSON.stringify(arg);
        } else {
            return String(arg);
        }
    }).join(' ');
};

// 导出灵活的接口 - 保持原始格式
export default {
    info: (...args: any[]) => {
        const message = formatLogArgs(...args);
        logger.info(message);
    },
    error: (...args: any[]) => {
        const message = formatLogArgs(...args);
        logger.error(message);
    },
    warn: (...args: any[]) => {
        const message = formatLogArgs(...args);
        logger.warn(message);
    },
    debug: (...args: any[]) => {
        const message = formatLogArgs(...args);
        logger.debug(message);
    }
};