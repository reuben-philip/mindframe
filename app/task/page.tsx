"use client"
import React, { useState } from 'react';
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { useForm } from 'react-hook-form';
import "../globals.css";

interface Task {
    name: string;
    description: string;
    dueDate: string;
    priority: string;
}

export default function Task() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { register, handleSubmit, reset } = useForm<Task>();

    const onSubmit = (data: Task) => {
        setTasks([...tasks, data]);
        setIsModalOpen(false);
        reset();
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
                </nav>
            </div>

            <div className="user-button">
                <UserButton />
            </div>

            {/* Task List */}
            <div className="task-list">
                {tasks.length === 0 ? (
                    <div className="no-tasks-container">
                        <p className="no-tasks-title">No tasks yet</p>
                        <p className="no-tasks-sub">Take some time to relax</p>
                    </div>
                ) : (
                    tasks.map((task, index) => (
                        <div key={index} className="task-card">
                            <div className="task-card-header">
                                <h3 className="task-card-name">{task.name}</h3>
                                {task.priority && (
                                    <span className={`priority-badge priority-${task.priority}`}>
                                        {task.priority}
                                    </span>
                                )}
                            </div>
                            {task.description && <p className="task-card-desc">{task.description}</p>}
                            {task.dueDate && <p className="task-card-due">{task.dueDate}</p>}
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

            <div className="task-page-button">
                <button onClick={() => setIsModalOpen(true)}>+ Add Task</button>
            </div>
        </div>
    );
}