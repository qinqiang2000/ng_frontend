import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { redisService } from '../config/redis';
import { SessionData, SessionConfig, SessionOptions } from '../types/session';
import crypto from 'crypto';
import logger from '../utils/logger';

export class SessionMiddleware {
    private config: SessionConfig;

    constructor(config?: Partial<SessionConfig>) {
        const defaultOptions: SessionOptions = {
            maxAge: 24 * 60 * 60, // 24 hours in seconds
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            sameSite: 'lax',
            path: '/'
        };

        this.config = {
            sessionName: config?.sessionName || 'taxflow_session',
            secret: config?.secret || process.env.SESSION_SECRET || 'default-secret-change-in-production',
            maxAge: config?.maxAge || 24 * 60 * 60,
            options: { ...defaultOptions, ...config?.options }
        };
    }

    generateSessionId(): string {
        return crypto.randomBytes(32).toString('hex');
    }

    createSessionData(data: Partial<SessionData> = {}): SessionData {
        const now = Date.now();
        const sessionId = this.generateSessionId();

        return {
            sessionId,
            createdAt: now,
            lastAccessAt: now,
            expiresAt: now + (this.config.maxAge * 1000),
            ...data
        };
    }

    async createSession(data: Partial<SessionData> = {}): Promise<SessionData> {
        const sessionData = this.createSessionData(data);
        // 设置一个默认值050
        if (sessionData.ssoUserInfo && !sessionData.ssoUserInfo.orgId) {
            sessionData.ssoUserInfo.orgId = '050';
        }

        // Store in Redis with TTL
        await redisService.set(
            `session:${sessionData.sessionId}`,
            JSON.stringify(sessionData),
            this.config.maxAge
        );

        logger.info('Session created', {
            sessionId: sessionData.sessionId.substring(0, 8) + '...',
            username: sessionData.ssoUserInfo?.username,
            maxAge: this.config.maxAge
        });

        return sessionData;
    }

    async getSession(sessionId: string): Promise<SessionData | null> {
        try {
            const sessionJson = await redisService.get(`session:${sessionId}`);

            if (!sessionJson) {
                return null;
            }

            const sessionData: SessionData = JSON.parse(sessionJson);

            // Check if session is expired
            if (sessionData.expiresAt < Date.now()) {
                logger.warn('Session expired', {
                    sessionId: sessionId.substring(0, 8) + '...',
                    username: sessionData.ssoUserInfo?.username,
                    expiresAt: new Date(sessionData.expiresAt).toISOString()
                });
                await this.destroySession(sessionId);
                return null;
            }

            // Update last access time
            sessionData.lastAccessAt = Date.now();
            await this.updateSession(sessionData);

            return sessionData;
        } catch (error) {
            logger.error('Error getting session', {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                sessionId: sessionId.substring(0, 8) + '...'
            });
            return null;
        }
    }

    async updateSession(sessionData: SessionData): Promise<void> {
        await redisService.set(
            `session:${sessionData.sessionId}`,
            JSON.stringify(sessionData),
            this.config.maxAge
        );
    }

    async updateAccessToken(sessionId: string, newAccessToken: string): Promise<void> {
        try {
            const sessionData = await this.getSession(sessionId);
            if (!sessionData) {
                logger.warn('Cannot update access token: session not found', {
                    sessionId: sessionId.substring(0, 8) + '...'
                });
                return;
            }

            if (sessionData.ssoUserInfo) {
                sessionData.ssoUserInfo.accessToken = newAccessToken;
                sessionData.lastAccessAt = Date.now();
                
                await this.updateSession(sessionData);
                
                logger.info('Access token updated successfully', {
                    sessionId: sessionId.substring(0, 8) + '...',
                    username: sessionData.ssoUserInfo.username
                });
            } else {
                logger.warn('Cannot update access token: no SSO user info in session', {
                    sessionId: sessionId.substring(0, 8) + '...'
                });
            }
        } catch (error) {
            logger.error('Error updating access token', {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                sessionId: sessionId.substring(0, 8) + '...'
            });
            throw error;
        }
    }

    async destroySession(sessionId: string): Promise<void> {
        await redisService.del(`session:${sessionId}`);
        logger.info('Session destroyed', {
            sessionId: sessionId.substring(0, 8) + '...'
        });
    }

    async refreshSession(sessionId: string): Promise<SessionData | null> {
        const sessionData = await this.getSession(sessionId);

        if (!sessionData) {
            return null;
        }

        // Extend expiration time
        sessionData.expiresAt = Date.now() + (this.config.maxAge * 1000);
        await this.updateSession(sessionData);

        return sessionData;
    }

    setSessionCookie(response: NextResponse, sessionId: string): void {
        const cookieOptions = {
            maxAge: this.config.maxAge,
            secure: this.config.options.secure || false,
            httpOnly: this.config.options.httpOnly || true,
            sameSite: this.config.options.sameSite as 'strict' | 'lax' | 'none' | undefined,
            path: this.config.options.path || '/'
        };

        response.cookies.set(this.config.sessionName, sessionId, cookieOptions);
    }

    clearSessionCookie(response: NextResponse): void {
        response.cookies.delete(this.config.sessionName);
    }

    async getSessionFromRequest(request: NextRequest): Promise<SessionData | null> {
        const sessionId = request.cookies.get(this.config.sessionName)?.value;

        if (!sessionId) {
            return null;
        }

        return await this.getSession(sessionId);
    }

    async requireAuth(request: NextRequest, response: NextResponse): Promise<SessionData | null> {
        const session = await this.getSessionFromRequest(request);

        if (!session || !session.ssoUserInfo?.username) {
            response.headers.set('Location', '/login');
            return null;
        }

        return session;
    }

    async middleware(
        request: NextRequest,
        handler: (req: NextRequest, session: SessionData | null) => Promise<NextResponse>
    ): Promise<NextResponse> {
        const session = await this.getSessionFromRequest(request);
        return await handler(request, session);
    }
}

// Default session middleware instance
const sessionMiddleware = new SessionMiddleware();

export { sessionMiddleware };