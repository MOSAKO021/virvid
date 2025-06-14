import { Router } from "express";
const router = Router();
import {summarizeTask,getTaskResult}  from "../controllers/taskController.js";

router.get('/', (req, res) => {
    res.status(200).json({ message: "Welcome to the Task API" });
});
router.get('/summary/:id', summarizeTask);
router.get('/result/:id', getTaskResult);

export default router;