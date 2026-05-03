'use client'

import { api } from '@/convex/_generated/api'
import { useConvexAuth, useQuery } from 'convex/react'
import { DEFAULT_CLASS_SEEDS } from '@/lib/default-classes'

type UserClass = {
  _id: string
  name: string
  code: string
  description: string
  topics: string[]
  order: number
  hasProgram: boolean
  isDefault: boolean
  createdAt: number
  updatedAt: number
}

const FALLBACK_CLASSES: UserClass[] = DEFAULT_CLASS_SEEDS.map((classItem) => ({
  _id: `default-${classItem.code}`,
  name: classItem.name,
  code: classItem.code,
  description: classItem.description,
  topics: [...classItem.topics],
  order: classItem.order,
  hasProgram: true,
  isDefault: true,
  createdAt: 0,
  updatedAt: 0,
}))

export function useUserClasses() {
  const { isAuthenticated, isLoading } = useConvexAuth()
  const storedClasses = useQuery(
    api.classes.listForCurrentUser,
    isAuthenticated ? {} : 'skip',
  )
  const classes =
    storedClasses && storedClasses.length > 0
      ? storedClasses
      : isAuthenticated
        ? FALLBACK_CLASSES
        : []

  return {
    classes,
    isLoading: isLoading || (isAuthenticated && storedClasses === undefined),
    isAuthenticated,
  }
}
