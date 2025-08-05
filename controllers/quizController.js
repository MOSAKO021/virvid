import JobSchema  from '../models/JobModel.js'
import QuizSchema from '../models/QuizModel.js'
import UserModel from '../models/UserModel.js';

const generateQuiz = async (req,res) => {
  const { _id } = req.body;
  const { userId } = req.user;
  // const check = await QuizSchema.findOne({ jobId: _id, createdBy: userId });
  // if(check){
  //   return res.json({ questions: check.questions, quizId: check._id });
  // }
  const job = await JobSchema.findById(_id);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  const moderationPrompt = `
You are a strict content filter. Review the following text carefully for any explicit, sexual, violent, abusive, or inappropriate language.

If the content is completely clean and appropriate, respond with exactly: true

If the content is inappropriate, respond with a very short reason like: "offensive language" or "contains sexual content". No extra explanation.

Text:
"""${job.summary}"""
  `;

  const quizStructure = `
You are an expert quiz creator. Based on the following text, generate a quiz with 5 multiple-choice questions.
the quiz must be structured as a JSON object with the following format:
- An "answers" array containing the correct answer letter (e.g., ["b", "d", "a", ...]).

- A "questions" array containing objects for each question.
Each question must have:
- A "question" string.
- An "options" array with exactly 4 choices labeled a), b), c), d).



⚠️ Return the result as raw JSON only — no markdown, no explanation, no formatting, no code block.

Here is the input text:
"""${job.summary}"""
  `;

  try {
    const response = await fetch('http://localhost:5200/api/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: quizStructure }
        ]
      })
    });

    const data = await response.json();
    const aiReply = (data.response || '').trim().toLowerCase();
    let raw = data.response.trim().replace(/^json\n?/, '')
        .replace(/^```json\n?/, '')
        .replace(/```$/, '')
        .trim();
    console.log('AI Raw:', data);
    
    raw = JSON.parse(raw);
    const quiz =  new QuizSchema({
      jobId: job._id,
      title: `Quiz for ${job.topicName} - ${job.subjectName}`,
      createdBy: userId,
      questions: raw.questions,
      answers: raw.answers
    });
    quiz.save();
    job.quizes.push(quiz._id);
    job.save();
    console.log('Quiz generated successfully:', quiz);
    
    return res.json({ questions: quiz.questions, quizId: quiz._id });

  } catch (error) {
    console.error('Error in Quiz generation', error);
    return res.json({ isClean: false, reason: error.message });
  }
};

export default generateQuiz ;

function calculateCoins(attemptNumber, baseCoins = 45) {
  if (attemptNumber < 1) {
    throw new Error("Attempt number must be at least 1.");
  }

  // 7% reduction per attempt after the first
  const reductionPercentage = (attemptNumber - 1) * 7;
  const reductionFactor = Math.max(0, 100 - reductionPercentage) / 100;
  return Math.floor(baseCoins * reductionFactor);
}


const evaluateQuiz = async (req, res) => {
  const { quizId, submittedAnswers } = req.body;
  const User = await UserModel.findById(req.user.userId);
  // console.log("id:", quizId, "answers:", submittedAnswers, "user:", User._id);
  // console.log("quizes:", (await QuizSchema.find()).map((q) => q._id.toString()));
  
  
  try {
    const quiz = await QuizSchema.findOne({_id:quizId});
    console.log("quiz:", quiz);
    
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    if (
        User.solved.some(
          ({ contentId, score }) =>
            contentId?.toString() === quiz.jobId.toString() && score === 5
        )
      ) {
        return res.status(400).json({ error: 'You have already solved this quiz' });
      }
    const correctAnswers = quiz.answers;
    if (!Array.isArray(submittedAnswers) || submittedAnswers.length !== correctAnswers.length) {
      return res.status(400).json({ error: 'Submitted answers are invalid or incomplete' });
    }

    let score = 0;
    for (let i = 0; i < correctAnswers.length; i++) {
      // Convert submitted index to letter (0->a, 1->b, 2->c, 3->d)
      const submittedIndex = parseInt(submittedAnswers[i]);
      const submittedLetter = String.fromCharCode(97 + submittedIndex); // 97 is 'a' in ASCII
      
      if (submittedLetter === correctAnswers[i]?.toLowerCase()) {
        score++;
      }
    }
    let attempt = User.solved.filter(({ contentId }) => contentId?.toString() === quiz.jobId.toString()).length + 1
      
    User.solved.push({
      contentId: quiz.jobId,
      score: score,
      attempts: attempt
    });
    
    let coinsEarned = 0;
    if (score === 5) {
      coinsEarned = calculateCoins(attempt);
      User.wallet = (User.wallet || 0) + coinsEarned;
    }
    await User.save();
    
    return res.json({
      quizId: quiz._id,
      totalQuestions: correctAnswers.length,
      correctAnswers: score,
      scorePercentage: Math.round((score / correctAnswers.length) * 100),
      coinsEarned: coinsEarned,
      attemptNumber: attempt
    });
  } catch (error) {
    console.error('Error evaluating quiz:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


const getMockQuiz = async (req, res) => {
  const { quizId } = req.params;
  const quizes = await QuizSchema.find({ jobId: quizId },{createdBy:0,__v:0,answeres:0});
  if (!quizes || quizes.length === 0) {
    return res.status(404).json({ error: 'No quizzes found for this content' });
  }
  return res.json(quizes);
}

const reviewQuiz = async (req, res) => {
  const { quizId } = req.params;
  console.log("Reviewing quiz with ID:", quizId);
  

  try {
    const quiz = await QuizSchema.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    return res.json({
      quizId: quiz._id,
      title: quiz.title,
      questions: quiz.questions,
      answers: quiz.answers,
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


export { generateQuiz, evaluateQuiz ,reviewQuiz, getMockQuiz };