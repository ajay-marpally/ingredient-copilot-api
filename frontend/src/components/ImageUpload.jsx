import { useRef, useState } from 'react'

export default function ImageUpload({ onImageSelect, isLoading }) {
  const fileInputRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [context, setContext] = useState('')
  
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }
  
  const handleSubmit = () => {
    const file = fileInputRef.current?.files?.[0]
    if (file) {
      onImageSelect(file, context)
    }
  }
  
  const handleClear = () => {
    setPreview(null)
    setContext('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
  
  if (preview) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={handleClear}></div>
        
        <div className="relative bg-white dark:bg-background-dark w-full max-w-md rounded-t-3xl p-6 pb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-ink dark:text-white">Review Image</h2>
            <button 
              onClick={handleClear}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <div className="mb-4 rounded-2xl overflow-hidden border-2 border-gray-200">
            <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-ink/70 mb-2">
              Any concerns? (optional)
            </label>
            <input
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g., I have a gluten allergy"
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0"
              disabled={isLoading}
            />
          </div>
          
          <button
            onClick={handleSubmit}
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
    )
  }
  
  return (
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      capture="environment"
      onChange={handleFileChange}
      className="hidden"
    />
  )
}

export { ImageUpload }
