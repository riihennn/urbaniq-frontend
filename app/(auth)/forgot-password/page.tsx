"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import api from "@/lib/api"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setMessage("")
    setLoading(true)

    try {
      const response = await api.post("/auth/forgot-password", { email })
      setMessage(response.data.message || "Reset code sent successfully")
      
      // Redirect to reset password after 2 seconds
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`)
      }, 1500)
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || "Failed to send reset code")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2 text-left">
        <h1 className="text-3xl font-bold tracking-tight">Reset Password</h1>
        <p className="text-muted-foreground">
          Enter your email and we will send you a 6-digit security code.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && <div className="text-sm text-red-500 font-medium">{error}</div>}
        {message && <div className="text-sm text-green-500 font-medium">{message}</div>}
        
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none" htmlFor="email">
            Email Address
          </label>
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            <Input 
              id="email" 
              type="email" 
              placeholder="name@company.com" 
              className="pl-10 bg-muted/50" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
        </div>

        <Button className="w-full h-12 text-base" disabled={loading}>
          {loading ? "Sending Code..." : "Continue"}
        </Button>
      </form>

      <p className="px-8 text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  )
}
