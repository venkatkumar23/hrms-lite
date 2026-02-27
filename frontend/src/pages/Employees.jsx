import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { employeeApi } from '../services/api'
import { formatDateTime } from '../utils/helpers'
import { useFetch, useMutation } from '../hooks/useFetch'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import Table from '../components/ui/Table'
import Alert from '../components/ui/Alert'

const DEPARTMENTS = [
    'Engineering', 'Design', 'Product', 'Marketing',
    'Sales', 'HR', 'Finance', 'Operations', 'Customer Support', 'Legal',
]

const INITIAL_FORM = { employee_id: '', full_name: '', email: '', department: '' }

function validateForm(form) {
    const errors = {}
    if (!form.employee_id.trim()) errors.employee_id = 'Employee ID is required'
    if (!form.full_name.trim()) errors.full_name = 'Full name is required'
    if (!form.email.trim()) errors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email address'
    if (!form.department.trim()) errors.department = 'Department is required'
    return errors
}

export default function Employees() {
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState(INITIAL_FORM)
    const [errors, setErrors] = useState({})
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [formError, setFormError] = useState('')

    const { data, loading, error, refetch } = useFetch(
        useCallback(() => employeeApi.getAll(), []),
        [],
        true
    )

    const { mutate: createEmployee, loading: creating } = useMutation(
        (payload) => employeeApi.create(payload)
    )
    const { mutate: deleteEmployee, loading: deleting } = useMutation(
        (id) => employeeApi.delete(id)
    )

    const employees = data?.employees || []

    function handleChange(field) {
        return (e) => {
            setForm((prev) => ({ ...prev, [field]: e.target.value }))
            if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
        }
    }

    async function handleSubmit(e) {
        e.preventDefault()
        const validationErrors = validateForm(form)
        if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return }
        setFormError('')
        try {
            await createEmployee(form)
            toast.success(`Employee ${form.full_name} added successfully!`)
            setForm(INITIAL_FORM); setErrors({}); setShowModal(false); refetch()
        } catch (err) { setFormError(err.message) }
    }

    async function handleDelete() {
        if (!deleteTarget) return
        try {
            await deleteEmployee(deleteTarget.employee_id)
            toast.success(`${deleteTarget.full_name} has been removed.`)
            setDeleteTarget(null); refetch()
        } catch (err) {
            toast.error(err.message); setDeleteTarget(null)
        }
    }

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
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700
                          flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
                        {v.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{v}</span>
                </div>
            ),
        },
        {
            key: 'email',
            label: 'Email',
            render: (v) => <span style={{ color: 'var(--text-muted)' }}>{v}</span>,
        },
        {
            key: 'department',
            label: 'Department',
            render: (v) => (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium
                         bg-primary-600/10 border border-primary-600/20 text-primary-400">
                    {v}
                </span>
            ),
        },
        {
            key: 'total_present_days',
            label: 'Present Days',
            render: (v) => <span className="font-semibold text-emerald-500">{v}</span>,
        },
        {
            key: 'created_at',
            label: 'Joined',
            render: (v) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDateTime(v)}</span>,
        },
        {
            key: '_actions',
            label: '',
            render: (_, row) => (
                <button
                    onClick={() => setDeleteTarget(row)}
                    className="btn-danger text-xs px-2.5 py-1.5"
                    aria-label={`Delete ${row.full_name}`}
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                </button>
            ),
        },
    ]

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Employee Directory</h2>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {data ? `${data.total} employee${data.total !== 1 ? 's' : ''} registered` : 'Manage your team'}
                    </p>
                </div>
                <Button variant="primary" onClick={() => { setShowModal(true); setFormError(''); setErrors({}) }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Employee
                </Button>
            </div>

            {error && <Alert type="error" message={error} />}

            {/* Employees table */}
            <div className="card">
                <div className="px-5 py-4 flex items-center justify-between"
                    style={{ borderBottom: '1px solid var(--border-default)' }}>
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>All Employees</h3>
                    {employees.length > 0 && (
                        <span className="badge" style={{
                            background: 'var(--bg-input)',
                            color: 'var(--text-muted)',
                            border: '1px solid var(--border-subtle)'
                        }}>
                            {employees.length} records
                        </span>
                    )}
                </div>
                <Table
                    columns={columns}
                    data={employees}
                    loading={loading}
                    emptyMessage="No employees yet. Add your first employee to get started."
                />
            </div>

            {/* Add Employee Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Employee">
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    {formError && <Alert type="error" message={formError} onDismiss={() => setFormError('')} />}
                    <div className="grid grid-cols-2 gap-4">
                        <Input id="emp-id" label="Employee ID" placeholder="e.g. EMP001"
                            value={form.employee_id} onChange={handleChange('employee_id')}
                            error={errors.employee_id} required />
                        <Input id="full-name" label="Full Name" placeholder="e.g. John Smith"
                            value={form.full_name} onChange={handleChange('full_name')}
                            error={errors.full_name} required />
                    </div>
                    <Input id="email" label="Email Address" type="email"
                        placeholder="e.g. john@company.com"
                        value={form.email} onChange={handleChange('email')}
                        error={errors.email} required />
                    <div>
                        <label htmlFor="dept" className="label">
                            Department <span className="text-red-400">*</span>
                        </label>
                        <select id="dept" value={form.department} onChange={handleChange('department')}
                            className={`input ${errors.department ? 'input-error' : ''}`}>
                            <option value="">Select department…</option>
                            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                        {errors.department && <p className="text-xs text-red-400 mt-1">{errors.department}</p>}
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button variant="primary" type="submit" loading={creating}>Add Employee</Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Employee" size="sm">
                <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-red-500/5 border border-red-500/15">
                        <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                Remove <strong>{deleteTarget?.full_name}</strong>?
                            </p>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                This will permanently delete the employee and all their attendance records. This action cannot be undone.
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                        <Button variant="danger" loading={deleting} onClick={handleDelete}>Yes, Delete</Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
