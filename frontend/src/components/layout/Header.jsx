import { useLocation } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'

const PAGE_TITLES = {
    '/dashboard': { title: 'Dashboard', description: "Today's HR overview at a glance" },
    '/employees': { title: 'Employees', description: 'Manage employee records' },
    '/attendance': { title: 'Attendance', description: 'Track and mark daily attendance' },
}

export default function Header() {
    const { pathname } = useLocation()
    const page = PAGE_TITLES[pathname] || { title: 'HRMS Lite', description: '' }
    const { theme, toggleTheme } = useTheme()
    const isDark = theme === 'dark'

    return (
        <header className="h-16 flex items-center justify-between px-6 header-bar flex-shrink-0">
            <div>
                <h1 className="text-base font-bold header-title">{page.title}</h1>
                {page.description && (
                    <p className="text-xs header-subtitle mt-0.5">{page.description}</p>
                )}
            </div>

            <div className="flex items-center gap-3">
                {/* Current date pill */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg pill-bg">
                    <svg className="w-3.5 h-3.5 pill-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-medium pill-text">
                        {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                </div>

                {/* Theme toggle */}
                <button
                    onClick={toggleTheme}
                    title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    className="theme-toggle-btn"
                    aria-label="Toggle theme"
                >
                    {isDark ? (
                        /* Sun icon */
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M18.364 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                        </svg>
                    ) : (
                        /* Moon icon */
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    )}
                </button>

                {/* Version badge */}
                <div className="px-2.5 py-1 rounded-lg version-badge">
                    <span className="text-xs font-semibold text-primary-400">v1.0.0</span>
                </div>
            </div>
        </header>
    )
}
