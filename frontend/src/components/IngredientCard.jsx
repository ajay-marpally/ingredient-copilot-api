import { useState } from 'react'

export default function IngredientCard({ ingredient, defaultExpanded = false }) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  
  const getConcernStyles = (level) => {
    switch (level) {
      case 'high':
        return {
          border: 'border-red-200',
          bg: 'bg-red-50/50',
          iconBg: 'bg-white',
          iconBorder: 'border-red-200',
          iconColor: 'text-red-500',
          icon: 'warning',
          label: 'Caution',
          labelColor: 'text-red-600',
        }
      case 'medium':
        return {
          border: 'border-yellow-200',
          bg: 'bg-yellow-50/50',
          iconBg: 'bg-white',
          iconBorder: 'border-yellow-200',
          iconColor: 'text-yellow-600',
          icon: 'science',
          label: 'Processed',
          labelColor: 'text-yellow-700',
        }
      case 'low':
        return {
          border: 'border-gray-200',
          bg: 'bg-white',
          iconBg: 'bg-gray-50',
          iconBorder: 'border-gray-200',
          iconColor: 'text-gray-400',
          icon: 'help',
          label: 'Still Debated',
          labelColor: 'text-gray-500',
        }
      default:
        return {
          border: 'border-primary/30',
          bg: 'bg-primary/5',
          iconBg: 'bg-white',
          iconBorder: 'border-primary/20',
          iconColor: 'text-primary',
          icon: 'eco',
          label: 'Natural',
          labelColor: 'text-primary',
        }
    }
  }
  
  const styles = getConcernStyles(ingredient.concern_level)
  
  if (ingredient.concern_level === 'none') {
    return (
      <div className="col-span-2 group">
        <details open={isExpanded} onToggle={(e) => setIsExpanded(e.target.open)}>
          <summary className="list-none cursor-pointer">
            <div className={`flex items-center gap-4 p-4 rounded-2xl border-[3px] ${styles.border} ${styles.bg} hover:border-primary/60 transition-all shadow-crayon`}>
              <div className={`w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center border-2 ${styles.iconBorder} ${styles.iconColor} shrink-0`}>
                <span className="material-symbols-outlined">{styles.icon}</span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-ink text-lg">{ingredient.name}</h4>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold ${styles.labelColor} uppercase tracking-wide`}>
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  {styles.label}
                </span>
              </div>
              <span className={`material-symbols-outlined text-primary/50 ${isExpanded ? 'rotate-180' : ''} transition-transform`}>
                expand_more
              </span>
            </div>
          </summary>
          <div className="mt-3 mx-2 p-5 bg-white rounded-2xl border-2 border-dashed border-primary/20 relative">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary mt-1">auto_awesome</span>
              <div>
                <p className="text-ink/80 text-sm leading-relaxed font-medium">
                  {ingredient.brief}
                </p>
              </div>
            </div>
          </div>
        </details>
      </div>
    )
  }
  
  if (ingredient.concern_level === 'low') {
    return (
      <div className="col-span-2">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full flex items-center gap-4 p-4 rounded-2xl border-[3px] ${styles.border} ${styles.bg} transition-all border-dashed`}
        >
          <div className={`w-10 h-10 rounded-full ${styles.iconBg} flex items-center justify-center border-2 ${styles.iconBorder} ${styles.iconColor} shrink-0`}>
            <span className="material-symbols-outlined">{styles.icon}</span>
          </div>
          <div className="flex-1 text-left">
            <h4 className="font-bold text-ink/70 text-lg">{ingredient.name}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-md border border-gray-200 transform -rotate-1">
                {styles.label.toUpperCase()}
              </span>
            </div>
          </div>
          <span className="material-symbols-outlined text-gray-300">expand_more</span>
        </button>
        {isExpanded && (
          <div className="mt-2 mx-2 p-4 bg-gray-50 rounded-xl">
            <p className="text-ink/70 text-sm">{ingredient.brief}</p>
          </div>
        )}
      </div>
    )
  }
  
  return (
    <div className="col-span-1">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full text-left h-full flex flex-col gap-3 p-4 rounded-3xl border-[3px] ${styles.border} ${styles.bg} hover:scale-[1.02] transition-all shadow-crayon relative overflow-hidden`}
      >
        <div className={`absolute -right-4 -top-4 w-16 h-16 ${ingredient.concern_level === 'high' ? 'bg-red-100/50' : 'bg-yellow-100/50'} rounded-full`}></div>
        <div className={`w-10 h-10 rounded-full ${styles.iconBg} flex items-center justify-center border-2 ${styles.iconBorder} ${styles.iconColor} z-10`}>
          <span className="material-symbols-outlined text-[20px]">{styles.icon}</span>
        </div>
        <div className="z-10">
          <h4 className="font-bold text-ink text-base leading-tight">{ingredient.name}</h4>
          <span className={`text-xs font-medium ${styles.labelColor} mt-1 block`}>{styles.label}</span>
        </div>
      </button>
      {isExpanded && (
        <div className="mt-2 p-3 bg-white rounded-xl border shadow-sm">
          <p className="text-ink/70 text-xs">{ingredient.brief}</p>
        </div>
      )}
    </div>
  )
}
