import TaskCard from './TaskCard'
import './TaskList.css'

function TaskList({ tasks, onTaskDeleted }) {
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
        <TaskCard 
          key={task._id} 
          task={task}
          onTaskDeleted={onTaskDeleted}
        />
      ))}
    </div>
  )
}

export default TaskList