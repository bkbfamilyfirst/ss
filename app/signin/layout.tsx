import type React from "react"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: "Sign In - Family First SS Panel",
  description: "Sign in to the State Supervisor control center",
}

export default function SignInLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <div className="min-h-screen bg-gradient-to-br from-electric-purple/10 via-electric-blue/5 to-electric-cyan/10">
        {children}
      </div>
    </ThemeProvider>
  )
}
