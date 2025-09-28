import React, { useState } from "react";

function AddTodo({ onAdd }) {
    const [todo, setTodo] = useState("");
    const [loading, setLoading] = useState(false);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!todo.trim()) return;

        setLoading(true);
        try {
            // Create todo with proper timestamp that accounts for local timezone
            const now = new Date();
            const localDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());
            
            const newTodo = {
                title: todo.trim(),
                completed: false,
                createdAt: localDate.toISOString(),
                timestamp: localDate.toISOString()
            };
            
            await onAdd(newTodo);
            setTodo("");
        } catch (error) {
            console.error("Error adding todo:", error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <form onSubmit={handleSubmit}>
            <input 
                type="text"
                value = {todo}
                onChange={(e)=> setTodo(e.target.value)}
                placeholder="Add a new todo"
                required
            /> 
            <button 
                type="submit" 
                className="add-button"
                disabled={loading || !todo.trim()}
            >
                {loading ? "Adding..." : "Add Todo"}
            </button>
        </form>
    )
}

export default AddTodo