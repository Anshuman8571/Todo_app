import React from "react";
// Here we will be using React testing library and jest both
import { render , fireEvent,screen, cleanup} from "@testing-library/react"
import AddTodo from "../../components/AddTodo"

afterEach(()=>{
    cleanup()
    jest.resetAllMocks();
})


describe("Testing the Add Todo component",()=>{
    test("Render the input and add Button",()=>{
        render(<AddTodo onAdd={() =>{}} />)
        expect(screen.getByPlaceholderText("Add a new todo")).toBeInTheDocument();
        expect(screen.getByRole("button",{name:"Add Todo"})).toBeInTheDocument()
    })
    test("When form is submitted,the onAdd function to be invoked",()=>{
        const mockOnAdd = jest.fn();
        // A mockOnAdd will add the todo from UI
        render(<AddTodo onAdd={mockOnAdd}/>)
        // We will-render this to test the AddTodo-component ni virtual DOM

        const input = screen.getByPlaceholderText("Add a new todo");
        // Then we will locate the input element which-contains placeholdertext "Add a new todo"
        const button = screen.getByRole("button",{name:"Add Todo"});
        // And then we will find a button with the name "Add Todo"
        fireEvent.change(input,{target: {value:"New Todo"}})
        // This will trigger a change which will make the inputs value change to "New Todo"
        fireEvent.click(button);
        // This clicks The button to-submit the todo
        expect(mockOnAdd).toHaveBeenCalledWith("New Todo")
        // Now this will check the mockAddOn is called by "New Todo" or not 
        // because mockOnAdd is supposed to be called by the button when it-is clicked
        expect(input).toHaveValue('')
    })

    // write a test to check that the input get cleared after submission

    test("When a todo get submitted, check whether the input get cleared",()=>{
        const mockOnAdd = jest.fn();
        render(<AddTodo onAdd={mockOnAdd}/>)
        const input = screen.getByPlaceholderText("Add a new todo");
        const button = screen.getByRole("button",{name:"Add Todo"});
        fireEvent.change(input,{target: {value:"New Todo"}})
        fireEvent.click(button);
        expect(input).toHaveValue('') // this will check the value of input
    })
})