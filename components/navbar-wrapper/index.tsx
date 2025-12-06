'use client'

import { usePathname } from 'next/navigation'

import { Semester } from '@/types'

import Navbar from '../navbar'
import SubNavbar from '../sub-navbar'

export default function NavbarWrapper({
  semesters,
}: {
  semesters: Semester[]
}) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'

  if (isLoginPage) return null

  return (
    <>
      <Navbar semesters={semesters} />
      <SubNavbar />
    </>
  )
}
