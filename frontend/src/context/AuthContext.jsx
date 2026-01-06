import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../services/api'

const AuthContext = createContext(null)

const TOKEN_KEY = 'ingredient_pal_token'
const USER_KEY = 'ingredient_pal_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load auth state from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem(TOKEN_KEY)
      const storedUser = localStorage.getItem(USER_KEY)
      
      if (token && storedUser) {
        try {
          // Verify token is still valid by calling /auth/me
          const currentUser = await authApi.getMe()
          setUser(currentUser)
          localStorage.setItem(USER_KEY, JSON.stringify(currentUser))
        } catch (error) {
          // Token is invalid, clear storage
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem(USER_KEY)
          setUser(null)
        }
      }
      setIsLoading(false)
    }
    
    loadUser()
  }, [])

  const register = useCallback(async ({ name, email, password }) => {
    const response = await authApi.register({ name, email, password })
    
    // Store token and user
    localStorage.setItem(TOKEN_KEY, response.access_token)
    localStorage.setItem(USER_KEY, JSON.stringify(response.user))
    setUser(response.user)
    
    return response.user
  }, [])

  const login = useCallback(async ({ email, password }) => {
    const response = await authApi.login({ email, password })
    
    // Store token and user
    localStorage.setItem(TOKEN_KEY, response.access_token)
    localStorage.setItem(USER_KEY, JSON.stringify(response.user))
    setUser(response.user)
    
    return response.user
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch (error) {
      // Ignore errors on logout
    }
    
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }, [])

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    register,
    login,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
