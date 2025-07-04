const app = require("./server.js");

const PORT = process.env.PORT;
console.log("The server will be starting");
app.listen(PORT, () => { // After get(), this tells where it-is about to happen
    console.log(`Server is running on the port ${PORT}`)
})




