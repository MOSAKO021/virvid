import { Router } from "express";
const router = Router();
import  summarizeTask  from "../controllers/taskController.js";

router.get('/', (req, res) => {
    res.status(200).json({ message: "Welcome to the Task API" });
});
router.get('/summary/:id', summarizeTask);

export default router;