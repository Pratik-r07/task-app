import { useState } from 'react'

export default function TaskForm({ onCreate, isSubmitting }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) {
      setError('Give the entry a title before logging it.')
      return
    }
    setError('')
    try {
      await onCreate({ title: title.trim(), description: description.trim(), priority })
      setTitle('')
      setDescription('')
      setPriority('medium')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <form className="entry-form" onSubmit={handleSubmit}>
      <div className="entry-form-row">
        <input
          type="text"
          placeholder="What needs doing?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="Task title"
        />
        <select value={priority} onChange={(e) => setPriority(e.target.value)} aria-label="Priority">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button type="submit" className="btn-commit" disabled={isSubmitting}>
          {isSubmitting ? 'Logging…' : 'Log entry'}
        </button>
      </div>
      <div className="entry-form-row">
        <textarea
          placeholder="Notes (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          aria-label="Task description"
        />
      </div>
      {error && <p className="form-error">{error}</p>}
    </form>
  )
}
