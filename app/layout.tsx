import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import NavbarWrapper from '@/components/navbar-wrapper'
import { Semester } from '@/types'

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL
  let semesters: Semester[] = []

  if (baseUrl) {
    try {
      const res = await fetch(`${baseUrl}/semesters/user/1`)
      if (res.ok) {
        semesters = await res.json()
      }
    } catch {
      console.error('Error fetching semesters')
    }
  }
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NavbarWrapper semesters={semesters} />
        {children}
      </body>
    </html>
  )
}
