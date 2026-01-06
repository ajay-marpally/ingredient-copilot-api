export default function AIGuide({ message }) {
  return (
    <section className="p-6 pb-2">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 relative">
          <div 
            className="w-16 h-16 wobbly-circle bg-cover bg-center border-2 border-primary shadow-crayon bg-primary/10"
          >
            <div className="w-full h-full flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-3xl">smart_toy</span>
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white">
            AI
          </div>
        </div>
        
        <div className="flex-1">
          <div className="bg-white dark:bg-white/10 p-5 rounded-2xl wobbly-box border-2 border-gray-100 shadow-sm relative">
            <p className="text-ink/80 text-sm font-medium leading-relaxed">
              "{message}"
            </p>
            <div className="absolute top-6 -left-2 w-4 h-4 bg-white dark:bg-transparent border-l-2 border-b-2 border-gray-100 rotate-45"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
