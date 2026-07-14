"use client"

import { useEffect, useState } from "react"
import { RoleGuard } from "@/components/layout/RoleGuard"
import { useAuthStore } from "@/store/authStore"
import { ShieldAlert, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, updateUser } = useAuthStore()
  const [checking, setChecking] = useState(false)
  const isPending = user?.role === 'Agent' && user?.isVerified === false

  const checkStatus = async () => {
    if (!user) return
    setChecking(true)
    try {
      const res = await api.get('/users/me')
      if (res.data && res.data.isVerified !== undefined) {
        updateUser({ isVerified: res.data.isVerified })
      }
    } catch (err) {
      console.error("Failed to check verification status:", err)
    } finally {
      setChecking(false)
    }
  }

  useEffect(() => {
    if (isPending) {
      checkStatus()
    }
  }, [isPending])

  return (
    <RoleGuard allowedRoles={['Agent']}>
      <div className="relative min-h-[calc(100vh-64px)]">
        <div>
          {children}
        </div>
        
        {isPending && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/90 backdrop-blur-[200px]">
            <div className="flex flex-col items-center justify-center space-y-6 max-w-md mx-auto text-center p-8 bg-background border rounded-2xl shadow-2xl">
              <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center">
                <ShieldAlert className="h-12 w-12 text-primary" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Account Pending Verification</h1>
              <p className="text-muted-foreground text-lg">
                Your professional agent profile is currently under review by our administration team. 
              </p>
              <p className="text-sm text-muted-foreground">
                We will notify you via email once your account has been approved and you can access your dashboard.
              </p>
              <Button onClick={checkStatus} disabled={checking} className="mt-4 gap-2">
                <RefreshCw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
                {checking ? 'Checking...' : 'Check Status'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  )
}
