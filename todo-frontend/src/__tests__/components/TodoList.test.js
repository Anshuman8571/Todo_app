import React from "react";
import {render,fireEvent,screen,cleanup, waitFor} from "@testing-library/react";
import TodoList from "../../components/TodoList";
import BACKEND_URL from "../../config/config"


afterEach(()=>{
    cleanup()
    jest.resetAllMocks();
})

global.fetch = jest.fn();

describe("Todo List component",() => {
    test("Fetch the todos and also render them",async()=>{
        const mockTodos = [
            {_id:"1", title : "Todo 1",completed:false},
            {_id:"2", title : "Todo 2",completed:false}
        ]
        fetch.mockResolvedValueOnce({
            json: async()=> mockTodos
        })
        render(<TodoList/>)
        await waitFor(()=>{
            expect(screen.getByText("Todo 1")).toBeInTheDocument();
            expect(screen.getByText("Todo 2")).toBeInTheDocument();
        })
        
        expect(fetch).toHaveBeenCalledWith(`${BACKEND_URL}/get-todos`)
    })

    test("Add a new Todo",async()=>{
        const newTodo = {_id:"1", title : "New Todo",completed:false}
        
        fetch.mockResolvedValueOnce({
            json:async()=>[],

        }).mockResolvedValueOnce({
            json: async() => newTodo 
        }).mockResolvedValueOnce({
            json:()=>([newTodo])
        })
        render(<TodoList/>)
        const input = screen.getByPlaceholderText("Add a new todo")
        const button = screen.getByRole("button",{name: "Add Todo"})

        fireEvent.change(input,{target :{value : "New Todo"}})
        fireEvent.click(button)
        
        try{
            await waitFor(()=>{
                expect(screen.getByText("New Todo")).toBeInTheDocument();
            });

        } catch(e){
            screen.debug();
            throw e;
        }
        expect(fetch).toHaveBeenCalledWith(`${BACKEND_URL}/add-todo`,expect.any(Object))
    })

    // calling the backend
    
    //Add a new Todo
    // write an integ test for deletion of todos
})