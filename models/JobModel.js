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
    summary:{
        type: String,
        default: "",
    },
    verified: {
        type: Boolean,
        default: false,
    },
    quizes:{
        type:Array,
        default: [mongoose.Schema.Types.ObjectId],
        ref: 'Quiz',
    }
}, { timestamps: true });


export default mongoose.model('contents', JobSchema);
