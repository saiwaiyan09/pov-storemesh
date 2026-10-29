import { useCallback, useEffect, useState } from "react";

const API = "/api";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("checking");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadTasks = useCallback(async () => {
    setError("");
    try {
      const response = await fetch(`${API}/tasks/`);
      if (!response.ok) throw new Error("Could not load tasks.");
      setTasks(await response.json());
    } catch (requestError) {
      setError(requestError.message || "The task service is unavailable.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch(`${API}/health/`)
      .then((response) => {
        if (!response.ok) throw new Error("Backend unavailable");
        return response.json();
      })
      .then((data) => {
        if (active) setStatus(data.status === "healthy" ? "online" : "offline");
      })
      .catch(() => {
        if (active) setStatus("offline");
      });
    loadTasks();
    return () => {
      active = false;
    };
  }, [loadTasks]);

  async function addTask(event) {
    event.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`${API}/tasks/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description: description.trim() }),
      });
      if (!response.ok) throw new Error("Could not create the task.");
      setTitle("");
      setDescription("");
      await loadTasks();
    } catch (requestError) {
      setError(requestError.message || "The task could not be created.");
    } finally {
      setSaving(false);
    }
  }

  async function updateTask(task) {
    setError("");
    try {
      const response = await fetch(`${API}/tasks/${task.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed }),
      });
      if (!response.ok) throw new Error("Could not update the task.");
      await loadTasks();
    } catch (requestError) {
      setError(requestError.message || "The task could not be updated.");
    }
  }

  async function deleteTask(id) {
    setError("");
    try {
      const response = await fetch(`${API}/tasks/${id}/`, { method: "DELETE" });
      if (!response.ok) throw new Error("Could not delete the task.");
      await loadTasks();
    } catch (requestError) {
      setError(requestError.message || "The task could not be deleted.");
    }
  }

  const completedCount = tasks.filter((task) => task.completed).length;

  return (
    <main className="page">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Taskflow home">
          <span className="brand-mark">T</span>
          <span>taskflow</span>
        </a>
        <span className={`connection ${status}`}>
          <span className="status-dot" />
          API {status === "checking" ? "checking" : status}
        </span>
      </header>

      <section className="hero">
        <p className="eyebrow">INFRASTRUCTURE DEMO</p>
        <h1>Make room for<br />what matters.</h1>
        <p className="intro">A simple space to organize your work, powered by a containerized stack.</p>
      </section>

      <section className="workspace" aria-label="Task dashboard">
        <div className="section-heading">
          <div>
            <h2>Your tasks</h2>
            <p>{completedCount} of {tasks.length} completed</p>
          </div>
          <span className="task-count">{tasks.length}</span>
        </div>

        <form className="task-form" onSubmit={addTask}>
          <label className="sr-only" htmlFor="task-title">Task title</label>
          <input
            id="task-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What needs to get done?"
            maxLength={200}
            required
          />
          <label className="sr-only" htmlFor="task-description">Description (optional)</label>
          <input
            id="task-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Add a note (optional)"
          />
          <button type="submit" disabled={saving || !title.trim()}>
            {saving ? "Adding..." : "Add task"}
          </button>
        </form>

        {error && <p className="error" role="alert">{error}</p>}

        <div className="task-list" aria-live="polite">
          {loading ? (
            <p className="empty-state">Loading your tasks...</p>
          ) : tasks.length === 0 ? (
            <p className="empty-state">Nothing on your list yet. Add a task to get started.</p>
          ) : (
            tasks.map((task) => (
              <article className={`task ${task.completed ? "completed" : ""}`} key={task.id}>
                <input
                  className="task-checkbox"
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => updateTask(task)}
                  aria-label={`Mark ${task.title} ${task.completed ? "incomplete" : "complete"}`}
                />
                <div className="task-copy">
                  <h3>{task.title}</h3>
                  {task.description && <p>{task.description}</p>}
                </div>
                <button className="delete-button" onClick={() => deleteTask(task.id)} aria-label={`Delete ${task.title}`}>
                  Delete
                </button>
              </article>
            ))
          )}
        </div>
      </section>
      <footer>React <span>·</span> Django REST Framework <span>·</span> PostgreSQL</footer>
    </main>
  );
}
