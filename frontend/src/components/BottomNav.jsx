import { Link, useLocation } from 'react-router-dom'

export default function BottomNav() {
  const location = useLocation()
  
  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white dark:bg-[#1f331f] rounded-full border-2 border-gray-100 dark:border-forest/30 shadow-xl shadow-forest/10 dark:shadow-black/50 p-2 flex justify-between items-center z-50">
      <Link 
        to="/history" 
        className="flex flex-col items-center justify-center w-1/3 gap-1 group"
      >
        <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
          <span className={`material-symbols-outlined text-[28px] transition-colors ${
            location.pathname === '/history' 
              ? 'text-primary' 
              : 'text-forest/40 dark:text-gray-400 group-hover:text-primary'
          }`}>
            history
          </span>
        </div>
      </Link>
      
      <Link to="/" className="flex flex-col items-center justify-center w-1/3 gap-1 -mt-8">
        <div className="size-16 bg-primary rounded-full border-4 border-white dark:border-[#112111] shadow-lg flex items-center justify-center transform hover:scale-105 transition-transform">
          <span className="material-symbols-outlined text-black text-[32px]">home</span>
        </div>
      </Link>
      
      <button className="flex flex-col items-center justify-center w-1/3 gap-1 group">
        <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
          <span className="material-symbols-outlined text-forest/40 dark:text-gray-400 group-hover:text-primary transition-colors text-[28px]">
            settings
          </span>
        </div>
      </button>
    </nav>
  )
}
