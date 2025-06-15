"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { getCurrentUser } from '@/lib/api'

interface User {
  id: string
  name: string
  email: string
  role: string
  phone?: string
  location?: string
  assignedKeys?: number
  usedKeys?: number
  status?: string
  createdAt?: string
  lastLogin?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        setLoading(false)
        return
      }

      const userData = await getCurrentUser()
      setUser(userData.user || userData)
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('accessToken')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = (userData: User, token: string) => {
    localStorage.setItem('accessToken', token)
    setUser(userData)
    setLoading(false)
  }

  const logout = async () => {
    try {
      // Call logout API
      const { logout: apiLogout } = await import('@/lib/api')
      await apiLogout()
    } catch (error) {
      console.error('Logout API error:', error)
    } finally {
      // Always clear local state
      localStorage.removeItem('accessToken')
      setUser(null)
      window.location.href = '/signin'
    }
  }

  const refreshUser = async () => {
    try {
      const userData = await getCurrentUser()
      setUser(userData.user || userData)
    } catch (error) {
      console.error('Failed to refresh user:', error)
      // If refresh fails, logout user
      logout()
    }
  }

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
