import { Router } from "express";
import { getApplicationStats, getCurrentUser, updateUser, getTeacher } from "../controllers/userController.js";
import { validateUpdateUserInput } from "../middleware/validationMiddleware.js";
import { authorizePermissions } from "../middleware/authMiddleware.js";
const router = Router();

router.get('/current-user', getCurrentUser)
router.get('/getTeacher/:id', getTeacher)
router.get('/admin/app-stats', [
    authorizePermissions('legend'),
    getApplicationStats,
])
router.patch('/update-user', updateUser)



export default router;