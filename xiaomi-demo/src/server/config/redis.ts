import { createClient, RedisClientType } from 'redis';
import logger from '../utils/logger';

interface RedisConfig {
    host: string;
    port: number;
    password?: string;
    database?: number;
    keyPrefix?: string;
}

class RedisService {
    private client: RedisClientType | null = null;
    private config: RedisConfig;

    constructor() {
        this.config = {
            host: process.env.REDIS_HOST || '172.18.64.40',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
            password: process.env.REDIS_PASSWORD || '',
            database: parseInt(process.env.REDIS_DATABASE || '3', 10),
            keyPrefix: process.env.REDIS_KEY_PREFIX || 'taxflow-web:'
        };
    }

    async connect(): Promise<RedisClientType> {
        if (this.client && this.client.isOpen) {
            return this.client;
        }

        try {
            const clientConfig: any = {
                socket: {
                    host: this.config.host,
                    port: this.config.port,
                },
                database: this.config.database,
            };

            if (this.config.password && this.config.password.trim() !== '') {
                clientConfig.password = this.config.password;
            }

            this.client = createClient(clientConfig);

            this.client.on('error', (err) => {
                logger.error('Redis Client Error', {
                    error: err.message,
                    stack: err.stack,
                    host: this.config.host,
                    port: this.config.port
                });
            });

            this.client.on('connect', () => {
                logger.info('Redis Client Connected');
            });

            this.client.on('ready', () => {
                logger.info('Redis Client Ready');
            });

            this.client.on('end', () => {
                logger.info('Redis Client Disconnected');
            });

            await this.client.connect();
            return this.client;
        } catch (error) {
            logger.error('Failed to connect to Redis', {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                host: this.config.host,
                port: this.config.port
            });
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        if (this.client && this.client.isOpen) {
            await this.client.disconnect();
            this.client = null;
        }
    }

    getClient(): RedisClientType | null {
        return this.client;
    }

    isConnected(): boolean {
        return this.client !== null && this.client.isOpen;
    }

    getKeyWithPrefix(key: string): string {
        return `${this.config.keyPrefix}${key}`;
    }

    async set(key: string, value: string, ttlInSeconds?: number): Promise<void> {
        const client = await this.connect();
        const prefixedKey = this.getKeyWithPrefix(key);

        if (ttlInSeconds) {
            await client.setEx(prefixedKey, ttlInSeconds, value);
        } else {
            await client.set(prefixedKey, value);
        }
    }

    async get(key: string): Promise<string | null> {
        const client = await this.connect();
        const prefixedKey = this.getKeyWithPrefix(key);
        return await client.get(prefixedKey);
    }

    async del(key: string): Promise<void> {
        const client = await this.connect();
        const prefixedKey = this.getKeyWithPrefix(key);
        await client.del(prefixedKey);
    }

    async exists(key: string): Promise<boolean> {
        const client = await this.connect();
        const prefixedKey = this.getKeyWithPrefix(key);
        const result = await client.exists(prefixedKey);
        return result === 1;
    }

    async expire(key: string, ttlInSeconds: number): Promise<void> {
        const client = await this.connect();
        const prefixedKey = this.getKeyWithPrefix(key);
        await client.expire(prefixedKey, ttlInSeconds);
    }

    async keys(pattern: string): Promise<string[]> {
        const client = await this.connect();
        const prefixedPattern = this.getKeyWithPrefix(pattern);
        return await client.keys(prefixedPattern);
    }
}

// Singleton instance
const redisService = new RedisService();

export { redisService, RedisService, type RedisConfig };