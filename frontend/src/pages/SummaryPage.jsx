import { useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAnalysis } from '../context/AnalysisContext'

export default function SummaryPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { analysisResult: contextResult, clearAnalysis } = useAnalysis()
  
  // Use result from location state (history) or from context (new analysis)
  const analysisResult = location.state?.analysisResult || contextResult
  const fromHistory = location.state?.fromHistory || false
  
  useEffect(() => {
    if (!analysisResult) {
      navigate('/')
    }
  }, [analysisResult, navigate])
  
  if (!analysisResult) {
    return null
  }
  
  const { 
    summary, 
    key_concerns = [], 
    positives = [], 
    confidence_level = 'medium',
    uncertainty_notes,
    ingredient_insights = [],
  } = analysisResult
  
  // Determine verdict based on concerns
  const getVerdict = () => {
    const highConcerns = ingredient_insights.filter(i => i.concern_level === 'high').length
    const mediumConcerns = ingredient_insights.filter(i => i.concern_level === 'medium').length
    
    if (highConcerns >= 2) {
      return { text: 'Worth avoiding', icon: 'warning', color: 'text-brick' }
    } else if (highConcerns === 1 || mediumConcerns >= 2) {
      return { text: 'Worth limiting', icon: 'eco', color: 'text-mustard' }
    } else if (mediumConcerns === 1) {
      return { text: 'Mostly okay', icon: 'thumb_up', color: 'text-primary' }
    } else {
      return { text: 'Looks good!', icon: 'check_circle', color: 'text-primary' }
    }
  }
  
  const verdict = getVerdict()
  
  return (
    <div className="relative flex h-full min-h-screen w-full flex-col bg-paper dark:bg-background-dark overflow-hidden max-w-md mx-auto shadow-2xl">
      {/* Paper Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-60 z-0 mix-blend-multiply dark:mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`
        }}
      ></div>
      
      {/* Content Wrapper */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Top App Bar */}
        <div className="flex items-center p-4 pb-2 justify-between">
          <Link 
            to={fromHistory ? "/history" : "/analysis"}
            className="flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-black/5 transition-colors text-ink"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>arrow_back</span>
          </Link>
          <h2 className="text-ink/60 text-sm font-bold uppercase tracking-widest text-center">Summary</h2>
          <button 
            onClick={() => {
              clearAnalysis()
              navigate('/')
            }}
            className="flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-black/5 transition-colors text-ink"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>close</span>
          </button>
        </div>
        
        {/* Hero / Verdict Section */}
        <div className="flex flex-col items-center justify-center pt-6 pb-8 px-6 text-center">
          {/* Verdict Badge */}
          <div className="relative mb-6">
            <div className="absolute -inset-4 bg-primary/20 blur-xl rounded-full"></div>
            <div className="relative bg-white dark:bg-zinc-800 rounded-full p-6 shadow-[4px_4px_0px_0px_rgba(23,207,23,0.2)] border-2 border-primary border-dashed transform -rotate-2">
              <span className={`material-symbols-outlined ${verdict.color} text-5xl`}>{verdict.icon}</span>
            </div>
          </div>
          
          <h1 className="text-ink dark:text-white text-[32px] font-bold leading-tight mb-2 tracking-tight transform rotate-[-1deg]">
            {verdict.text.split(' ')[0]} <br />
            <span className="hand-drawn-underline">{verdict.text.split(' ').slice(1).join(' ')}</span>
          </h1>
          
          <p className="text-ink/60 dark:text-white/60 text-sm font-medium mt-3 max-w-[240px]">
            Verdict based on {ingredient_insights.length} ingredients found in your scan.
          </p>
          
          {/* Confidence Badge */}
          <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
            confidence_level === 'high' ? 'bg-primary/10 text-primary' :
            confidence_level === 'medium' ? 'bg-mustard/10 text-mustard' :
            'bg-gray-100 text-gray-500'
          }`}>
            <span className="material-symbols-outlined text-sm">
              {confidence_level === 'high' ? 'verified' : confidence_level === 'medium' ? 'help' : 'question_mark'}
            </span>
            {confidence_level} confidence
          </div>
        </div>
        
        {/* AI Guide Section */}
        <div className="flex-1 px-4 pb-24 space-y-6">
          {/* Chat Bubble Intro */}
          <div className="flex gap-4 items-start">
            <div className="shrink-0 pt-2">
              <div className="size-12 rounded-full bg-primary/10 border-2 border-primary overflow-hidden flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-2xl">smart_toy</span>
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 dark:border-zinc-700 relative">
              <p className="text-ink dark:text-gray-100 text-sm leading-relaxed">
                Here are my <span className="marker-highlight font-bold text-primary dark:text-green-400">doodle notes</span>! {summary}
              </p>
            </div>
          </div>
          
          {/* Cards Container */}
          <div className="space-y-4">
            {/* Watch Out Card */}
            {key_concerns.length > 0 && (
              <div className="crayon-border bg-[#fff5f5] dark:bg-red-900/10 border-red-200 dark:border-red-800 p-5 relative overflow-hidden group hover-wobble cursor-pointer transition-transform">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-red-100/50 rotate-2 backdrop-blur-sm z-10"></div>
                <div className="flex items-start justify-between relative z-0">
                  <div className="flex flex-col gap-1 pr-4">
                    <span className="text-red-500 dark:text-red-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">warning</span>
                      Watch Out
                    </span>
                    <h3 className="text-ink dark:text-white text-lg font-bold leading-tight mt-1">Key Concerns</h3>
                    <ul className="text-ink/70 dark:text-gray-300 text-sm leading-snug mt-1 space-y-1">
                      {key_concerns.map((concern, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-red-400 mt-1">•</span>
                          {concern}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="w-16 h-16 shrink-0 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center shadow-inner rotate-3 transform border-2 border-red-100 dark:border-red-900/30">
                    <span className="material-symbols-outlined text-red-400 text-3xl">error</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Good Stuff Card */}
            {positives.length > 0 && (
              <div className="crayon-border bg-[#f0fdf4] dark:bg-green-900/10 border-primary/30 p-5 relative overflow-hidden group hover-wobble cursor-pointer transition-transform">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-green-100/50 -rotate-1 backdrop-blur-sm z-10"></div>
                <div className="flex items-start justify-between relative z-0">
                  <div className="flex flex-col gap-1 pr-4">
                    <span className="text-primary dark:text-green-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">thumb_up</span>
                      Good News
                    </span>
                    <h3 className="text-ink dark:text-white text-lg font-bold leading-tight mt-1">Positives</h3>
                    <ul className="text-ink/70 dark:text-gray-300 text-sm leading-snug mt-1 space-y-1">
                      {positives.map((positive, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          {positive}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="w-16 h-16 shrink-0 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center shadow-inner -rotate-2 transform border-2 border-green-100 dark:border-green-900/30">
                    <span className="material-symbols-outlined text-primary text-3xl">favorite</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Uncertainty Notes */}
            {uncertainty_notes && (
              <div className="crayon-border bg-gray-50 dark:bg-gray-800/30 border-gray-200 p-4 relative">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-gray-400 text-xl mt-0.5">info</span>
                  <div>
                    <h4 className="text-sm font-bold text-ink/70 dark:text-gray-300">What we're not sure about</h4>
                    <p className="text-ink/60 dark:text-gray-400 text-sm mt-1">{uncertainty_notes}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Sticky Bottom Action */}
        <div className="fixed bottom-0 w-full max-w-md mx-auto bg-gradient-to-t from-paper via-paper to-transparent dark:from-background-dark dark:via-background-dark pt-12 pb-6 px-4 z-20">
          <p className="text-center text-xs text-ink/40 dark:text-white/40 mb-4 font-medium italic">
            <span className="material-symbols-outlined align-middle text-[14px] mr-1">info</span>
            This is guidance, not medical advice.
          </p>
          <div className="flex gap-3">
            <Link 
              to="/analysis"
              className="flex-1 bg-white dark:bg-zinc-800 text-ink dark:text-white font-bold py-4 px-6 rounded-full border-2 border-primary/20 shadow-[0px_4px_0px_0px_rgba(0,0,0,0.05)] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2"
            >
              Details
            </Link>
            <button 
              onClick={() => {
                clearAnalysis()
                navigate('/')
              }}
              className="flex-[2] bg-primary text-white font-bold py-4 px-6 rounded-full shadow-[0px_4px_0px_0px_#119c11] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 group"
            >
              <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">qr_code_scanner</span>
              Scan Next Item
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
