export interface TenantInfo {
  id: number;
  tenantType: number;
  url: string;
  clientId: string;
  clientSecret?: string; // Hidden in responses
  username: string;
  accountId: string;
  domain: string;
  active: number;
  createTime: string;
  updateTime: string;
}

export interface KingdeeSsoUserInfo {
  username: string;
  displayName: string;
  email?: string;
  mobile?: string;
  accountId: string;
  tenantId?: string;
  language: string;
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  realUsername?: string;
  workNumber?: string;
  orgId?: string;
  orgName?: string;
  orgCode?: string;
  orgType?: string;
}

export interface SessionData {
  sessionId: string;
  createdAt: number;
  lastAccessAt: number;
  expiresAt: number;
  domain?: string;
  tenantInfo?: TenantInfo;
  ssoUserInfo?: KingdeeSsoUserInfo;
  [key: string]: any;
}

export interface SessionOptions {
  maxAge?: number; // in seconds
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  domain?: string;
  path?: string;
}

export interface SessionConfig {
  sessionName: string;
  secret: string;
  maxAge: number;
  options: SessionOptions;
}