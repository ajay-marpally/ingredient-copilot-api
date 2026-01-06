import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import LoadingSpinner from '../components/LoadingSpinner'
import { historyApi } from '../services/api'
import { useAnalysis } from '../context/AnalysisContext'

export default function HistoryPage() {
  const navigate = useNavigate()
  const { clearAnalysis } = useAnalysis()
  
  const [history, setHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await historyApi.getHistory({ limit: 50 })
      setHistory(data.items || [])
      setTotal(data.total || 0)
    } catch (err) {
      let errorMessage = 'Failed to load history'
      const detail = err.response?.data?.detail
      if (typeof detail === 'string') {
        errorMessage = detail
      } else if (Array.isArray(detail) && detail.length > 0) {
        errorMessage = detail.map(e => e.msg || e.message).join(', ')
      } else if (err.message) {
        errorMessage = err.message
      }
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (analysisId, e) => {
    e.stopPropagation()
    if (!confirm('Delete this analysis?')) return
    
    try {
      await historyApi.deleteAnalysis(analysisId)
      setHistory(prev => prev.filter(item => item.id !== analysisId))
      setTotal(prev => prev - 1)
    } catch (err) {
      console.error('Failed to delete:', err)
    }
  }

  const handleClearAll = async () => {
    if (!confirm('Clear all history? This cannot be undone.')) return
    
    try {
      await historyApi.clearHistory()
      setHistory([])
      setTotal(0)
    } catch (err) {
      console.error('Failed to clear history:', err)
    }
  }

  const handleViewAnalysis = (item) => {
    // Navigate to summary page with the stored result
    navigate('/summary', { state: { analysisResult: item.result, fromHistory: true } })
  }

  const getConcernColor = (level) => {
    switch (level) {
      case 'high': return 'text-brick'
      case 'medium': return 'text-amber-600'
      case 'low': return 'text-forest'
      default: return 'text-gray-500'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col bg-paper-texture transition-colors duration-300">
      {/* Header */}
      <header className="flex items-center px-6 py-5 justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary text-background-dark shadow-crayon border-2 border-black dark:border-white">
            <span className="material-symbols-outlined text-2xl font-bold">history</span>
          </div>
          <h2 className="text-forest dark:text-primary text-xl font-black tracking-tight">History</h2>
        </div>
        
        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-brick hover:text-brick/80 font-bold text-sm transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-lg">delete_sweep</span>
            Clear All
          </button>
        )}
      </header>

      <main className="flex-1 px-4 pb-28 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-6xl text-brick/50 mb-4">error</span>
            <p className="text-forest/60 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={fetchHistory}
              className="px-4 py-2 bg-primary text-black rounded-full font-bold hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-6xl text-forest/20 dark:text-gray-600 mb-4">inventory_2</span>
            <h3 className="text-forest dark:text-white text-lg font-bold mb-2">No History Yet</h3>
            <p className="text-forest/60 dark:text-gray-400 text-sm max-w-[250px]">
              Your ingredient analyses will appear here after you scan or type ingredients.
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 px-6 py-3 bg-primary text-black rounded-full font-bold hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined">add</span>
              Analyze Ingredients
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-forest/60 dark:text-gray-400 text-sm font-medium mb-4">
              {total} {total === 1 ? 'analysis' : 'analyses'} saved
            </p>
            
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => handleViewAnalysis(item)}
                className="bg-white dark:bg-[#1f331f] rounded-2xl p-4 border-2 border-forest/5 dark:border-primary/10 shadow-sm cursor-pointer hover:shadow-md hover:border-primary/30 transition-all active:scale-[0.98]"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="text-xs text-forest/50 dark:text-gray-500 mb-1">
                      {formatDate(item.created_at)}
                    </p>
                    <p className="text-forest dark:text-white font-bold text-sm line-clamp-2">
                      {item.content}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="ml-2 p-1 text-forest/30 hover:text-brick transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">close</span>
                  </button>
                </div>
                
                {item.result && (
                  <>
                    <p className="text-forest/70 dark:text-gray-300 text-xs line-clamp-2 mb-3">
                      {item.result.summary}
                    </p>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.result.key_concerns?.slice(0, 2).map((concern, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 rounded-full bg-brick/10 text-brick font-medium"
                        >
                          {concern}
                        </span>
                      ))}
                      {item.result.positives?.slice(0, 1).map((positive, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 rounded-full bg-primary/20 text-forest dark:text-primary font-medium"
                        >
                          {positive}
                        </span>
                      ))}
                      <span className={`text-xs font-bold ml-auto ${getConcernColor(item.result.confidence_level)}`}>
                        {item.result.confidence_level} confidence
                      </span>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
