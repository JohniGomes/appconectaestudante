import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Conecta Estudante",
  description: "Protótipo funcional: cadastro, login e presença por reconhecimento facial.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#F3F6FB] text-[#14213D] font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
