const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true
    },
    message: {
        type: String,
        required: [true, "Message is required"],
        trim: true
    },
    type: {
        type: String,
        enum: ["announcement", "status_update", "deadline", "general"],
        default: "announcement"
    },
    targetRole: {
        type: String,
        enum: ["all", "student", "admin"],
        default: "all"
    },
    priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium"
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model("Notification", notificationSchema);
