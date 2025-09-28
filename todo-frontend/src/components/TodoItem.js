import React from 'react';

function TodoItem({ todo, onDelete, onComplete }) {
    const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'No date';
        
        try {
            const date = new Date(timestamp);
            if (isNaN(date.getTime())) return 'Invalid date';
            
            return date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });
        } catch (error) {
            console.error('Error formatting timestamp:', error);
            return 'Invalid date';
        }
    };

    return (
        <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
            <div className="todo-item-left">
                <div 
                    className={`checkbox ${todo.completed ? 'completed' : ''}`}
                    onClick={onComplete}
                    title={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
                >
                    {todo.completed && '✓'}
                </div>
                <div className="todo-content">
                    <div className="todo-title">{todo.title}</div>
                    <div className="todo-metadata">
                        {formatTimestamp(todo.createdAt || todo.timestamp)}
                    </div>
                </div>
            </div>
            <button 
                className="delete-button" 
                onClick={onDelete}
                title="Delete todo"
            >
                ×
            </button>
        </div>
    );
}

export default TodoItem;