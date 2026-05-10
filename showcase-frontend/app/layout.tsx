import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Taskbar } from '@/components/Taskbar';
import { GdprConsent } from '@/components/GdprConsent';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
    title: 'My Online CV',
    description: 'Personal portfolio and contact page'
};

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                {children}

                <GdprConsent />
                <Taskbar />
            </body>
        </html>
    );
}
