import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import TextInputModal from '../components/TextInputModal'
import { useAnalysis } from '../context/AnalysisContext'
import { useAuth } from '../context/AuthContext'

// Sample products for demo
const SAMPLE_PRODUCTS = [
  {
    name: 'Breakfast Cereal',
    ingredients: ['whole grain oats', 'sugar', 'corn syrup', 'modified corn starch', 'honey', 'salt', 'tripotassium phosphate', 'vitamin E', 'niacinamide'],
  },
  {
    name: 'Energy Drink',
    ingredients: ['carbonated water', 'high fructose corn syrup', 'citric acid', 'natural flavors', 'sodium benzoate', 'caffeine', 'taurine', 'red 40', 'blue 1'],
  },
  {
    name: 'Protein Bar',
    ingredients: ['whey protein isolate', 'almonds', 'chicory root fiber', 'palm kernel oil', 'cocoa', 'natural flavors', 'soy lecithin', 'sucralose', 'carrageenan'],
  },
]

export default function HomePage() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const { analyzeIngredients, analyzeIngredientImage, isLoading } = useAnalysis()
  const { user, logout } = useAuth()
  
  const [showTextModal, setShowTextModal] = useState(false)
  const [showSampleModal, setShowSampleModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageContext, setImageContext] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  
  const handleTextSubmit = async ({ text, context }) => {
    try {
      await analyzeIngredients({
        input_type: 'ocr_text',
        content: text,
        user_context: context || undefined,
      })
      setShowTextModal(false)
      navigate('/analysis')
    } catch (error) {
      console.error('Analysis failed:', error)
    }
  }
  
  const handleImageCapture = () => {
    fileInputRef.current?.click()
  }
  
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }
  
  const handleImageSubmit = async () => {
    if (selectedImage) {
      try {
        await analyzeIngredientImage(selectedImage, imageContext || undefined)
        setSelectedImage(null)
        setImagePreview(null)
        setImageContext('')
        navigate('/analysis')
      } catch (error) {
        console.error('Image analysis failed:', error)
      }
    }
  }
  
  const handleImageCancel = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setImageContext('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
  
  const handleSampleSelect = async (sample) => {
    try {
      await analyzeIngredients({
        input_type: 'ingredient_list',
        content: sample.ingredients,
        user_context: undefined,
      })
      setShowSampleModal(false)
      navigate('/analysis')
    } catch (error) {
      console.error('Sample analysis failed:', error)
    }
  }
  
  return (
    <div className="relative flex h-full min-h-screen w-full flex-col bg-paper-texture transition-colors duration-300">
      {/* Header with user menu */}
      <header className="flex items-center px-6 py-5 justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary text-background-dark shadow-crayon border-2 border-black dark:border-white">
            <span className="material-symbols-outlined text-2xl font-bold">nutrition</span>
          </div>
          <h2 className="text-forest dark:text-primary text-xl font-black tracking-tight">Ingredient Pal</h2>
        </div>
        
        {/* User Menu */}
        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center justify-center size-10 rounded-full bg-white dark:bg-forest/30 border-2 border-forest/10 dark:border-primary/20 text-forest dark:text-primary transition hover:scale-105 active:scale-95"
          >
            <span className="material-symbols-outlined">account_circle</span>
          </button>
          
          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)}></div>
              <div className="absolute right-0 top-12 z-50 bg-white dark:bg-[#1f331f] rounded-2xl shadow-lg border-2 border-forest/10 dark:border-primary/20 p-2 min-w-[200px]">
                <div className="px-4 py-3 border-b border-forest/10 dark:border-primary/20">
                  <p className="font-bold text-forest dark:text-white">{user?.name}</p>
                  <p className="text-sm text-forest/60 dark:text-gray-400">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    logout()
                    navigate('/login')
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-brick hover:bg-brick/5 rounded-xl transition-colors mt-1"
                >
                  <span className="material-symbols-outlined">logout</span>
                  <span className="font-bold">Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center px-4 w-full max-w-md mx-auto pb-24">
        {/* Hero Section */}
        <div className="flex flex-col items-center w-full mb-8 relative">
          {/* Speech Bubble */}
          <div className="bubble-tail relative bg-white dark:bg-[#1f331f] p-6 mb-6 rounded-[2rem] shadow-crayon border-2 border-black/5 dark:border-primary/20 w-full max-w-[320px] transform rotate-[-1deg]">
            <h1 className="text-forest dark:text-white text-2xl font-black text-center leading-tight">
              Hey {user?.name?.split(' ')[0]}! 🍎
            </h1>
            <p className="text-forest/60 dark:text-gray-300 text-sm font-medium text-center mt-2">
              Show me what you're eating today!
            </p>
          </div>
          
          {/* AI Character */}
          <div className="relative size-40 sm:size-48 rounded-full border-4 border-dashed border-primary bg-white dark:bg-white/5 flex items-center justify-center overflow-hidden shadow-lg">
            <div className="flex items-center justify-center w-full h-full bg-primary/10">
              <span className="material-symbols-outlined text-primary text-7xl">smart_toy</span>
            </div>
          </div>
          <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 dark:bg-primary/10 rounded-full blur-3xl"></div>
        </div>
        
        {/* Button Group */}
        <div className="flex flex-col w-full gap-4 items-stretch px-2">
          {/* Primary Action: Camera */}
          <button 
            onClick={handleImageCapture}
            className="group relative flex items-center p-1 transition-transform active:scale-[0.98]"
            disabled={isLoading}
          >
            <div className="absolute inset-0 bg-black dark:bg-primary rounded-[2rem] translate-y-1 translate-x-0 group-hover:translate-y-1.5 transition-transform"></div>
            <div className="relative flex-1 flex items-center gap-4 bg-primary border-2 border-black dark:border-transparent rounded-[2rem] px-6 py-4 h-20 w-full overflow-hidden">
              <div className="flex items-center justify-center size-12 bg-white/20 rounded-full text-black">
                <span className="material-symbols-outlined text-3xl">photo_camera</span>
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="text-black text-lg font-black leading-tight">Take a photo</span>
                <span className="text-black/70 text-sm font-bold">Snap ingredients label</span>
              </div>
              <span className="material-symbols-outlined absolute right-6 text-black/40 text-4xl rotate-12 group-hover:rotate-45 transition-transform">
                arrow_forward
              </span>
            </div>
          </button>
          
          {/* Secondary Action: Paste Text */}
          <button 
            onClick={() => setShowTextModal(true)}
            className="group relative flex items-center p-1 transition-transform active:scale-[0.98]"
            disabled={isLoading}
          >
            <div className="absolute inset-0 bg-mustard/40 rounded-[2rem] translate-y-1 translate-x-0"></div>
            <div className="relative flex-1 flex items-center gap-4 bg-[#fffdf5] dark:bg-[#2a2a1e] border-2 border-mustard rounded-[2rem] px-6 py-3 h-16 w-full shadow-sm hover:bg-mustard/10 transition-colors">
              <div className="flex items-center justify-center size-10 bg-mustard/20 rounded-full text-yellow-700 dark:text-mustard">
                <span className="material-symbols-outlined">edit_note</span>
              </div>
              <span className="text-yellow-900 dark:text-mustard text-base font-bold flex-1 text-left">
                Paste ingredients text
              </span>
            </div>
          </button>
          
          {/* Tertiary Action: Sample */}
          <button 
            onClick={() => setShowSampleModal(true)}
            className="group relative flex items-center p-1 transition-transform active:scale-[0.98]"
            disabled={isLoading}
          >
            <div className="absolute inset-0 bg-brick/40 rounded-[2rem] translate-y-1 translate-x-0"></div>
            <div className="relative flex-1 flex items-center gap-4 bg-[#fffdf5] dark:bg-[#2a1a1a] border-2 border-brick rounded-[2rem] px-6 py-3 h-16 w-full shadow-sm hover:bg-brick/10 transition-colors">
              <div className="flex items-center justify-center size-10 bg-brick/20 rounded-full text-brick dark:text-red-400">
                <span className="material-symbols-outlined">lunch_dining</span>
              </div>
              <span className="text-brick dark:text-red-300 text-base font-bold flex-1 text-left">
                Use a sample product
              </span>
            </div>
          </button>
        </div>
      </main>
      
      <BottomNav />
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      
      {/* Text Input Modal */}
      <TextInputModal
        isOpen={showTextModal}
        onClose={() => setShowTextModal(false)}
        onSubmit={handleTextSubmit}
        isLoading={isLoading}
      />
      
      {/* Image Preview Modal */}
      {imagePreview && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={handleImageCancel}></div>
          
          <div className="relative bg-white dark:bg-background-dark w-full max-w-md rounded-t-3xl p-6 pb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-ink dark:text-white">Review Image</h2>
              <button 
                onClick={handleImageCancel}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="mb-4 rounded-2xl overflow-hidden border-2 border-gray-200">
              <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-ink/70 mb-2">
                Any concerns? (optional)
              </label>
              <input
                type="text"
                value={imageContext}
                onChange={(e) => setImageContext(e.target.value)}
                placeholder="e.g., I have a gluten allergy"
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0"
                disabled={isLoading}
              />
            </div>
            
            <button
              onClick={handleImageSubmit}
              disabled={isLoading}
              className="w-full py-4 bg-primary text-white font-bold rounded-full disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">search</span>
                  Analyze Image
                </>
              )}
            </button>
          </div>
        </div>
      )}
      
      {/* Sample Products Modal */}
      {showSampleModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowSampleModal(false)}></div>
          
          <div className="relative bg-white dark:bg-background-dark w-full max-w-md rounded-t-3xl p-6 pb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-ink dark:text-white">Choose a Sample</h2>
              <button 
                onClick={() => setShowSampleModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="space-y-3">
              {SAMPLE_PRODUCTS.map((sample, index) => (
                <button
                  key={index}
                  onClick={() => handleSampleSelect(sample)}
                  disabled={isLoading}
                  className="w-full p-4 bg-gray-50 dark:bg-white/5 rounded-xl text-left hover:bg-gray-100 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  <h3 className="font-bold text-ink dark:text-white">{sample.name}</h3>
                  <p className="text-sm text-ink/60 dark:text-gray-400 mt-1 truncate">
                    {sample.ingredients.slice(0, 4).join(', ')}...
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
