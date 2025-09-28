// src/components/Dashboard.js

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { fetchTodos, createTodo, updateTodo, deleteTodo as deleteTodoApi } from '../api';
import './Dashboard.css';

// Helper functions for date logic
const isToday = (someDate) => {
    if (!someDate) return false;
    const today = new Date();
    const date = new Date(someDate);
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
};
const isOverdue = (someDate) => {
    if (!someDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(someDate) < today;
};

const Dashboard = () => {
    const [todos, setTodos] = useState([]);
    const [newTodoTitle, setNewTodoTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { token } = useContext(AuthContext);
    const [currentView, setCurrentView] = useState('All'); // Default to 'All'
    const [selectedTask, setSelectedTask] = useState(null);

    useEffect(() => {
        if (!token) return;
        loadTodos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    async function loadTodos() {
        setLoading(true);
        setError('');
        try {
            const todoList = await fetchTodos();
            setTodos(Array.isArray(todoList) ? todoList : []);
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to load tasks');
            setTodos([]);
        } finally {
            setLoading(false);
        }
    }

    const handleAddTodo = async (e) => {
        e.preventDefault();
        const titleToAdd = newTodoTitle.trim();
        if (!titleToAdd) return;
        const tempId = `temp-${Date.now()}`;
        const newTodoOptimistic = { _id: tempId, title: titleToAdd, completed: false, dueDate: null };
        setTodos(prevTodos => [newTodoOptimistic, ...prevTodos]);
        setNewTodoTitle('');
        try {
            const newTodoFromServer = await createTodo({ title: titleToAdd });
            console.log("Object returned from server after create:", newTodoFromServer);
            setTodos(prevTodos => prevTodos.map(todo => (todo._id === tempId ? newTodoFromServer : todo)));
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to add task');
            setTodos(prevTodos => prevTodos.filter(t => t._id !== tempId));
        }
    };

    const handleDeleteTodo = async (id) => {
        const previousTodos = todos;
        setTodos(todos.filter((todo) => todo._id !== id));
        try {
            await deleteTodoApi(id);
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to delete task');
            setTodos(previousTodos);
        }
    };

    const handleToggleComplete = async (id, currentStatus) => {
        const previousTodos = todos;
        setTodos(todos.map((todo) => (todo._id === id ? { ...todo, completed: !currentStatus } : todo)));
        try {
            await updateTodo(id);
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to update task');
            setTodos(previousTodos);
        }
    };

    const filteredTodos = todos.filter(todo => {
        if (currentView === 'Today') {
            return (isToday(todo.dueDate) || isOverdue(todo.dueDate)) && !todo.completed;
        }
        if (currentView === 'Upcoming') {
            return !isToday(todo.dueDate) && !isOverdue(todo.dueDate);
        }
        return true; // For 'All' view
    });

    const getTaskDateClass = (dueDate) => {
        if (isOverdue(dueDate)) return 'date-overdue';
        if (isToday(dueDate)) return 'date-today';
        return '';
    };

    return (
        <div className={`dashboard-layout ${selectedTask ? 'show-details' : ''}`}>
            <aside className="sidebar">
                <div className="sidebar-header"><h2>TodoApp</h2></div>
                <nav className="sidebar-nav">
                    <button onClick={() => setCurrentView('All')} className={currentView === 'All' ? 'active' : ''}>All</button>
                    <button onClick={() => setCurrentView('Today')} className={currentView === 'Today' ? 'active' : ''}>Today</button>
                    <button onClick={() => setCurrentView('Upcoming')} className={currentView === 'Upcoming' ? 'active' : ''}>Upcoming</button>
                </nav>
            </aside>
            <main className="main-content">
                <div className="header">
                    <h1>{currentView}</h1>
                    {loading && <span className="loading-text">Loading...</span>}
                </div>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleAddTodo} className="todo-form">
                    <input type="text" value={newTodoTitle} onChange={(e) => setNewTodoTitle(e.target.value)} placeholder="+ Add a task" className="todo-input" />
                    <button type="submit" className="add-button">Add</button>
                </form>
                <div className="todo-list">
                    {filteredTodos.map((todo) => (
                        <div key={todo._id} className={`todo-item ${todo.completed ? 'completed' : ''}`} onClick={() => setSelectedTask(todo)}>
                            <div className="todo-item-left">
                                <div className="checkbox" onClick={(e) => { e.stopPropagation(); handleToggleComplete(todo._id, todo.completed); }}>
                                    {todo.completed && '✔'}
                                </div>
                                <div className="todo-text">
                                    <span>{todo.title}</span>
                                    {todo.dueDate && <small className={getTaskDateClass(todo.dueDate)}>{new Date(todo.dueDate).toLocaleDateString()}</small>}
                                </div>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteTodo(todo._id); }} className="delete-button">🗑️</button>
                        </div>
                    ))}
                </div>
            </main>
            <section className="details-panel">
                {selectedTask ? (
                    <div>
                        <div className="details-header">
                            <h3>Task Details</h3>
                            <button onClick={() => setSelectedTask(null)} className="close-button">✖</button>
                        </div>
                        <div className="details-content">
                            <h4>{selectedTask.title}</h4>
                            <p>Due Date: {selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : 'No due date'}</p>
                            <p>Status: {selectedTask.completed ? 'Completed' : 'Pending'}</p>
                        </div>
                    </div>
                ) : (<div className="details-placeholder"><p>Select a task to see its details</p></div>)}
            </section>
        </div>
    );
};

export default Dashboard;