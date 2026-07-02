const STATUS_LABEL = {
  pending: 'Pending',
  in_progress: 'In progress',
  completed: 'Completed',
}

export default function TaskEntry({ task, onStatusChange, onDelete }) {
  const isCompleted = task.status === 'completed'

  return (
    <div className="entry">
      <div className="entry-id">{String(task.id).padStart(3, '0')}</div>

      <div className="entry-body">
        <h3 className={isCompleted ? 'completed-text' : ''}>{task.title}</h3>
        {task.description && <p>{task.description}</p>}
      </div>

      <div className="entry-stamps">
        <span className={`stamp status-${task.status}`}>{STATUS_LABEL[task.status]}</span>
        <span className={`stamp priority-${task.priority}`}>{task.priority}</span>
      </div>

      <div className="entry-actions">
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value)}
          aria-label={`Change status for ${task.title}`}
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
        </select>
        <button
          className="icon-btn"
          onClick={() => onDelete(task.id)}
          aria-label={`Delete ${task.title}`}
          title="Delete entry"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
