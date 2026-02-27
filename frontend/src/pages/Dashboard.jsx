import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { dashboardApi } from '../services/api'
import { getTodayDate, formatDate } from '../utils/helpers'
import Spinner from '../components/ui/Spinner'
import Alert from '../components/ui/Alert'
import Table from '../components/ui/Table'

/* ─── Stat card sub-component ─────────────────────────────────── */
function StatCard({ label, value, icon, accentClass, loading }) {
    return (
        <div className={`card p-5 flex items-start gap-4 border-l-4 ${accentClass}`}>
            <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.06)' }}>
                {icon}
            </div>
            <div>
                {loading ? (
                    <div className="h-7 w-12 rounded animate-pulse mb-1"
                        style={{ background: 'var(--border-subtle)' }} />
                ) : (
                    <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value ?? 0}</p>
                )}
                <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
            </div>
        </div>
    )
}

/* ─── Main Dashboard page ──────────────────────────────────────── */
export default function Dashboard() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const today = formatDate(getTodayDate())

    useEffect(() => {
        dashboardApi.get()
            .then((res) => setData(res.data))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }, [])

    const columns = [
        {
            key: 'employee_id',
            label: 'Employee ID',
            render: (v) => (
                <span className="font-mono text-xs px-2 py-0.5 rounded"
                    style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)' }}>
                    {v}
                </span>
            ),
        },
        {
            key: 'full_name',
            label: 'Full Name',
            render: (v) => (
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-primary-700
                          flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
                        {v.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{v}</span>
                </div>
            ),
        },
        {
            key: 'department',
            label: 'Department',
            render: (v) => (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                    style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)' }}>
                    {v}
                </span>
            ),
        },
        {
            key: 'total_present',
            label: 'Present Days',
            render: (v) => <span className="font-semibold text-emerald-500">{v}</span>,
        },
        {
            key: 'total_absent',
            label: 'Absent Days',
            render: (v) => <span className="font-semibold text-red-500">{v}</span>,
        },
        {
            key: '_attendance_rate',
            label: 'Attendance Rate',
            render: (_, row) => {
                const total = row.total_present + row.total_absent
                if (total === 0) return <span style={{ color: 'var(--text-muted)' }}>—</span>
                const rate = Math.round((row.total_present / total) * 100)
                const color = rate >= 80 ? 'bg-emerald-500' : rate >= 60 ? 'bg-amber-500' : 'bg-red-500'
                return (
                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full min-w-[60px]"
                            style={{ background: 'var(--border-subtle)' }}>
                            <div className={`h-1.5 rounded-full ${color} transition-all`}
                                style={{ width: `${rate}%` }} />
                        </div>
                        <span className="text-xs font-medium tabular-nums"
                            style={{ color: 'var(--text-muted)' }}>{rate}%</span>
                    </div>
                )
            },
        },
    ]

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Overview</h2>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Today — {today}</p>
                </div>
                <div className="flex gap-2">
                    <Link to="/employees" className="btn-secondary text-xs px-3 py-2">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Employee
                    </Link>
                    <Link to="/attendance" className="btn-primary text-xs px-3 py-2">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Mark Attendance
                    </Link>
                </div>
            </div>

            {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                    label="Total Employees" value={data?.total_employees} loading={loading} accentClass="border-primary-500"
                    icon={<svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>}
                />
                <StatCard
                    label="Present Today" value={data?.total_present_today} loading={loading} accentClass="border-emerald-500"
                    icon={<svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>}
                />
                <StatCard
                    label="Absent Today" value={data?.total_absent_today} loading={loading} accentClass="border-red-500"
                    icon={<svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>}
                />
            </div>

            {/* Employee summary table */}
            <div className="card">
                <div className="flex items-center justify-between px-5 py-4"
                    style={{ borderBottom: '1px solid var(--border-default)' }}>
                    <div>
                        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Employee Summary</h3>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            All-time attendance breakdown per employee
                        </p>
                    </div>
                    {data && (
                        <span className="badge" style={{
                            background: 'var(--bg-input)',
                            color: 'var(--text-muted)',
                            border: '1px solid var(--border-subtle)'
                        }}>
                            {data.total_employees} total
                        </span>
                    )}
                </div>
                {loading ? (
                    <Spinner />
                ) : (
                    <Table
                        columns={columns}
                        data={data?.employees_summary || []}
                        emptyMessage="No employees found. Add employees to see their summary here."
                    />
                )}
            </div>
        </div>
    )
}
