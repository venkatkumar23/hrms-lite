/**
 * Reusable Button component.
 * Variants: primary | secondary | danger | success | ghost
 */
export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    onClick,
    type = 'button',
    className = '',
    ...props
}) {
    const variantClass = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        danger: 'btn-danger',
        success: 'btn-success',
        ghost: 'btn bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800',
    }[variant]

    const sizeClass = {
        sm: 'px-3 py-1.5 text-xs',
        md: '',
        lg: 'px-6 py-3 text-base',
    }[size]

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`${variantClass} ${sizeClass} ${className}`}
            {...props}
        >
            {loading && (
                <span className="spinner-white w-3.5 h-3.5" />
            )}
            {children}
        </button>
    )
}
