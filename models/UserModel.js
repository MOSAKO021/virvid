import mongoose from "mongoose";

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
    }

})


export default mongoose.model('useras', UserSchema);
