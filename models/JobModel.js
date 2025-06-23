import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
    topicName: String,
    subjectName: String,
    file: {
        type: String,
        default: "",
    }, 
    video: String,
    standard: {
        type: Number,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    text:{
        type: String,
        default: "",
    },
    verified: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });


export default mongoose.model('contents', JobSchema);
