const mongoose = require("mongoose")

const todoSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required:true
    },
    createdAt:{
        type: Date,
        default: Date.now()
    },
    completedAt:{
        type: Date
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
},{
    timestamps:true
})
todoSchema.set("toJSON",{
    virtuals: true,
    versionKey:false,
    transform: (_doc,ret) => {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
    },
})


module.exports = mongoose.model('Todo',todoSchema)