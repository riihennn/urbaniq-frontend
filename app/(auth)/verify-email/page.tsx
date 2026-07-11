"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"
import Link from "next/link"

function VerifyEmailForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, setAuth } = useAuthStore()

  // Get email from query param, fallback to store user email
  const emailParam = searchParams.get("email") || ""
  const email = emailParam || (user ? user.email : "")

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""))
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [timer, setTimer] = useState(60)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Countdown timer for resend button throttling
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [timer])

  // Handle key inputs in 6-digit boxes
  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value !== "" && !/^[0-9]$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Focus next input if value entered
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        // Focus previous input and clear it
        inputRefs.current[index - 1]?.focus()
        const newOtp = [...otp]
        newOtp[index - 1] = ""
        setOtp(newOtp)
      } else {
        const newOtp = [...otp]
        newOtp[index] = ""
        setOtp(newOtp)
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").trim()
    if (!/^\d{6}$/.test(pastedData)) return

    const digits = pastedData.split("")
    setOtp(digits)
    inputRefs.current[5]?.focus()
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    
    const otpCode = otp.join("")
    if (otpCode.length !== 6) {
      setError("Please enter the complete 6-digit code.")
      return
    }

    setLoading(true)
    try {
      const response = await api.post("/auth/verify-otp", { email, otp: otpCode })
      const { accessToken, refreshToken, ...verifiedUser } = response.data
      setAuth(verifiedUser, accessToken, refreshToken)
      setSuccess("Email verified successfully! Redirecting...")
      
      setTimeout(() => {
        if (verifiedUser.role === 'Buyer' || verifiedUser.role === 'Owner') {
          router.push('/')
        } else {
          router.push(`/dashboard/${verifiedUser.role.toLowerCase()}`)
        }
      }, 1500)
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || "Verification failed. Please check the code.")
    } finally {
      setLoading(false)
    }
  };

  const handleResend = async () => {
    if (timer > 0 || resending) return
    setError("")
    setSuccess("")
    setResending(true)

    try {
      await api.post("/auth/send-otp", { email })
      setSuccess("Verification code resent successfully!")
      setTimer(60)
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || "Failed to resend verification code.")
    } finally {
      setResending(false)
    }
  };

  return (
    <div className="flex flex-col space-y-6 max-w-md w-full mx-auto">
      <div className="flex flex-col space-y-2 text-left">
        <h1 className="text-3xl font-bold tracking-tight">Verify email</h1>
        <p className="text-muted-foreground">
          We've sent a 6-digit verification code to <span className="font-semibold text-foreground">{email}</span>.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleVerify}>
        {error && <div className="text-sm text-red-500 font-medium bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>}
        {success && <div className="text-sm text-green-600 font-medium bg-green-50 p-3 rounded-lg border border-green-200">{success}</div>}

        <div className="flex justify-between gap-2 py-2">
          {otp.map((digit, index) => (
            <Input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-12 h-14 text-center text-xl font-bold rounded-xl bg-muted/50 focus:bg-background focus:ring-2 focus:ring-primary border-muted"
              disabled={loading}
              autoFocus={index === 0}
            />
          ))}
        </div>

        <Button className="w-full h-12 text-base" type="submit" disabled={loading || otp.join("").length !== 6}>
          {loading ? "Verifying..." : "Verify Code"}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        Didn't receive the code?{" "}
        {timer > 0 ? (
          <span className="font-semibold text-muted-foreground">Resend in {timer}s</span>
        ) : (
          <button 
            type="button" 
            onClick={handleResend} 
            disabled={resending}
            className="font-semibold text-primary hover:underline focus:outline-none"
          >
            {resending ? "Resending..." : "Resend Code"}
          </button>
        )}
      </div>

      <div className="text-center text-sm">
        <Link href="/login" className="text-muted-foreground hover:text-foreground hover:underline">
          Back to Login
        </Link>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col space-y-6 max-w-md w-full mx-auto text-center py-12">
        <div className="text-muted-foreground animate-pulse text-lg">Loading verification form...</div>
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  )
}
