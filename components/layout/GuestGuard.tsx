"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, hydrated } = useAuthStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (hydrated && isAuthenticated && user?.role) {
      if (user.role === 'Buyer' || user.role === 'Owner') {
        router.replace('/')
      } else {
        router.replace(`/dashboard/${user.role.toLowerCase()}`)
      }
    }
  }, [hydrated, isAuthenticated, user, router])

  if (!mounted) return <>{children}</>
  if (hydrated && isAuthenticated) return null

  return <>{children}</>
}
