import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const kanit = Kanit({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-kanit",
});

export const metadata: Metadata = {
  title: "Smart POS - ระบบจัดการหน้าร้าน",
  description: "ระบบจัดการหน้าร้านออนไลน์",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body
        className={`${kanit.variable} font-sans antialiased bg-gray-50 text-slate-800`}
        suppressHydrationWarning
      >
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  );
}
