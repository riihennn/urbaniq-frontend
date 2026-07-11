"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"

export function RoleGuard({ 
  allowedRoles, 
  children 
}: { 
  allowedRoles: string[], 
  children: React.ReactNode 
}) {
  const { user, isAuthenticated, hydrated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      if (!user?.role || !allowedRoles.includes(user.role)) {
        if (user?.role === 'Buyer' || user?.role === 'Owner') {
          router.replace('/')
        } else if (user?.role) {
          router.replace(`/dashboard/${user.role.toLowerCase()}`)
        } else {
          router.replace('/login')
        }
      }
    }
  }, [hydrated, isAuthenticated, user, router, allowedRoles])

  if (!hydrated || !isAuthenticated) return null
  if (user?.role && !allowedRoles.includes(user.role)) return null

  return <>{children}</>
}
