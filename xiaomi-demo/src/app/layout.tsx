import '@ant-design/v5-patch-for-react-19';
import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
// favicon from public directory

export const metadata: Metadata = {
  title: "TaxFlow Pro - Global Tax Rules Engine Management Platform",
  description: "Enterprise-grade tax compliance and invoice processing platform with unified global tax rules engines for multinational corporations",
  icons: {
    icon: '/images/favicon.png'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress Ant Design React 19 compatibility warning
              if (typeof window !== 'undefined') {
                const originalWarn = console.warn;
                console.warn = (...args) => {
                  if (args[0]?.includes?.('antd: compatible')) return;
                  originalWarn.apply(console, args);
                };
              }
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
