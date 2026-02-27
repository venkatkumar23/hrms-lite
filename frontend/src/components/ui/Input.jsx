/**
 * Reusable Input component with label and error state.
 */
export default function Input({
    id,
    label,
    type = 'text',
    placeholder = '',
    value,
    onChange,
    error = '',
    required = false,
    disabled = false,
    className = '',
    hint = '',
    ...props
}) {
    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            {label && (
                <label htmlFor={id} className="label">
                    {label}
                    {required && <span className="text-red-400 ml-0.5">*</span>}
                </label>
            )}
            <input
                id={id}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                disabled={disabled}
                required={required}
                className={`input ${error ? 'input-error' : ''}`}
                {...props}
            />
            {hint && !error && (
                <p className="text-xs text-slate-500">{hint}</p>
            )}
            {error && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                    <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    )
}
