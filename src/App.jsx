import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

const DEFAULT_POMO = 25 * 60; // 25 minutes

export default function App() {
  // ---------- TIMER ----------
  const [totalSeconds, setTotalSeconds] = useState(() => {
    const saved = localStorage.getItem("totalSeconds");
    return saved ? Number(saved) : DEFAULT_POMO;
  });
  const [isRunning, setIsRunning] = useState(() => {
    const saved = localStorage.getItem("isRunning");
    return saved ? saved === "true" : false;
  });

  // persist timer state
  useEffect(() => localStorage.setItem("totalSeconds", String(totalSeconds)), [totalSeconds]);
  useEffect(() => localStorage.setItem("isRunning", String(isRunning)), [isRunning]);

  // tick
  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      setTotalSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  // stop when it hits 0
  useEffect(() => {
    if (totalSeconds === 0) setIsRunning(false);
  }, [totalSeconds]);

  const minutes = useMemo(() => String(Math.floor(totalSeconds / 60)).padStart(2, "0"), [totalSeconds]);
  const seconds = useMemo(() => String(totalSeconds % 60).padStart(2, "0"), [totalSeconds]);

  const start = () => {
    if (totalSeconds === 0) setTotalSeconds(DEFAULT_POMO);
    setIsRunning(true);
  };
  const pause = () => setIsRunning(false);
  const reset = () => {
    setIsRunning(false);
    setTotalSeconds(DEFAULT_POMO);
  };

  // ---------- TASKS ----------
  const [taskInput, setTaskInput] = useState("");
  const [tasks, setTasks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("tasks") || "[]");
    } catch {
      return [];
    }
  });

  // persist tasks
  useEffect(() => localStorage.setItem("tasks", JSON.stringify(tasks)), [tasks]);

  const addTask = () => {
    const text = taskInput.trim();
    if (text.length < 3) return;
    setTasks((t) => [...t, { id: crypto.randomUUID(), text, completed: false }]);
    setTaskInput("");
  };

  const toggleTask = (id) =>
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));

  const deleteTask = (id) => setTasks((ts) => ts.filter((t) => t.id !== id));

  const onKeyDown = (e) => {
    if (e.key === "Enter") addTask();
  };

  return (
    <div className="app">
      <header className="topbar">Pomodoro Todo List</header>

      <main className="container">
        {/* TIMER */}
        <section className="card timer-card">
          <h1>Pomodoro Timer</h1>

          <div className="time-boxes">
            <div className="time-box">
              <div className="time">{minutes}</div>
              <div className="label">Minutes</div>
            </div>
            <div className="time-box">
              <div className="time">{seconds}</div>
              <div className="label">Seconds</div>
            </div>
          </div>

          <div className="controls">
            <button className="btn primary" onClick={start}>Start</button>
            <button className="btn" onClick={pause}>Pause</button>
            <button className="btn danger" onClick={reset}>Reset</button>
          </div>
        </section>

        {/* TASKS */}
        <section className="card tasks-card">
          <h2>My Tasks</h2>

          <div className="task-input-row">
            <input
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Add a new task..."
            />
            <button className="btn primary" onClick={addTask}>Add</button>
          </div>

          {/* validation messages similar to your screenshot */}
          {taskInput.trim().length === 0 && <p className="error">Task is required</p>}
          {taskInput.trim().length > 0 && taskInput.trim().length < 3 && (
            <p className="error">Task minimum length is 3</p>
          )}

          <ul className="task-list">
            {tasks.map((t) => (
              <li key={t.id} className="task-item">
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={t.completed}
                    onChange={() => toggleTask(t.id)}
                  />
                  <span className={t.completed ? "text completed" : "text"}>
                    {t.text}
                  </span>
                </label>

                <button
                  title="Delete"
                  className="icon-btn"
                  onClick={() => deleteTask(t.id)}
                  aria-label={`Delete ${t.text}`}
                >
                  🗑
                </button>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
