import { createContext, useContext, useState, useCallback } from 'react'
import { analyzeText, analyzeImage, historyApi } from '../services/api'

const AnalysisContext = createContext(null)

export function AnalysisProvider({ children }) {
  const [analysisResult, setAnalysisResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const analyzeIngredients = useCallback(async ({ input_type, content, user_context }) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await analyzeText({ input_type, content, user_context })
      setAnalysisResult(result)
      
      // Save to history in background (local backend)
      try {
        await historyApi.saveAnalysis({
          input_type,
          content,
          user_context,
          result
        })
      } catch (historyErr) {
        console.warn('Failed to save to history:', historyErr)
        // Don't fail the analysis if history save fails
      }
      
      return result
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to analyze ingredients'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const analyzeIngredientImage = useCallback(async (imageFile, userContext) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await analyzeImage(imageFile, userContext)
      setAnalysisResult(result)
      
      // Save to history in background (local backend)
      try {
        await historyApi.saveAnalysis({
          input_type: 'image',
          content: imageFile.name || 'Image analysis',
          user_context: userContext,
          result
        })
      } catch (historyErr) {
        console.warn('Failed to save to history:', historyErr)
        // Don't fail the analysis if history save fails
      }
      
      return result
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to analyze image'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearAnalysis = useCallback(() => {
    setAnalysisResult(null)
    setError(null)
  }, [])

  const value = {
    analysisResult,
    isLoading,
    error,
    analyzeIngredients,
    analyzeIngredientImage,
    clearAnalysis,
  }

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  )
}

export function useAnalysis() {
  const context = useContext(AnalysisContext)
  if (!context) {
    throw new Error('useAnalysis must be used within an AnalysisProvider')
  }
  return context
}
