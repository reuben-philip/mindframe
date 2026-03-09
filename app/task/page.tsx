"use client"
import React, { useState } from 'react';
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import "../globals.css";

export default function Task() {
    const [isModalOpen, setIsModalOpen] = useState(false);

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

            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">Add Task</h2>

                        <div className="modal-field">
                            <label>Task Name</label>
                            <input type="text" placeholder="Enter task name..." />
                        </div>

                        <div className="modal-field">
                            <label>Description</label>
                            <textarea placeholder="Enter description..." rows={3} />
                        </div>

                        <div className="modal-field">
                            <label>Due Date</label>
                            <input type="date" />
                        </div>

                        <div className="modal-field">
                            <label>Priority</label>
                            <select>
                                <option value="">Select priority</option>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>

                        <div className="modal-actions">
                            <button className="modal-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button className="modal-submit">Add Task</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="task-page-button">
                <button onClick={() => setIsModalOpen(true)}>Add Task</button>
            </div>
        </div>
    );
}