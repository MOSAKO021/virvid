// JobModel.js
import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
    topicName: String,
    subjectName: String,
    file: {
        type: String,
        default: "",
    }, // Store binary data instead of just the filename
    video: String,
    standard: {
        type: Number,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    summary:{
        type: String,
        default: "",
    },
    verified: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });


export default mongoose.model('contents', JobSchema);
