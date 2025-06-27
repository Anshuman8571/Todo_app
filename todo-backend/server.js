const express = require("express") // Creating an Express Server
const cors = require("cors")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const Todo = require("./models/todomodel")
const dotenv = require("dotenv")

dotenv.config()

const app = express(); //Calling the application
app.use(cors()) // To create a contact b/w FE and BE
app.use(bodyParser.json()) // The data which will be send will be in json form
app.use(express.json()) // Another middleware for creating route

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("MongoDB got connected")
    } catch(error){
        console.error("MongoDB connection failed",error)
    }
}
app.get("/ping", (req, res) => {
  res.send("Server is up ✅");
});

app.get("/get-todo", async(req,res) =>{
    console.log("Fetching the todos from DB")
    try{
        const todos = await Todo.find();
        console.log("Fetch all the todos",todos)
        res.status(200).json(todos)
    } catch(error) {
        console.log("Error while fetching the todos",error)
        res.status(500).json({message:"somnething went wrong please try later"})
    }
})

app.post("/add-todo",async (req,res) => { 
    const title = req.body;
    console.log("Adding a new Todo",title.todo)
    const newTodo = new Todo({
        title: title.todo
    })

    console.log("Adding the todo to DB",newTodo)
    const savedTodo = await newTodo.save()
    console.log("Added the todo to DB",savedTodo)

    res.status(200).json(savedTodo)
}) 


connectDB()
const PORT = 3001;
app.listen(PORT, () => { // After get(), this tells where it-is about to happen
    console.log(`Server is running on the port ${PORT}`)
})
// const startServer = async () => {
//   await connectDB();
//   app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
//   });
// };
// startServer();


// app.use()