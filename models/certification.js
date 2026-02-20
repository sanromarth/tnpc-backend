const mongoose = require("mongoose");

const certificationSchema = new mongoose.Schema({
    program: {
        type: String,
        trim: true,
        default: ""
    },
    year: {
        type: Number,
        default: 0
    },
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
        default: ""
    },
    batch: {
        type: String,
        trim: true,
        default: ""
    }
}, {
    timestamps: true,
    collection: "certificatePrograms"
});

module.exports = mongoose.model("Certification", certificationSchema);