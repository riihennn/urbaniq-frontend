"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Building, Home, UserCheck } from "lucide-react"
import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"
import { GoogleLogin } from "@react-oauth/google"
import RoleSelectionModal from "@/components/auth/RoleSelectionModal"

export default function RegisterPage() {
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)
  
  const [role, setRole] = useState("Buyer")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [tempToken, setTempToken] = useState<string | null>(null)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await api.post("/auth/register", { firstName, lastName, email, password, role })
      router.push(`/verify-email?email=${encodeURIComponent(email)}`)
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError("")
    setLoading(true)
    const idToken = credentialResponse.credential

    if (!idToken) {
      setError("No credential received from Google")
      setLoading(false)
      return
    }

    try {
      const response = await api.post("/auth/google", { idToken })
      const data = response.data

      if (data.isNewUser) {
        setTempToken(idToken)
        setIsModalOpen(true)
      } else {
        const { token, refreshToken, user } = data
        setAuth(user, token, refreshToken)
        if (user.role === 'Buyer') {
          router.push('/')
        } else {
          router.push(`/dashboard/${user.role.toLowerCase()}`)
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || "Google authentication failed")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleOnboard = async (selectedRole: string) => {
    if (!tempToken) return
    try {
      const response = await api.post("/auth/google/register", { idToken: tempToken, role: selectedRole })
      const { token, refreshToken, ...user } = response.data
      setAuth(user, token, refreshToken)
      setIsModalOpen(false)
      if (user.role === 'Buyer') {
        router.push('/')
      } else {
        router.push(`/dashboard/${user.role.toLowerCase()}`)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || "Google registration failed")
      throw err
    }
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2 text-left">
        <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
        <p className="text-muted-foreground">
          Join Urbaniq to elevate your real estate experience.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleRegister}>
        {error && <div className="text-sm text-red-500 font-medium">{error}</div>}
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">I am a...</label>
          <div className="grid grid-cols-3 gap-3">
             <label className={`flex flex-col items-center justify-center p-3 border rounded-xl cursor-pointer hover:bg-muted/50 transition-all ${role === "Buyer" ? "border-primary bg-primary/5 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                <Home className="h-6 w-6 mb-2" />
                <span className="text-xs font-semibold">Buyer / Tenant</span>
                <input type="radio" name="role" value="Buyer" className="hidden" checked={role === "Buyer"} onChange={() => setRole("Buyer")} />
             </label>
             <label className={`flex flex-col items-center justify-center p-3 border rounded-xl cursor-pointer hover:bg-muted/50 transition-all ${role === "Owner" ? "border-primary bg-primary/5 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                <Building className="h-6 w-6 mb-2" />
                <span className="text-xs font-semibold">Owner</span>
                <input type="radio" name="role" value="Owner" className="hidden" checked={role === "Owner"} onChange={() => setRole("Owner")} />
             </label>
             <label className={`flex flex-col items-center justify-center p-3 border rounded-xl cursor-pointer hover:bg-muted/50 transition-all ${role === "Agent" ? "border-primary bg-primary/5 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                <UserCheck className="h-6 w-6 mb-2" />
                <span className="text-xs font-semibold">Agent</span>
                <input type="radio" name="role" value="Agent" className="hidden" checked={role === "Agent"} onChange={() => setRole("Agent")} />
             </label>
          </div>
        </div>
      
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="firstName">
              First Name
            </label>
            <Input id="firstName" placeholder="John" className="bg-muted/50" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="lastName">
              Last Name
            </label>
            <Input id="lastName" placeholder="Doe" className="bg-muted/50" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none" htmlFor="email">
            Email Address
          </label>
          <Input id="email" type="email" placeholder="name@company.com" className="bg-muted/50" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none" htmlFor="password">
            Password
          </label>
          <Input id="password" type="password" placeholder="••••••••" className="bg-muted/50" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
        </div>
        <Button className="w-full h-12 text-base" disabled={loading}>
          {loading ? "Creating..." : "Create Account"}
        </Button>
      </form>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="w-full flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google registration failed")}
            theme="outline"
            size="large"
            text="signup_with"
            shape="rectangular"
            width="380"
          />
        </div>
      </div>

      <p className="px-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Sign In
        </Link>
      </p>

      <RoleSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleGoogleOnboard}
      />
    </div>
  )
}
