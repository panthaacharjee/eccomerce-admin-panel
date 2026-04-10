// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import ReduxProvider from "@/components/Provider/ReduxProvider";
import UserProvider from "@/components/Provider/UserProvider";
import Session from "@/components/Provider/SessionProvider";
import { useSession } from "next-auth/react";
import AuthProvider from "@/components/Provider/AuthProvider";
import ToastProvider from "@/components/Provider/ToastProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ShopSphere Admin | E-commerce Dashboard",
  description:
    "Modern e-commerce admin panel with analytics and management tools",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxProvider>
          <Session>
            <UserProvider>
              <AuthProvider>
                {children}
                <ToastProvider />
              </AuthProvider>
            </UserProvider>
          </Session>
        </ReduxProvider>
      </body>
    </html>
  );
}
