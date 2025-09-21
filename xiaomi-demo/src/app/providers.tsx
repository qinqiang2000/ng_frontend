'use client';

import { CountryProvider } from "@/client/contexts/CountryContext";
import { LanguageProvider } from "@/client/contexts/LanguageContext";
import { ToastProvider } from "@/client/components/ui/ToastContainer";
import { AuthProvider } from "@/client/contexts/AuthContext";
import { usePathname } from 'next/navigation';

// 需要客户端 AuthContext 的页面路径
const PAGES_NEEDING_AUTH_CONTEXT = [
  '/sso/callback'
];

function ConditionalAuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 检查当前页面是否需要 AuthContext
  const needsAuthContext = PAGES_NEEDING_AUTH_CONTEXT.some(path =>
    pathname.startsWith(path)
  );

  if (needsAuthContext) {
    return <AuthProvider>{children}</AuthProvider>;
  }

  // 对于其他页面，直接返回 children，避免不必要的 AuthContext 调用
  return <>{children}</>;
}

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConditionalAuthProvider>
      <LanguageProvider>
        <CountryProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </CountryProvider>
      </LanguageProvider>
    </ConditionalAuthProvider>
  );
}