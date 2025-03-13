"use client"

import { useState, useEffect } from "react"
import Login from "@/components/login"
import Dashboard from "@/components/dashboard"

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Check if user is already logged in
  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn")
    if (loggedIn === "true") {
      setIsLoggedIn(true)
    }
  }, [])

  const handleLogin = (username: string, password: string) => {
    if (username === "admin" && password === "1234") {
      setIsLoggedIn(true)
      localStorage.setItem("isLoggedIn", "true")
      return true
    }
    return false
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    localStorage.removeItem("isLoggedIn")
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {!isLoggedIn ? <Login onLogin={handleLogin} /> : <Dashboard onLogout={handleLogout} />}
    </main>
  )
}

