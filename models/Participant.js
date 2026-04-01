import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    eventId: { type: String, required: true }
}, { timestamps: true }); 

export const Participant = mongoose.model('Participant', participantSchema);