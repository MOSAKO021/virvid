import mongoose, { Mongoose } from "mongoose";

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: {
        type: String,
        enum: ['user','admin','legend'],
        default: 'user'
    },
    standard: {
        type: Number,
        default: 0
    },
    solved:{
        type: Array,
        default: [
            {
                contentId: {
                    type:mongoose.Schema.Types.ObjectId,
                    ref: 'content'
                },
                score: Number,
            }
        ]
    }

})


export default mongoose.model('users', UserSchema);
