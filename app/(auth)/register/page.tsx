"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Building, Home, UserCheck, ChevronRight, ChevronLeft, User, Briefcase, MapPin, CheckCircle2, LocateFixed } from "lucide-react"
import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"
import { GoogleLogin } from "@react-oauth/google"
import RoleSelectionModal from "@/components/auth/RoleSelectionModal"

export default function RegisterPage() {
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)

  // Common fields
  const [role, setRole] = useState("Buyer")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // Agent Step 2 fields
  const [phone, setPhone] = useState("")
  const [experienceYears, setExperienceYears] = useState("")
  const [specialties, setSpecialties] = useState("")
  const [profileImage, setProfileImage] = useState<string>("")
  const [verificationDocument, setVerificationDocument] = useState<string>("")

  // Agent Step 3 fields (location)
  const [agentAddress, setAgentAddress] = useState("")
  const [agentCity, setAgentCity] = useState("")
  const [agentState, setAgentState] = useState("")
  const [agentCountry, setAgentCountry] = useState("")
  const [agentZipCode, setAgentZipCode] = useState("")
  const [operatingAreas, setOperatingAreas] = useState("")
  const [isLocating, setIsLocating] = useState(false)

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [tempToken, setTempToken] = useState<string | null>(null)

  // For agents: 3 steps. For others: 1 step
  const totalSteps = role === "Agent" ? 3 : 1

  const agentSteps = [
    { label: "Account", icon: User },
    { label: "Professional", icon: Briefcase },
    { label: "Location", icon: MapPin },
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFileState: React.Dispatch<React.SetStateAction<string>>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFileState(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUseCurrentLocation = () => {
    if ("geolocation" in navigator) {
      setIsLocating(true)
      setError("")
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
            const data = await res.json()
            if (data && data.address) {
              setAgentAddress(data.address.road || data.address.suburb || data.name || "")
              setAgentCity(data.address.city || data.address.town || data.address.village || data.address.county || "")
              setAgentState(data.address.state || "")
              setAgentCountry(data.address.country || "")
              setAgentZipCode(data.address.postcode || "")
            }
          } catch {
            setError("Failed to fetch address from location.")
          } finally {
            setIsLocating(false)
          }
        },
        () => {
          setError("Location access denied.")
          setIsLocating(false)
        }
      )
    } else {
      setError("Geolocation is not supported by your browser.")
    }
  }

  const validateStep = () => {
    setError("")
    if (currentStep === 1) {
      if (!firstName.trim()) return "Please enter your first name."
      if (!lastName.trim()) return "Please enter your last name."
      if (!email.trim()) return "Please enter your email."
      if (!password || password.length < 6) return "Password must be at least 6 characters."
    }
    if (currentStep === 2 && role === "Agent") {
      if (!phone.trim()) return "Please enter your phone number."
      if (!experienceYears) return "Please enter your years of experience."
      if (!profileImage) return "Please upload your profile photo."
      if (!verificationDocument) return "Please upload your ID / verification document."
    }
    if (currentStep === 3 && role === "Agent") {
      if (!agentCity.trim()) return "Please enter your city."
      if (!agentCountry.trim()) return "Please enter your country."
    }
    return null
  }

  const handleNext = () => {
    const err = validateStep()
    if (err) { setError(err); return }
    setCurrentStep(s => s + 1)
  }

  const handleBack = () => {
    setError("")
    setCurrentStep(s => s - 1)
  }

  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const err = validateStep()
    if (err) { setError(err); return }

    setError("")
    setLoading(true)
    try {
      const payload: any = { firstName, lastName, email, password, role }
      if (role === "Agent") {
        payload.phone = phone
        payload.experienceYears = experienceYears
        payload.specialties = specialties.split(",").map(s => s.trim()).filter(Boolean)
        payload.profileImage = profileImage
        payload.verificationDocument = verificationDocument
        payload.agentLocation = {
          address: agentAddress,
          city: agentCity,
          state: agentState,
          country: agentCountry,
          zipCode: agentZipCode,
        }
        payload.operatingAreas = operatingAreas.split(",").map(s => s.trim()).filter(Boolean)
      }
      await api.post("/auth/register", payload)
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
    if (!idToken) { setError("No credential received from Google"); setLoading(false); return }
    try {
      const response = await api.post("/auth/google", { idToken })
      const data = response.data
      if (data.isNewUser) {
        setTempToken(idToken)
        setIsModalOpen(true)
      } else {
        const { token, refreshToken, user } = data
        setAuth(user, token, refreshToken)
        if (user.role === "Buyer" || user.role === "Owner") router.push("/")
        else router.push(`/dashboard/${user.role.toLowerCase()}`)
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
      if (user.role === "Buyer" || user.role === "Owner") router.push("/")
      else router.push(`/dashboard/${user.role.toLowerCase()}`)
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || "Google registration failed")
      throw err
    }
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2 text-left">
        <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
        <p className="text-muted-foreground">Join Urbaniq to elevate your real estate experience.</p>
      </div>

      {/* Step Progress for Agent */}
      {role === "Agent" && (
        <div className="flex items-center gap-0">
          {agentSteps.map((step, index) => {
            const stepNum = index + 1
            const isCompleted = currentStep > stepNum
            const isActive = currentStep === stepNum
            const Icon = step.icon
            return (
              <div key={step.label} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    isCompleted ? "bg-primary text-primary-foreground" :
                    isActive ? "bg-primary/10 border-2 border-primary text-primary" :
                    "bg-muted text-muted-foreground border-2 border-transparent"
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-xs mt-1 font-medium ${isActive ? "text-primary" : isCompleted ? "text-primary" : "text-muted-foreground"}`}>
                    {step.label}
                  </span>
                </div>
                {index < agentSteps.length - 1 && (
                  <div className={`h-0.5 flex-1 mb-5 transition-all ${currentStep > stepNum ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            )
          })}
        </div>
      )}

      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (currentStep === totalSteps) handleRegister(); }}>
        {error && <div className="text-sm text-red-500 font-medium bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>}

        {/* STEP 1: Account Details */}
        {currentStep === 1 && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">I am a...</label>
              <div className="grid grid-cols-3 gap-3">
                <label className={`flex flex-col items-center justify-center p-3 border rounded-xl cursor-pointer hover:bg-muted/50 transition-all ${role === "Buyer" ? "border-primary bg-primary/5 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                  <Home className="h-6 w-6 mb-2" />
                  <span className="text-xs font-semibold">Buyer / Tenant</span>
                  <input type="radio" name="role" value="Buyer" className="hidden" checked={role === "Buyer"} onChange={() => { setRole("Buyer"); setCurrentStep(1) }} />
                </label>
                <label className={`flex flex-col items-center justify-center p-3 border rounded-xl cursor-pointer hover:bg-muted/50 transition-all ${role === "Owner" ? "border-primary bg-primary/5 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                  <Building className="h-6 w-6 mb-2" />
                  <span className="text-xs font-semibold">Owner</span>
                  <input type="radio" name="role" value="Owner" className="hidden" checked={role === "Owner"} onChange={() => { setRole("Owner"); setCurrentStep(1) }} />
                </label>
                <label className={`flex flex-col items-center justify-center p-3 border rounded-xl cursor-pointer hover:bg-muted/50 transition-all ${role === "Agent" ? "border-primary bg-primary/5 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                  <UserCheck className="h-6 w-6 mb-2" />
                  <span className="text-xs font-semibold">Agent</span>
                  <input type="radio" name="role" value="Agent" className="hidden" checked={role === "Agent"} onChange={() => { setRole("Agent"); setCurrentStep(1) }} />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="firstName">First Name</label>
                <Input id="firstName" placeholder="John" className="bg-muted/50" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="lastName">Last Name</label>
                <Input id="lastName" placeholder="Doe" className="bg-muted/50" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="email">Email Address</label>
              <Input id="email" type="email" placeholder="name@company.com" className="bg-muted/50" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="password">Password</label>
              <Input id="password" type="password" placeholder="••••••••" className="bg-muted/50" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
            </div>
          </>
        )}

        {/* STEP 2: Professional Details (Agent Only) */}
        {currentStep === 2 && role === "Agent" && (
          <div className="space-y-4">
            <div className="space-y-1 mb-2">
              <h2 className="font-semibold text-base">Professional Details</h2>
              <p className="text-xs text-muted-foreground">Tell us about your professional background.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="phone">Phone Number</label>
              <Input id="phone" type="tel" placeholder="+1 234 567 8900" className="bg-muted/50" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="experienceYears">Years of Experience</label>
                <Input id="experienceYears" type="number" min="0" placeholder="e.g. 5" className="bg-muted/50" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="specialties">Specialties</label>
                <Input id="specialties" placeholder="Luxury, Commercial..." className="bg-muted/50" value={specialties} onChange={(e) => setSpecialties(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="profileImage">Profile Photo <span className="text-destructive">*</span></label>
                <Input id="profileImage" type="file" accept="image/*" className="bg-muted/50 cursor-pointer" onChange={(e) => handleFileChange(e, setProfileImage)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="verificationDocument">ID / Verification Doc <span className="text-destructive">*</span></label>
                <Input id="verificationDocument" type="file" accept="image/*,.pdf" className="bg-muted/50 cursor-pointer" onChange={(e) => handleFileChange(e, setVerificationDocument)} required />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Your account will require admin verification before you can access your dashboard.</p>
          </div>
        )}

        {/* STEP 3: Location (Agent Only) */}
        {currentStep === 3 && role === "Agent" && (
          <div className="space-y-4">
            <div className="space-y-1 mb-2">
              <h2 className="font-semibold text-base">Your Location</h2>
              <p className="text-xs text-muted-foreground">Help clients find you by setting your base location and operating areas.</p>
            </div>

            <Button type="button" variant="outline" className="w-full" onClick={handleUseCurrentLocation} disabled={isLocating}>
              <LocateFixed className="w-4 h-4 mr-2" />
              {isLocating ? "Detecting location..." : "Use My Current Location"}
            </Button>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="agentCity">City *</label>
                <Input id="agentCity" placeholder="e.g. Mumbai" className="bg-muted/50" value={agentCity} onChange={(e) => setAgentCity(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="agentState">State / Province</label>
                <Input id="agentState" placeholder="e.g. Maharashtra" className="bg-muted/50" value={agentState} onChange={(e) => setAgentState(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="agentAddress">Street Address</label>
                <Input id="agentAddress" placeholder="e.g. 123 Main St" className="bg-muted/50" value={agentAddress} onChange={(e) => setAgentAddress(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="agentZipCode">Zip / Postal Code</label>
                <Input id="agentZipCode" placeholder="e.g. 10001" className="bg-muted/50" value={agentZipCode} onChange={(e) => setAgentZipCode(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="agentCountry">Country *</label>
                <Input id="agentCountry" placeholder="e.g. India" className="bg-muted/50" value={agentCountry} onChange={(e) => setAgentCountry(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="operatingAreas">Operating Areas</label>
              <Input id="operatingAreas" placeholder="e.g. Bandra, Andheri, Powai (comma separated)" className="bg-muted/50" value={operatingAreas} onChange={(e) => setOperatingAreas(e.target.value)} />
              <p className="text-xs text-muted-foreground">Enter the neighbourhoods or areas where you actively work, separated by commas.</p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className={`flex gap-3 ${currentStep > 1 ? "justify-between" : ""}`}>
          {currentStep > 1 && (
            <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          )}
          {currentStep < totalSteps ? (
            <Button type="button" onClick={handleNext} className={`h-12 text-base ${currentStep > 1 ? "flex-1" : "w-full"}`}>
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button type="submit" className={`h-12 text-base ${currentStep > 1 ? "flex-1" : "w-full"}`} disabled={loading}>
              {loading ? "Creating..." : "Create Account"}
            </Button>
          )}
        </div>
      </form>

      {/* Only show Google login on step 1 */}
      {currentStep === 1 && (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
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
        </>
      )}

      <p className="px-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">Sign In</Link>
      </p>

      <RoleSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleGoogleOnboard}
      />
    </div>
  )
}
