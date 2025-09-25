import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brage Støfringshaug - Developer",
  description: "Interactive terminal-style portfolio",
  icons: {
    icon: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" fill="%231a1a1a" rx="6"/><rect x="6" y="6" width="20" height="20" fill="%23374151" rx="4"/><text x="16" y="20" text-anchor="middle" fill="%23a855f7" font-family="monospace" font-size="12" font-weight="bold">&gt;</text></svg>',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="terminal-text">
        {children}
      </body>
    </html>
  );
}
