import type { Metadata } from "next";
import "./globals.css";
import { fontVariables } from "@/lib/fonts";
import { Providers } from "./Providers";

export const metadata: Metadata = {
  title: "What A Simple Dash",
  description: "A self-hosted dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={fontVariables}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
