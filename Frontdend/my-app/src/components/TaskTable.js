import "../App.css";

const TaskTable = ({ tasks }) => {
  const getBadgeClass = (status) => {
    if (status === "Completed") return "badge badge-completed";
    if (status === "In Progress") return "badge badge-progress";
    return "badge badge-pending";
  };

  return (
    <div className="table-box">
      <h3>Task Overview</h3>
      <table className="styled-table">
        <thead>
          <tr>
            <th>Task</th>
            <th>Status</th>
            <th>Assigned To</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td>{task.title}</td>
              <td><span className={getBadgeClass(task.status)}>{task.status}</span></td>
              <td>{task.employee}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskTable;
