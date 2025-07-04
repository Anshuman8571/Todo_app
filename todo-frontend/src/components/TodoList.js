import React, {useState,useEffect} from "react";
// useState is used for storing some values
// when out page is refreshed and we want something to be happen then use this useEffect
import AddTodo from "./AddTodo";
import TodoItem from "./TodoItem";
import BACKEND_URL from "../config/config";

const TodoList = () =>{
    const [todos,setTodos] = useState([])

    useEffect(()=>{
        fetchTodos();
    }, [])

    const fetchTodos = async () => { // using async because we are makina BE call
        try{
            const response = await fetch(`${BACKEND_URL}/get-todos`) // to make an API call we are using fetch here, there-are more libraries like this
            const data = await response.json();
            setTodos(data);
            console.log(data)
        } catch(error){
            console.error("Error fetching the data",error)
        }
    }

    const addTodo =async(title) =>{
        try{
            const response = await fetch(`${BACKEND_URL}/add-todo`,{
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title })
            })
            const newTodo = await response.json();
            // setTodos((prev)=>[...prev, newTodo])
            fetchTodos(); // here we can use both, last step was used by sir and this by me
            console.log("Response recieved",response)
        } catch(error){
            console.error("Error while creating the todo",error)
        }
    }

    const deleteTodo =async(id) =>{
        try{
            const response = await fetch(`${BACKEND_URL}/delete-todo/${id}`,{
                method: "DELETE",
            })
            setTodos((prev)=>prev.filter((todo) => todo.id!=id))
            fetchTodos();
            console.log("Todo deleted successfully",response)
        } catch(error){
            console.error("Error while deleting todo",error)
        }
    }
    return (
        <div>
            <h1>Todo List</h1>
            {/*Add todo-component*/}
            <AddTodo onAdd={addTodo}/> 
            {/* addTodo will fetch the todo from the UI and */}
            <ul>
                {
                    todos.map( todo =>(
                        <TodoItem key={todo._id} todo = {todo} onDelete={deleteTodo}> </TodoItem>
                    ))
                }
                {/* <TodoItem id={todo._id}> </TodoItem> */}
            </ul>
        </div>
    )
}
export default TodoList