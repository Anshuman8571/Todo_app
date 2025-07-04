import React,{useState} from "react";

const AddTodo = ({ onAdd })=>{
    const [todo, setTodo] = useState('This is a new state')
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!todo) return;
        
        onAdd(todo);
        setTodo("")
    }
    return (
        <form onSubmit={handleSubmit}>
            <input 
                type="text"
                value = {todo}
                onChange={(e)=> setTodo(e.target.value)}
                placeholder="Add a new todo"
                required
            /> 
            <button type="Submit"> Add Todo</button>
        </form>
    )
}

export default AddTodo