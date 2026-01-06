export default function LoadingSpinner({ message = 'Analyzing...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary/20 rounded-full"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="mt-4 text-forest/60 dark:text-gray-300 text-sm font-medium">
        {message}
      </p>
    </div>
  )
}
