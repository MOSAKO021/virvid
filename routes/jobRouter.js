import {Router} from 'express'
const router = Router()

import {
    getAllJobs,
    getJob,
    createJob,
    updateJob,
    deleteJob,
    showStats,
    textualDatas,
    fileups
} from '../controllers/jobController.js'
import { validateJobInput,  validateIdParam} from '../middleware/validationMiddleware.js'
import { authorizePermissions } from '../middleware/authMiddleware.js'
import upload from '../middleware/multerMiddleware.js'


router.route('/').get(getAllJobs)
router.route('/').post(  textualDatas)
router.route('/files').post(upload.single('file'), fileups);

router.route('/stats').get([
    authorizePermissions('admin'),
    showStats
])

router
.route('/:id')
.get(validateIdParam, getJob)
.patch(validateIdParam, updateJob)
.delete(validateIdParam, deleteJob)


export default router;