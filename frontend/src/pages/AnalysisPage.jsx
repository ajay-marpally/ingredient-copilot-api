import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAnalysis } from '../context/AnalysisContext'
import AIGuide from '../components/AIGuide'
import IngredientCard from '../components/IngredientCard'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

export default function AnalysisPage() {
  const navigate = useNavigate()
  const { analysisResult, isLoading, error, clearAnalysis } = useAnalysis()
  
  useEffect(() => {
    if (!analysisResult && !isLoading && !error) {
      navigate('/')
    }
  }, [analysisResult, isLoading, error, navigate])
  
  if (isLoading) {
    return (
      <div className="relative flex h-full min-h-screen w-full flex-col bg-paper dark:bg-background-dark max-w-md mx-auto">
        <header className="flex items-center p-6 pb-2 justify-between sticky top-0 z-20 bg-paper/95 dark:bg-background-dark/95 backdrop-blur-sm">
          <button 
            onClick={() => navigate('/')}
            className="text-ink hover:bg-gray-100 rounded-full p-2 transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
          <h2 className="text-ink text-xl font-bold tracking-tight">Analyzing...</h2>
          <div className="w-10"></div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner message="Our AI is analyzing your ingredients..." />
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="relative flex h-full min-h-screen w-full flex-col bg-paper dark:bg-background-dark max-w-md mx-auto">
        <header className="flex items-center p-6 pb-2 justify-between sticky top-0 z-20 bg-paper/95 dark:bg-background-dark/95 backdrop-blur-sm">
          <button 
            onClick={() => navigate('/')}
            className="text-ink hover:bg-gray-100 rounded-full p-2 transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
          <h2 className="text-ink text-xl font-bold tracking-tight">Error</h2>
          <div className="w-10"></div>
        </header>
        <div className="flex-1 flex items-center justify-center p-6">
          <ErrorMessage 
            message={error} 
            onRetry={() => {
              clearAnalysis()
              navigate('/')
            }} 
          />
        </div>
      </div>
    )
  }
  
  if (!analysisResult) {
    return null
  }
  
  const { summary, ingredient_insights = [], reasoning_time_ms } = analysisResult
  
  return (
    <div className="relative flex h-full min-h-screen w-full flex-col bg-paper dark:bg-background-dark overflow-x-hidden max-w-md mx-auto shadow-2xl">
      {/* Top App Bar */}
      <header className="flex items-center p-6 pb-2 justify-between sticky top-0 z-20 bg-paper/95 dark:bg-background-dark/95 backdrop-blur-sm">
        <button 
          onClick={() => {
            clearAnalysis()
            navigate('/')
          }}
          className="text-ink hover:bg-gray-100 rounded-full p-2 transition-colors flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <h2 className="text-ink text-xl font-bold tracking-tight">Ingredient Breakdown</h2>
        <Link 
          to="/summary"
          className="text-ink hover:bg-gray-100 rounded-full p-2 transition-colors flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-2xl">summarize</span>
        </Link>
      </header>
      
      {/* AI Guide Section */}
      <AIGuide message={summary || "Let me break down these ingredients for you!"} />
      
      {/* Ingredients Grid */}
      <main className="flex-1 p-6 pt-2 pb-32">
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-ink text-lg font-bold">What's inside?</h3>
          {reasoning_time_ms && (
            <span className="text-xs text-ink/40">
              Analyzed in {(reasoning_time_ms / 1000).toFixed(1)}s
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {ingredient_insights.map((ingredient, index) => (
            <IngredientCard 
              key={index} 
              ingredient={ingredient} 
              defaultExpanded={index === 0 && ingredient.concern_level === 'none'}
            />
          ))}
        </div>
        
        {ingredient_insights.length === 0 && (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-4xl text-ink/20">search_off</span>
            <p className="text-ink/40 mt-2">No ingredients found</p>
          </div>
        )}
      </main>
      
      {/* Floating Bottom Navigation */}
      <div className="fixed bottom-6 left-0 right-0 px-8 z-50 flex justify-center max-w-md mx-auto">
        <nav className="bg-white dark:bg-ink rounded-full border-2 border-gray-100 dark:border-gray-700 p-2 shadow-floating flex items-center gap-1 w-full max-w-[320px] justify-between">
          <button 
            onClick={() => {
              clearAnalysis()
              navigate('/')
            }}
            className="flex flex-col items-center justify-center w-12 h-12 rounded-full text-gray-400 hover:text-primary hover:bg-green-50 transition-colors"
          >
            <span className="material-symbols-outlined">home</span>
          </button>
          
          <Link 
            to="/summary"
            className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-white shadow-lg shadow-primary/30 transform -translate-y-4 border-4 border-white dark:border-ink"
          >
            <span className="material-symbols-outlined text-3xl">auto_awesome</span>
          </Link>
          
          <button className="flex flex-col items-center justify-center w-12 h-12 rounded-full text-gray-400 hover:text-primary hover:bg-green-50 transition-colors">
            <span className="material-symbols-outlined">share</span>
          </button>
        </nav>
      </div>
    </div>
  )
}
