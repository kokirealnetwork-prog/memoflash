import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MemoFlash",
  description: "A notepad-style flashcard app with AI auto-complete and long-press reveal functionality.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MemoFlash",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
