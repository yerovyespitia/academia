'use client'

import { usePathname } from 'next/navigation'

import { Semester } from '@/types'

import Navbar from '../navbar'

export default function NavbarWrapper({
  semesters,
}: {
  semesters: Semester[]
}) {
  const pathname = usePathname()

  if (pathname === '/' || pathname === '/login' || pathname === '/onboarding') return null

  return <Navbar semesters={semesters} />
}
