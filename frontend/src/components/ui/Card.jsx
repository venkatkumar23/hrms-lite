/**
 * Reusable Card component.
 */
export default function Card({ children, className = '', hover = false }) {
    return (
        <div className={`${hover ? 'card-hover' : 'card'} ${className}`}>
            {children}
        </div>
    )
}

export function CardHeader({ title, subtitle, action, className = '' }) {
    return (
        <div className={`flex items-center justify-between px-5 py-4 border-b border-slate-800 ${className}`}>
            <div>
                <h3 className="text-sm font-semibold text-white">{title}</h3>
                {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
            {action && <div>{action}</div>}
        </div>
    )
}

export function CardBody({ children, className = '' }) {
    return (
        <div className={`p-5 ${className}`}>
            {children}
        </div>
    )
}
