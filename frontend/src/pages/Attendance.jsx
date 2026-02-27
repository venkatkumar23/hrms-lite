import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { attendanceApi, employeeApi } from '../services/api'
import { getTodayDate, formatDate } from '../utils/helpers'
import { useFetch, useMutation } from '../hooks/useFetch'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Table from '../components/ui/Table'
import Alert from '../components/ui/Alert'

const INITIAL_FORM = { employee_id: '', date: getTodayDate(), status: 'Present' }

export default function Attendance() {
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState(INITIAL_FORM)
    const [errors, setErrors] = useState({})
    const [formError, setFormError] = useState('')
    const [dateFilter, setDateFilter] = useState('')
    const [employeeFilter, setEmployeeFilter] = useState('')

    const { data: attendanceData, loading: attLoading, error: attError, refetch: refetchAtt } = useFetch(
        useCallback(() => attendanceApi.getAll(dateFilter || undefined), [dateFilter]),
        [dateFilter],
        true
    )

    const { data: employeesData } = useFetch(
        useCallback(() => employeeApi.getAll(), []),
        [],
        true
    )

    const { mutate: markAttendance, loading: marking } = useMutation(
        (payload) => attendanceApi.mark(payload)
    )

    const employees = employeesData?.employees || []
    const allRecords = attendanceData?.records || []
    const records = employeeFilter
        ? allRecords.filter((r) => r.employee_string_id === employeeFilter)
        : allRecords

    function handleChange(field) {
        return (e) => {
            setForm((prev) => ({ ...prev, [field]: e.target.value }))
            if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
        }
    }

    function validateForm() {
        const errs = {}
        if (!form.employee_id) errs.employee_id = 'Please select an employee'
        if (!form.date) errs.date = 'Date is required'
        if (!form.status) errs.status = 'Status is required'
        return errs
    }

    async function handleSubmit(e) {
        e.preventDefault()
        const validationErrors = validateForm()
        if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return }
        setFormError('')
        try {
            await markAttendance(form)
            const emp = employees.find((e) => e.employee_id === form.employee_id)
            toast.success(`Attendance marked: ${emp?.full_name || form.employee_id} — ${form.status}`)
            setForm({ ...INITIAL_FORM }); setErrors({}); setShowModal(false); refetchAtt()
        } catch (err) { setFormError(err.message) }
    }

    const columns = [
        {
            key: 'employee_string_id',
            label: 'Employee ID',
            render: (v) => (
                <span className="font-mono text-xs px-2 py-0.5 rounded"
                    style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)' }}>
                    {v}
                </span>
            ),
        },
        {
            key: 'employee_name',
            label: 'Employee',
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
            key: 'date',
            label: 'Date',
            render: (v) => <span style={{ color: 'var(--text-secondary)' }}>{formatDate(v)}</span>,
        },
        {
            key: 'status',
            label: 'Status',
            render: (v) => (
                <span className={v === 'Present' ? 'badge-present' : 'badge-absent'}>
                    {v === 'Present' ? '✓' : '✗'} {v}
                </span>
            ),
        },
    ]

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Attendance Tracker</h2>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {attendanceData
                            ? `${attendanceData.total} record${attendanceData.total !== 1 ? 's' : ''}`
                            : 'Mark and view daily attendance'}
                    </p>
                </div>
                <Button variant="primary"
                    onClick={() => { setShowModal(true); setFormError(''); setErrors({}) }}
                    disabled={employees.length === 0}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Mark Attendance
                </Button>
            </div>

            {employees.length === 0 && !attLoading && (
                <Alert type="warning" message="No employees found. Please add employees before marking attendance." />
            )}
            {attError && <Alert type="error" message={attError} />}

            {/* Filters */}
            <div className="card p-4">
                <div className="flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="label">Filter by Date</label>
                        <input type="date" value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="input w-44" />
                    </div>
                    <div>
                        <label className="label">Filter by Employee</label>
                        <select value={employeeFilter}
                            onChange={(e) => setEmployeeFilter(e.target.value)}
                            className="input w-52">
                            <option value="">All Employees</option>
                            {employees.map((emp) => (
                                <option key={emp.employee_id} value={emp.employee_id}>
                                    {emp.full_name} ({emp.employee_id})
                                </option>
                            ))}
                        </select>
                    </div>
                    {(dateFilter || employeeFilter) && (
                        <Button variant="ghost" size="sm"
                            onClick={() => { setDateFilter(''); setEmployeeFilter('') }}>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Clear Filters
                        </Button>
                    )}
                </div>
            </div>

            {/* Attendance table */}
            <div className="card">
                <div className="px-5 py-4 flex items-center justify-between"
                    style={{ borderBottom: '1px solid var(--border-default)' }}>
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {dateFilter ? `Attendance for ${formatDate(dateFilter)}` : 'All Attendance Records'}
                    </h3>
                    <div className="flex gap-2">
                        <span className="badge-present">
                            {records.filter(r => r.status === 'Present').length} Present
                        </span>
                        <span className="badge-absent">
                            {records.filter(r => r.status === 'Absent').length} Absent
                        </span>
                    </div>
                </div>
                <Table columns={columns} data={records} loading={attLoading}
                    emptyMessage={
                        dateFilter
                            ? `No attendance records found for ${formatDate(dateFilter)}.`
                            : 'No attendance records yet. Mark attendance to get started.'
                    }
                />
            </div>

            {/* Mark Attendance Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Mark Attendance">
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    {formError && <Alert type="error" message={formError} onDismiss={() => setFormError('')} />}

                    <div>
                        <label htmlFor="att-emp" className="label">
                            Employee <span className="text-red-400">*</span>
                        </label>
                        <select id="att-emp" value={form.employee_id} onChange={handleChange('employee_id')}
                            className={`input ${errors.employee_id ? 'input-error' : ''}`}>
                            <option value="">Select employee…</option>
                            {employees.map((emp) => (
                                <option key={emp.employee_id} value={emp.employee_id}>
                                    {emp.full_name} — {emp.employee_id} ({emp.department})
                                </option>
                            ))}
                        </select>
                        {errors.employee_id && <p className="text-xs text-red-400 mt-1">{errors.employee_id}</p>}
                    </div>

                    <div>
                        <label htmlFor="att-date" className="label">
                            Date <span className="text-red-400">*</span>
                        </label>
                        <input id="att-date" type="date" value={form.date}
                            onChange={handleChange('date')} max={getTodayDate()}
                            className={`input ${errors.date ? 'input-error' : ''}`} />
                        {errors.date && <p className="text-xs text-red-400 mt-1">{errors.date}</p>}
                    </div>

                    <div>
                        <label className="label">Status <span className="text-red-400">*</span></label>
                        <div className="flex gap-3">
                            {['Present', 'Absent'].map((s) => (
                                <label key={s} className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-lg
                                    border cursor-pointer transition-all duration-150
                                    ${form.status === s
                                        ? s === 'Present'
                                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                                            : 'bg-red-500/10 border-red-500/40 text-red-400'
                                        : ''
                                    }`}
                                    style={form.status !== s ? {
                                        background: 'var(--bg-input)',
                                        borderColor: 'var(--border-subtle)',
                                        color: 'var(--text-muted)'
                                    } : {}}>
                                    <input type="radio" name="status" value={s}
                                        checked={form.status === s}
                                        onChange={handleChange('status')}
                                        className="hidden" />
                                    <span className="text-lg">{s === 'Present' ? '✓' : '✗'}</span>
                                    <span className="text-sm font-medium">{s}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button variant="primary" type="submit" loading={marking}>Mark Attendance</Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
