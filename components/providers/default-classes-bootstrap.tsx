'use client'

import { useEffect, useRef } from 'react'
import { api } from '@/convex/_generated/api'
import { DEFAULT_CLASS_SEEDS } from '@/lib/default-classes'
import { useConvexAuth, useMutation, useQuery } from 'convex/react'

export default function DefaultClassesBootstrap() {
  const { isAuthenticated, isLoading } = useConvexAuth()
  const classes = useQuery(
    api.classes.listForCurrentUser,
    isAuthenticated ? {} : 'skip',
  )
  const ensureDefaults = useMutation(api.classes.ensureDefaults)
  const hasTriggered = useRef(false)
  const needsLegacyMigration = Boolean(
    classes?.some(
      (item) => item.code === 'EFI-01' || item.name === 'Educación Física',
    ),
  )
  const defaultClassCount = DEFAULT_CLASS_SEEDS.length
  const defaultClasses = classes?.filter((item) => item.isDefault) ?? []
  const hasDuplicateDefaultCodes =
    new Set(defaultClasses.map((item) => item.code)).size !==
    defaultClasses.length
  const needsNormalization =
    needsLegacyMigration ||
    defaultClasses.length !== defaultClassCount ||
    hasDuplicateDefaultCodes

  useEffect(() => {
    if (
      isLoading ||
      !isAuthenticated ||
      classes === undefined ||
      (classes.length > 0 && !needsNormalization) ||
      hasTriggered.current
    ) {
      return
    }

    hasTriggered.current = true
    void ensureDefaults({})
  }, [classes, ensureDefaults, isAuthenticated, isLoading, needsNormalization])

  return null
}
