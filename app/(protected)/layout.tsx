import { ProtectedRoute } from "@/components/protected-route"
import Header from "@/components/header"
import BottomNav from "@/components/bottom-nav"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 pb-20 sm:pb-24 md:pb-28">{children}</main>
        <BottomNav />
      </div>
    </ProtectedRoute>
  )
}
