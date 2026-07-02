import { useEffect, useMemo, useState, useCallback } from 'react'
import { tasksApi } from './api/tasks'
import TaskForm from './components/TaskForm'
import TaskEntry from './components/TaskEntry'
import FilterBar from './components/FilterBar'

export default function App() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadTasks = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await tasksApi.list()
      setTasks(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  async function handleCreate(payload) {
    setIsSubmitting(true)
    try {
      const created = await tasksApi.create(payload)
      setTasks((prev) => [created, ...prev])
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleStatusChange(id, status) {
    const updated = await tasksApi.update(id, { status })
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
  }

  async function handleDelete(id) {
    await tasksApi.remove(id)
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  const visibleTasks = useMemo(() => {
    if (filter === 'all') return tasks
    return tasks.filter((t) => t.status === filter)
  }, [tasks, filter])

  const tally = useMemo(() => {
    return {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === 'pending').length,
      in_progress: tasks.filter((t) => t.status === 'in_progress').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
    }
  }, [tasks])

  return (
    <div className="app">
      <header className="ledger-head">
        <h1>Task Ledger</h1>
        <div className="ledger-meta">
          <div><strong>React</strong> · Flask · PostgreSQL</div>
          <div>3-tier reference build</div>
        </div>
      </header>

      <div className="tally-row">
        <span><b>{tally.total}</b>logged</span>
        <span><b>{tally.pending}</b>pending</span>
        <span><b>{tally.in_progress}</b>in progress</span>
        <span><b>{tally.completed}</b>completed</span>
      </div>

      <TaskForm onCreate={handleCreate} isSubmitting={isSubmitting} />

      <FilterBar active={filter} onChange={setFilter} />

      <div className="entries">
        {loading && <div className="loading-state">Reading the ledger…</div>}

        {!loading && error && (
          <div className="error-state">
            Couldn't reach the API: {error}. Check that Flask is running on the configured URL.
          </div>
        )}

        {!loading && !error && visibleTasks.length === 0 && (
          <div className="empty-state">
            {filter === 'all' ? 'No entries yet. Log the first one above.' : `No ${filter.replace('_', ' ')} entries.`}
          </div>
        )}

        {!loading && !error && visibleTasks.map((task) => (
          <TaskEntry
            key={task.id}
            task={task}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  )
}
