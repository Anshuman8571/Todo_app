console.log(">>>>>> LOADING THE CORRECT TodoRoutes.js FILE <<<<<<");
const express = require("express")
const {getTodos,addTodo,deleteTodo} = require("../controllers/todoController")
const router = express.Router()

router.get("/get-todos", getTodos)

router.post("/add-todo", addTodo) 

router.delete(`/delete-todo/:id`,deleteTodo)

module.exports = router;