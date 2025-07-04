import React from "react";
// import { deleteTodo } from "../components/TodoList";

const TodoItem = ({todo,onDelete,onComplete}) => {
    return (
        <li>
            {todo.title} {todo.completed}
            <button onClick={() => onDelete(todo._id)}>Delete</button>
        </li>
    )
}
export default TodoItem;