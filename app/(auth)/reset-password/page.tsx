"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import api from "@/lib/api"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const emailParam = searchParams.get("email")
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setMessage("")

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)

    try {
      const response = await api.post("/auth/reset-password", { 
        email, 
        otp, 
        newPassword 
      })
      setMessage(response.data.message || "Password reset successful")
      
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || "Failed to reset password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2 text-left">
        <h1 className="text-3xl font-bold tracking-tight">New Password</h1>
        <p className="text-muted-foreground">
          Enter the code sent to your email and your new password.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && <div className="text-sm text-red-500 font-medium">{error}</div>}
        {message && <div className="text-sm text-green-500 font-medium">{message}</div>}
        
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none" htmlFor="email">
            Email Address
          </label>
          <Input 
            id="email" 
            type="email" 
            className="bg-muted/50" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none" htmlFor="otp">
            Verification Code
          </label>
          <Input 
            id="otp" 
            type="text" 
            placeholder="6-digit code" 
            maxLength={6}
            className="bg-muted/50 text-center tracking-widest text-lg font-bold" 
            value={otp} 
            onChange={(e) => setOtp(e.target.value)} 
            required 
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none" htmlFor="newPassword">
            New Password
          </label>
          <Input 
            id="newPassword" 
            type="password" 
            placeholder="••••••••" 
            minLength={6}
            className="bg-muted/50" 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)} 
            required 
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none" htmlFor="confirmPassword">
            Confirm New Password
          </label>
          <Input 
            id="confirmPassword" 
            type="password" 
            placeholder="••••••••" 
            className="bg-muted/50" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            required 
          />
        </div>

        <Button className="w-full h-12 text-base" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </Button>
      </form>

      <p className="px-8 text-center text-sm text-muted-foreground">
        Go back to{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Login
        </Link>
      </p>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-40">
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
