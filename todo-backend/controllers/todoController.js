const Todo = require("../models/todomodel")
const logger = require("../utils/logger")


exports.getTodos = async(req,res) =>{
    console.log("Fetching the todos from DB")
    try{
        const todos = await Todo.find({userId:req.user._id});
        // console.log("Fetch all the todos",todos)
        logger.info("Fetched all the todos",todos)
        res.status(200).json(todos)
    } catch(error) {
        logger.error("Error while fetching the todos",error)
        res.status(500).json({message:"somnething went wrong please try later"})
    }
}

exports.addTodo = async (req,res) => { 
    try {
        const title = req.body.title;
        logger.info("Adding a new Todo",title)
        const newTodo = new Todo({
            title: title
        })

        logger.info("Adding the todo to DB",newTodo)
        const savedTodo = await newTodo.save()
        logger.info("Added the todo to DB",savedTodo)
        
        return res.status(200).json(savedTodo)
    } catch (error) {
        logger.error("Error while Adding the todos",error)
        res.status(500).json({message:"Something went wrong in addTodo,please try later"})
    }
}

exports.deleteTodo = async (req,res) =>{
    try{
        const id  = req.params.id;
        const deleted = await Todo.findByIdAndDelete(id)
        if(!deleted) return console.log("Eror 404: Not Found",req.body)
        return res.status(200).json({message:"Todo deleted successfully"})
    } catch(error){
        logger.error("Error while deleting a todo",error)
        res.status(500).json({message:"Something went wrong with deleting todo"})
    }
}