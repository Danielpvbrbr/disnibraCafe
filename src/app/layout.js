"use client"; // Precisamos disso para usar o usePathname

import { Geist, Geist_Mono } from "next/font/google";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar/page";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const pathname = usePathname();

  // Verifica se a página atual começa com "/mesa/"
  // Se for a página do cliente, não mostramos a Sidebar
  const isCustomerPage = pathname.startsWith("/mesa/");

  return (
    <html lang="pt-br">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-50 dark:bg-zinc-950`}>
        <div className="flex">
          {/* Só renderiza a Sidebar se NÃO for página de mesa do cliente */}
          {!isCustomerPage && <Sidebar />}
          
          <main className="flex-1 min-h-screen">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}