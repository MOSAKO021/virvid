import {Router} from 'express'
import  {generateQuiz,evaluateQuiz,reviewQuiz} from '../controllers/quizController.js'

const router = Router()

router.route('/attempt').post(generateQuiz)
router.route('/review/:quizId').get(reviewQuiz)
router.route('/evaluate').post(evaluateQuiz)

export default router;