'use client'

import type { ReactNode } from 'react'
import { ConvexAuthNextjsProvider } from '@convex-dev/auth/nextjs'
import { ConvexReactClient } from 'convex/react'

import DefaultClassesBootstrap from '@/components/providers/default-classes-bootstrap'

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode
}) {
  return (
    <ConvexAuthNextjsProvider client={convex}>
      <DefaultClassesBootstrap />
      {children}
    </ConvexAuthNextjsProvider>
  )
}
