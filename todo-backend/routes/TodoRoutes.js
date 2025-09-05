console.log(">>>>>> LOADING THE CORRECT TodoRoutes.js FILE <<<<<<");
const express = require("express")
const {getTodos,addTodo,deleteTodo} = require("../controllers/todoController")
const authMiddleware = require("../middleware/auth.middleware");
const router = express.Router()

router.get("/get-todos", authMiddleware, getTodos); // 👈 protect this route
router.post("/add-todo", authMiddleware, addTodo);  // 👈 protect this too
router.delete("/delete-todo/:id", authMiddleware, deleteTodo); // 👈 and this



module.exports = router;