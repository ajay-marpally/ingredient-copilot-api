import { useState } from 'react'

export default function TextInputModal({ isOpen, onClose, onSubmit, isLoading }) {
  const [text, setText] = useState('')
  const [context, setContext] = useState('')
  
  if (!isOpen) return null
  
  const handleSubmit = (e) => {
    e.preventDefault()
    if (text.trim()) {
      onSubmit({ text: text.trim(), context: context.trim() })
    }
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      
      <div className="relative bg-white dark:bg-background-dark w-full max-w-md rounded-t-3xl p-6 pb-8 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-ink dark:text-white">Paste Ingredients</h2>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-ink/70 dark:text-gray-300 mb-2">
              Ingredients List
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your ingredients here... (e.g., water, sugar, natural flavors, citric acid)"
              className="w-full h-32 p-4 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0 resize-none text-ink dark:text-white dark:bg-white/5 dark:border-white/20"
              disabled={isLoading}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-ink/70 dark:text-gray-300 mb-2">
              Any concerns? (optional)
            </label>
            <input
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g., I'm watching my sugar intake"
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0 text-ink dark:text-white dark:bg-white/5 dark:border-white/20"
              disabled={isLoading}
            />
          </div>
          
          <button
            type="submit"
            disabled={!text.trim() || isLoading}
            className="w-full py-4 bg-primary text-white font-bold rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Analyzing...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">search</span>
                Analyze Ingredients
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
