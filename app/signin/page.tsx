"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Eye, EyeOff, Loader2, AlertCircle, Sparkles } from "lucide-react"
import { login as apiLogin } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

export default function SignInPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (error) {
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Please fill in all fields")
      return
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address")
      return
    }    try {
      setLoading(true)
      setError(null)
      
      const response = await apiLogin(formData.email, formData.password)
      
      // Update auth context with user data and token
      if (response.user && response.accessToken) {
        login(response.user, response.accessToken)
        
        // Success - show toast and redirect
        toast.success("Welcome back! Redirecting to dashboard...")
        
        // Small delay to show the success message
        setTimeout(() => {
          router.push("/")
        }, 1000)
      } else {
        setError("Invalid response from server. Please try again.")
      }
      
    } catch (err: any) {
      console.error("Login error:", err)
      
      // Handle different error scenarios
      if (err?.response?.status === 401) {
        setError("Invalid email or password. Please try again.")
      } else if (err?.response?.status === 403) {
        setError("Your account has been suspended. Please contact administrator.")
      } else if (err?.response?.status === 429) {
        setError("Too many login attempts. Please try again later.")
      } else if (err?.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError("Unable to connect to server. Please check your connection and try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-electric-purple/10 via-electric-blue/5 to-electric-cyan/10">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-electric-purple to-electric-blue shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-electric-purple to-electric-blue bg-clip-text text-transparent">
              Family First
            </h1>
            <Sparkles className="h-6 w-6 text-electric-yellow" />
          </div>
          <p className="text-muted-foreground">
            State Supervisor Control Center
          </p>
        </div>

        {/* Sign In Card */}
        <Card className="border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl bg-gradient-to-r from-electric-purple to-electric-blue bg-clip-text text-transparent">
              Sign In to Your Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="admin@example.com"
                  className="border-electric-purple/30 focus:border-electric-purple focus:ring-electric-purple/20"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Enter your password"
                    className="border-electric-blue/30 focus:border-electric-blue focus:ring-electric-blue/20 pr-10"
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert className="border-destructive/30 bg-destructive/10">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="text-destructive">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Sign In Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-electric-purple to-electric-blue hover:from-electric-purple/80 hover:to-electric-blue/80 text-white font-medium"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Family First State Supervisor Dashboard
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Secure access to parental control management
          </p>
        </div>
      </div>
    </div>
  )
}
