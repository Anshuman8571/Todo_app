const request = require("supertest") // 
const {MongoMemoryServer} = require("mongodb-memory-server")
const mongoose = require("mongoose")


const app = require("../../server")
const Todo = require("../../models/todomodel")

describe("todo api integration test", () => {
    let mongoServer;
    beforeAll(async () =>{
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.disconnect();
        await mongoose.connect(mongoUri)
    })

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop()
    })


    describe("GET /api/get-todo", () => {
        it("should return all the todos", async() => {
            await Todo.create({title:"Todo 1"})
            await Todo.create({title:"Todo 2"})

            const response = await request(app).get("/api/get-todos");
            console.log("Response is:", response.body)
            expect(response.status).toBe(200)
            expect(response.body.length).toBe(2)
            expect(response.body[0].title).toBe("Todo 1")
            expect(response.body[1].title).toBe("Todo 2")
        })
    })

    describe("POST /api/add-todo",() => {
        it("should create a new todo", async () =>{
            const response = await request(app).post("/api/add-todo").send({title:"New Todo"})
            
            console.log("Response is:" , response.body);
            expect(response.status).toBe(200)
            expect(response.body.title).toBe("New Todo")
            expect(response.body.completed).toBe(false)
            
            const todo = await Todo.findById(response.body._id)
            console.log("Response is:",todo);
            expect(todo).toBeTruthy()
            expect(todo.title).toBe("New Todo")
        })
        it("should create a new todo but not added", async () => {
            const response = await request(app).post("/api/add-todo").send()

            console.log("Response is: ", response.body)
            expect(response.status).toBe(500)
            expect(response.body.message).toBe("Something went wrong in addTodo,please try later")
        })
    })

    describe("Del /api/del-todo",() =>{
        it("should delete a todo",async () =>{
            const response = await request(app).post("/api/add-todo").send({title:"New todo"})
            const id = response.body._id
            const deletedtodo = await request(app).delete(`/api/delete-todo/${id}`)
            expect(deletedtodo.status).toBe(200)
            expect(deletedtodo.body.message).toBe("Todo deleted successfully")
        })
    })
})
