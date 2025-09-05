const express = require("express") // Creating an Express Server
const cors = require("cors")
const bodyParser = require("body-parser")
const connectDB = require("./db")
const authRoutes = require('./routes/auth.routes')
const dotenv = require("dotenv")
const { connect } = require("mongoose")
const todoRoutes = require("./routes/TodoRoutes");
const path = require('path')
dotenv.config()

const app = express(); //Calling the application
app.use(cors()) // To create a contact b/w FE and BE
app.use(bodyParser.json()) // The data which will be send will be in json form
app.use(express.json()) // Another middleware for creating route

app.use('/api',todoRoutes)

connectDB()

app.get("/ping", (req, res) => {
  res.send("Server is up ✅");
});
app.use('/api/auth',authRoutes);
// app.use('/api/todos',todoRoutes);
app.use(express.static(path.join(__dirname, "../todo-frontend/build")))

app.get("/./", (req, res) =>{
    res.sendFile(path.join(__dirname, "../todo-frontend/build", "index.html"))
})

module.exports = app;
// const startServer = async () => {
//   await connectDB();
//   app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
//   });
// };
// startServer();


// app.use()