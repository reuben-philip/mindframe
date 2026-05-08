"use client"
import { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { useForm } from 'react-hook-form';

interface Task {
    id: number;
    name: string;
    description: string;
    dueDate: string;
    priority: string;
}

type TaskFormData = Omit<Task, "id">;

export default function Task() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [prompt, setPrompt] = useState("");
    const [promptLoading, setPromptLoading] = useState(false);
    const [aiMessage, setAiMessage] = useState<string | null>(null);
    const promptRef = useRef<HTMLInputElement>(null);
    const { register, handleSubmit, reset } = useForm<TaskFormData>();

    useEffect(() => {
        fetch("/api/tasks")
            .then((r) => r.json())
            .then((data) => setTasks(data.tasks ?? []))
            .finally(() => setLoading(false));
    }, []);

    const onSubmit = async (data: TaskFormData) => {
        const res = await fetch("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        const { id } = await res.json();
        setTasks([{ id, ...data }, ...tasks]);
        setIsModalOpen(false);
        reset();
    };

    const deleteTask = async (id: number) => {
        await fetch(`/api/tasks/${id}`, { method: "DELETE" });
        setTasks(tasks.filter((t) => t.id !== id));
    };

    async function sendPrompt() {
        const text = prompt.trim();
        if (!text || promptLoading) return;
        setPromptLoading(true);
        setAiMessage(null);
        setPrompt("");

        const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: [{ role: "user", content: text }] }),
        });

        const data = await res.json();
        const reply: string = data.response ?? "";

        const taskMatch = reply.match(/<task_create>([\s\S]*?)<\/task_create>/);
        if (taskMatch) {
            try {
                const taskData = JSON.parse(taskMatch[1]);
                const createRes = await fetch("/api/tasks", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(taskData),
                });
                const { id } = await createRes.json();
                const newTask: Task = {
                    id,
                    name: taskData.name ?? "",
                    description: taskData.description ?? "",
                    dueDate: taskData.dueDate ?? "",
                    priority: taskData.priority ?? "",
                };
                setTasks((prev) => [newTask, ...prev]);
                setAiMessage(`Added "${newTask.name}" to your tasks.`);
            } catch {
                setAiMessage("Couldn't parse the task. Please try again.");
            }
        } else {
            setAiMessage(reply || "No task was created.");
        }

        setPromptLoading(false);
        setTimeout(() => setAiMessage(null), 4000);
        promptRef.current?.focus();
    }

    return (
        <div>
            <div className="nav-bar">
                <nav>
                    <Link className="nav-link" href="/dashboard">Dashboard</Link>
                    <Link className="nav-link" href="/email">Email</Link>
                    <Link className="nav-link" href="/priority">Priority</Link>
                    <Link className="nav-link" href="/calender">Calendar</Link>
                    <Link className="nav-link" href="/task">Task</Link>
                    <Link className="nav-link" href="/notes">Notes</Link>
                </nav>
            </div>

            <div className="user-button">
                <UserButton />
            </div>

            <div className="task-list">
                {loading ? (
                    <div className="no-tasks-container">
                        <p className="no-tasks-title">Loading tasks...</p>
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="no-tasks-container">
                        <p className="no-tasks-title">No tasks yet</p>
                        <p className="no-tasks-sub">Take some time to relax</p>
                    </div>
                ) : (
                    tasks.map((task) => (
                        <div key={task.id} className="task-card">
                            <div className="task-card-header">
                                <h3 className="task-card-name">{task.name}</h3>
                                <div className="task-card-actions">
                                    {task.priority && (
                                        <span className={`priority-badge priority-${task.priority}`}>
                                            {task.priority}
                                        </span>
                                    )}
                                    <button
                                        className="task-delete-btn"
                                        onClick={() => deleteTask(task.id)}
                                        aria-label="Delete task"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                            {task.description && <p className="task-card-desc">{task.description}</p>}
                            {task.dueDate && <p className="task-card-due">Due: {task.dueDate}</p>}
                        </div>
                    ))
                )}
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">Add Task</h2>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="modal-field">
                                <label>Task Name</label>
                                <input type="text" placeholder="Enter task name..." {...register("name", { required: true })} />
                            </div>

                            <div className="modal-field">
                                <label>Description</label>
                                <textarea placeholder="Enter description..." rows={3} {...register("description")} />
                            </div>

                            <div className="modal-field">
                                <label>Due Date</label>
                                <input type="date" {...register("dueDate")} />
                            </div>

                            <div className="modal-field">
                                <label>Priority</label>
                                <select {...register("priority")}>
                                    <option value="">Select priority</option>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="modal-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="modal-submit">Add Task</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {aiMessage && (
                <div className="task-ai-message">{aiMessage}</div>
            )}

            <div className="task-prompt-container">
                <input
                    ref={promptRef}
                    className="search-bar"
                    type="text"
                    placeholder={promptLoading ? "Thinking..." : "Describe a task to add…"}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendPrompt()}
                    disabled={promptLoading}
                />
            </div>

            <button className="task-page-button" onClick={() => setIsModalOpen(true)}>+ Add Task</button>
        </div>
    );
}
