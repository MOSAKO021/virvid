import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  question: String,
  options: [String]
});

const QuizSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  title: { type: String, required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  questions: [QuestionSchema],
  answers: {
    type: [String],
    default: []
  }
}, { timestamps: true });

export default mongoose.model('Quiz', QuizSchema);
