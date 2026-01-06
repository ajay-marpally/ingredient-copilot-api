import { Link } from 'react-router-dom'

export default function Header({ title, showBack = false, showSettings = true }) {
  return (
    <header className="flex items-center px-6 py-5 justify-between relative z-10">
      {showBack ? (
        <Link 
          to="/" 
          className="flex size-10 items-center justify-center rounded-full hover:bg-black/5 transition-colors text-forest dark:text-primary"
        >
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </Link>
      ) : (
        <div className="flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary text-background-dark shadow-crayon border-2 border-black dark:border-white">
            <span className="material-symbols-outlined text-2xl font-bold">nutrition</span>
          </div>
          <h2 className="text-forest dark:text-primary text-xl font-black tracking-tight">
            {title || 'Ingredient Pal'}
          </h2>
        </div>
      )}
      
      {title && showBack && (
        <h2 className="text-forest dark:text-primary text-xl font-bold tracking-tight">
          {title}
        </h2>
      )}
      
      {showSettings && (
        <button className="flex items-center justify-center size-10 rounded-full bg-white dark:bg-forest/30 border-2 border-forest/10 dark:border-primary/20 text-forest dark:text-primary transition hover:scale-105 active:scale-95">
          <span className="material-symbols-outlined">account_circle</span>
        </button>
      )}
    </header>
  )
}
