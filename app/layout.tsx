import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Navbar from '@/components/navbar'
import SubNavbar from '@/components/sub-navbar'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'AcademIA',
  description: 'Plataforma inteligente de apoyo académico para estudiantes',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />
        <SubNavbar />
        {children}
      </body>
    </html>
  )
}
