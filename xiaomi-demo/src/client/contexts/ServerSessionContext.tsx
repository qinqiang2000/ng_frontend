'use client';

import React, { createContext, useContext, ReactNode } from 'react';

// 定义服务端 session 信息的类型，与 SsoController.getSession 返回的 userInfo 结构一致
export interface ServerUserInfo {
  username: string;
  displayName: string;
  email?: string;
  mobile?: string;
  language?: string;
  domain: string;
  orgId?: string;
  orgName?: string;
  realUsername?: string;
}

export interface ServerTenantInfo {
  domain: string;
  url: string;
  username: string;
  active: number;
}

export interface ServerSessionData {
  user: ServerUserInfo;
  tenant: ServerTenantInfo | null;
}

interface ServerSessionContextType {
  sessionData: ServerSessionData | null;
  isAuthenticated: boolean;
}

const ServerSessionContext = createContext<ServerSessionContextType | undefined>(undefined);

export const useServerSession = () => {
  const context = useContext(ServerSessionContext);
  if (context === undefined) {
    // 如果没有 Provider，返回默认的空状态，而不是抛出错误
    return {
      sessionData: null,
      isAuthenticated: false,
    };
  }
  return context;
};

interface ServerSessionProviderProps {
  children: ReactNode;
  sessionData: ServerSessionData | null;
}

export const ServerSessionProvider: React.FC<ServerSessionProviderProps> = ({
  children,
  sessionData
}) => {
  const isAuthenticated = sessionData !== null;

  const contextValue: ServerSessionContextType = {
    sessionData,
    isAuthenticated,
  };

  return (
    <ServerSessionContext.Provider value={contextValue}>
      {children}
    </ServerSessionContext.Provider>
  );
};
