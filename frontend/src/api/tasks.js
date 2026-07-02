const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

async function handleResponse(res) {
  const isJson = res.headers.get('content-type')?.includes('application/json')
  const body = isJson ? await res.json() : null

  if (!res.ok) {
    const message = body?.error || `Request failed with status ${res.status}`
    throw new Error(message)
  }
  return body
}

export const tasksApi = {
  async list(filters = {}) {
    const params = new URLSearchParams(filters)
    const query = params.toString() ? `?${params.toString()}` : ''
    const res = await fetch(`${API_BASE}/tasks${query}`)
    return handleResponse(res)
  },

  async create(task) {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    })
    return handleResponse(res)
  },

  async update(id, updates) {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    return handleResponse(res)
  },

  async remove(id) {
    const res = await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' })
    return handleResponse(res)
  },
}
