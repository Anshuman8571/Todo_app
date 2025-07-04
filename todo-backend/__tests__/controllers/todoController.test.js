const { response } = require("express");

const todoController = require("../../controllers/todoController")


// - Tells Jest to mock the actual database model file so you don't connect to a real DB. Instead, calls like .find() or .save() will be intercepted and controlled by you.
jest.mock("../../models/todomodel.js") // - You're telling Jest:
// 👉 “Hey, don’t use the real version of this file — give me a fake/mock version instead.”


const mockSave = jest.fn();
const mockFind = jest.fn();
const mockFindByIdAndDelete = jest.fn();

const Todo = require("../../models/todomodel") // - You're actually grabbing the mocked version — not the original. Jest has already replaced it behind the scenes for you.


Todo.find = mockFind;
Todo.mockImplementation(() => 
    ({ save : mockSave 
}))

Todo.findByIdAndDelete = mockFindByIdAndDelete;
// Todo.save = mockSave;

describe("When Todo Controller is invoked",() => {
    let req,res;
    beforeEach(() => {
        req = {
            body: {}, //- req.body: Used to simulate incoming data (like when creating a todo)
            params: {} // - req.params: Useful for routes with IDs, like /todo/:id// 
        },
        res = {
            json: jest.fn(()=>res),
            status: jest.fn(()=>res),
        }
    })

    describe("For getTodos function",() => {
        it("should return me all the todos",async () =>{
            // - Fake data returned by the mock DB call.
            const mockTodos = [
                {_id: 0, title: "Todo 1",completed: false},
                {_id: 1, title: "Todo 2",completed: false},
                {_id: 2, title: "Todo 3",completed: false}
            ]
            mockFind.mockResolvedValue(mockTodos)
            await todoController.getTodos(req,res);

            expect(mockFind).toHaveBeenCalled()
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockTodos)
        })
        it("should handle errors if something goes wrong", async () =>{
            const errorMessage = "somnething went wrong please try later";
            mockFind.mockRejectedValue(new Error(errorMessage))

            await todoController.getTodos(req,res)
            expect(res.status).toHaveBeenCalledWith(500)
            expect(res.json).toHaveBeenCalledWith({message: errorMessage})
        })
    })

    describe("For addTodo function", () => {
        it("should create a new todo",async () =>{
            
            const newTodo = {_id:"1",title:"New Todo"}
            req.body = {title: "New Todo"} 

            mockSave.mockResolvedValue(newTodo)
            await todoController.addTodo(req,res)

            expect(mockSave).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(newTodo)
        })
        it("should handle the error",async() => {
            const errorMessage = "Something went wrong in addTodo,please try later";
            mockSave.mockRejectedValue(new Error(errorMessage));

            await todoController.addTodo(req,res)
            
            expect(res.status).toHaveBeenCalledWith(500)
            expect(res.json).toHaveBeenCalledWith({message: errorMessage})
        })
    })

    describe("For deleting a todo", () => {
        it("should delete a todo",async () =>{
            const todoid = "2"
            req.params = {id:todoid};
            const deleteTodo = {id:"2",title:"Deleted Todo"}

            mockFindByIdAndDelete.mockResolvedValue(deleteTodo);
            await todoController.deleteTodo(req,res);

            expect(mockFindByIdAndDelete).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith({message : "Todo deleted successfully"})
        })
        it("should handle error",async () =>{
            const errorMessage = "Something went wrong with deleting todo"
            mockFindByIdAndDelete.mockRejectedValue(new Error(errorMessage))

            await todoController.deleteTodo(req,res)

            expect(res.status).toHaveBeenCalledWith(500)
            expect(res.json).toHaveBeenCalledWith({message:errorMessage})
        })
    })
})
