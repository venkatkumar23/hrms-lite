/**
 * Loading spinner component for page/section level loading.
 */
export default function Spinner({ size = 'md', text = 'Loading...' }) {
    const sizeClass = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }[size]

    return (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className={`${sizeClass} spinner-primary`} />
            {text && <p className="text-sm text-slate-500">{text}</p>}
        </div>
    )
}

/**
 * Inline spinner for buttons/small areas.
 */
export function InlineSpinner({ className = '' }) {
    return <span className={`spinner-white w-4 h-4 ${className}`} />
}
