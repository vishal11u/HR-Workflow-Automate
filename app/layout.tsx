import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "HR Workflow Designer",
  description:
    "Visually design and test internal HR workflows such as onboarding and approvals.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`${poppins.variable} antialiased`}>
        <Toaster richColors duration={2000} position="top-right" />
        {children}
      </body>
    </html>
  );
}
