// models/todomodel.js

const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    completed: {
        type: Boolean,
        default: false,
    },
    // Using a single, required field for the user relationship.
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    completedAt: {
        type: Date,
    },
}, {
    // This automatically handles `createdAt` and `updatedAt`.
    timestamps: true,
});

// This middleware automatically sets the `completedAt` timestamp.
todoSchema.pre('save', function (next) {
    // `isModified` checks if the 'completed' field was changed in this save operation.
    if (this.isModified('completed')) {
        this.completedAt = this.completed ? new Date() : null;
    }
    next();
});

// Cleaned up toJSON transform.
todoSchema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
        // We're replacing `_id` with `id` for better frontend compatibility.
        delete ret._id; 
    },
});

module.exports = mongoose.model('Todo', todoSchema);