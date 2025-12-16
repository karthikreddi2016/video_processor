import TaskCard from './TaskCard'
import './TaskList.css'

function TaskList({ tasks }) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="no-tasks">
        <p>No processing tasks yet.  Create tasks to process this video.</p>
      </div>
    )
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskCard key={task._id} task={task} />
      ))}
    </div>
  )
}

export default TaskList