/**
 * Axios instance configured with base URL from environment variables.
 * All API calls should use this instance.
 */
import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 60000,
})

// ── Response interceptor: normalize errors ──────────────────────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message =
            error.response?.data?.detail ||
            error.response?.data?.message ||
            error.message ||
            'An unexpected error occurred'
        return Promise.reject(new Error(message))
    }
)

export default api


// ─────────────────────── Employee API ───────────────────────────

export const employeeApi = {
    /** Get all employees */
    getAll: () => api.get('/employees/'),

    /** Create a new employee */
    create: (data) => api.post('/employees/', data),

    /** Delete employee by string employee_id */
    delete: (employeeId) => api.delete(`/employees/${employeeId}`),
}


// ─────────────────────── Attendance API ─────────────────────────

export const attendanceApi = {
    /** Get all attendance records, optionally filtered by date */
    getAll: (date) => {
        const params = date ? { date } : {}
        return api.get('/attendance/', { params })
    },

    /** Get attendance for a specific employee */
    getByEmployee: (employeeId, date) => {
        const params = date ? { date } : {}
        return api.get(`/attendance/${employeeId}`, { params })
    },

    /** Mark attendance */
    mark: (data) => api.post('/attendance/', data),
}


// ─────────────────────── Dashboard API ──────────────────────────

export const dashboardApi = {
    /** Get dashboard statistics */
    get: () => api.get('/dashboard'),
}
