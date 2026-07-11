"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"

export function MarketingGuard() {
  const { user, isAuthenticated, hydrated } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (hydrated && isAuthenticated && user?.role) {
      if (
        (user.role === 'Admin' || user.role === 'Agent') && 
        pathname !== '/settings' && 
        !pathname.startsWith('/properties')
      ) {
        router.replace(`/dashboard/${user.role.toLowerCase()}`)
      }
    }
  }, [hydrated, isAuthenticated, user, router, pathname])

  return null
}
