import { NavLink } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import logoDark from '../../assets/logo-dark.png'
import logoLight from '../../assets/logo-light.png'

const navItems = [
    {
        path: '/dashboard',
        label: 'Dashboard',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                    d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM14 15a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1h-4a1 1 0 01-1-1v-5z" />
            </svg>
        ),
    },
    {
        path: '/employees',
        label: 'Employees',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
    },
    {
        path: '/attendance',
        label: 'Attendance',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5h6m-3 4v6m-3-3h6" />
            </svg>
        ),
    },
]

export default function Sidebar() {
    const { theme } = useTheme()
    const logo = theme === 'dark' ? logoDark : logoLight

    return (
        <aside className="w-64 flex-shrink-0 sidebar-bg flex flex-col">
            {/* Logo / Brand */}
            <div className="h-20 flex items-center px-5" style={{ borderBottom: '1px solid var(--border-default)' }}>
                <img src={logo} alt="Logo" className="h-30 w-auto object-contain" />
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-widest"
                    style={{ color: 'var(--text-muted)' }}>
                    Navigation
                </p>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => isActive ? 'nav-item-active' : 'nav-item'}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className="px-5 py-4" style={{ borderTop: '1px solid var(--border-default)' }}>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-500 to-slate-600
                          flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        AD
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-secondary)' }}>Administrator</p>
                        <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>admin@company.com</p>
                    </div>
                </div>
            </div>
        </aside>
    )
}
