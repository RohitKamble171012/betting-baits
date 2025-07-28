// models/player.js
import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  department: { type: String, required: true },
  current_round: { type: Number, default: 0 },
  total_rounds: { type: Number, required: true },
  company: { type: String, required: true },
});

const Player = mongoose.model("Player", playerSchema);
export default Player;
