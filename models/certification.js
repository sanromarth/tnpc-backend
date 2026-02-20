const mongoose = require("mongoose");

const certificationSchema = new mongoose.Schema({
    studentName: {
        type: String,
        required: [true, "Student name is required"],
        trim: true
    },
    course: {
        type: String,
        required: [true, "Course name is required"],
        trim: true
    },
    completionDate: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ["completed", "in-progress", "pending", ""],
        default: ""
    },
    batch: {
        type: String,
        trim: true,
        default: ""
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Certification", certificationSchema);