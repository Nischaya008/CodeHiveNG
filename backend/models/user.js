import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    rooms: {
        type: [String],
        default: [],
        required: true
    }
}, {timestamps: true}); 
export default mongoose.model("User", userSchema);
