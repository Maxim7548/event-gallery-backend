import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: String },
  organizer: { type: String }, 
  image: { type: String },     
  creator: { type: String }
});

export const Event = mongoose.model('Event', eventSchema);