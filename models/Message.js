import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    text: { type: String, required: true },
    time: { type: String, required: true },
    id: { type: String }
}, { timestamps: true });

export const Message = mongoose.model('Message', messageSchema);