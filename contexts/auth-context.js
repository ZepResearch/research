"use client"

import { createContext, useContext, useEffect, useState } from "react"
import pb, { getCurrentUser, isAuthenticated, logout } from "@/lib/pocketbase"

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated
    if (isAuthenticated()) {
      setUser(getCurrentUser())
    }
    setLoading(false)

    // Listen for auth changes
    const unsubscribe = pb.authStore.onChange((token, model) => {
      setUser(model)
    })

    return () => unsubscribe()
  }, [])

  const signOut = () => {
    logout()
    setUser(null)
  }

  const value = {
    user,
    loading,
    signOut,
    isAuthenticated: isAuthenticated(),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
