import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "留学顾问助手",
  description: "AI 辅助咨询分析与跟进管理工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
