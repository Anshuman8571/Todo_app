import React from "react";
// Here we will be using React testing library and jest both
import { render , fireEvent,screen, cleanup} from "@testing-library/react"
import TodoItem from "../../components/TodoItem";

afterEach(()=>{
    cleanup()
    jest.resetAllMocks();
})

describe("Testing the Todoitem component",()=>{
    const mockTodo = {_id:"1",title:"New Todo",completed:false}
    test("check if the todo title gets rendered",() =>{
        render(<TodoItem todo={mockTodo} />)
        expect(screen.getByText("New Todo")).toBeInTheDocument()
    })
    test("check if the todo is successfully removed",()=>{
        render(<TodoItem todo={mockTodo} />)
    })  

    test("check if the onDelete method is invoked when clicked on-delete button",()=>{
        const mockonDelete = jest.fn()
        render(<TodoItem todo={mockTodo} onDelete={mockonDelete} />)
        const deletebutton = screen.getByRole("button",{name:"Delete"})
        fireEvent.click(deletebutton)
        expect(mockonDelete).toHaveBeenCalledWith("1")
        expect(screen.queryByTestId("1")).not.toBeInTheDocument() // this is to check whether the deleted test is removed from the screen or not
    })
})