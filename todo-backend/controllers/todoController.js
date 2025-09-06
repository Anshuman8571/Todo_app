const Todo = require("../models/todomodel");
const logger = require("../utils/logger");

exports.getTodos = async (req, res) => {
  logger.info("Fetching the todos from DB for user", req.user && req.user._id);
  try {
    const todos = await Todo.find({ userId: req.user._id }).sort({ createdAt: -1 });
    logger.info("Fetched todos count:", todos.length);
    return res.status(200).json(todos);
  } catch (error) {
    logger.error("Error while fetching the todos", error);
    return res.status(500).json({ message: "Something went wrong. Please try later." });
  }
};

exports.addTodo = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    logger.info("Adding a new Todo for user", req.user && req.user._id, title);

    const newTodo = new Todo({
      title: title.trim(),
      owner:req.user && req.user._id,
      userId: req.user._id,     // <--- associate todo with the logged-in user
      completed: false,
    });

    const savedTodo = await newTodo.save();

    logger.info("Added the todo to DB", savedTodo);
    return res.status(201).json(savedTodo); // 201 Created
  } catch (error) {
    logger.error("Error while adding the todo", error);
    return res.status(500).json({ message: "Something went wrong creating the todo." });
  }
};

exports.deleteTodo = async (req, res) => {
  try {
    const id = req.params.id;
    const todo = await Todo.findById(id);

    if (!todo) {
      logger.warn("Attempt to delete non-existent todo", id);
      return res.status(404).json({ message: "Todo not found" });
    }

    // Ensure the requester owns the todo
    if (!todo.userId || todo.userId.toString() !== req.user._id.toString()) {
      logger.warn("Unauthorized delete attempt", { todoId: id, requester: req.user._id });
      return res.status(403).json({ message: "Not allowed to delete this todo" });
    }

    await Todo.findByIdAndDelete(id);
    logger.info("Todo deleted", id);
    return res.status(204).send(); // 204 No Content (or 200 + message if you prefer)
  } catch (error) {
    logger.error("Error while deleting a todo", error);
    return res.status(500).json({ message: "Something went wrong deleting the todo" });
  }
};
