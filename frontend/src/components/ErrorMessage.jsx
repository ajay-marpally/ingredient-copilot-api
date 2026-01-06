export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-brick/10 rounded-full flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-brick text-3xl">error</span>
      </div>
      <h3 className="text-lg font-bold text-ink dark:text-white mb-2">
        Oops! Something went wrong
      </h3>
      <p className="text-ink/60 dark:text-gray-300 text-sm mb-4">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  )
}
