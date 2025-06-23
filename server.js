import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
const app = express();
import morgan from 'morgan';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import redis from 'redis';
import multer from 'multer';

import jobRouter from './routes/jobRouter.js'
import taskRouter from './routes/taskRouter.js'
import authRouter from './routes/authRouter.js'
import userRouter from './routes/userRouter.js'
import User from './models/UserModel.js';

import {dirname} from 'path'
import { fileURLToPath } from 'url';
import path from 'path';

import errorHandlerMiddleware from './middleware/errorHandlerMiddleware.js';
import { authenticateUser } from './middleware/authMiddleware.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

if(process.env.NODE_ENV == 'development') {
    app.use(morgan('dev'));
}

app.use('/public/uploads', express.static(path.resolve(__dirname, 'public/uploads')));

app.use(cookieParser());
app.use(express.json());

// const client = redis.createClient({url:process.env.REDIS_URL});
// client.connect().catch(err => {
//   console.error('Redis connection error:', err);
// });

// client.on('connect', () => {
//   console.log('Connected to Redis');
// });

// client.on('end', () => {
//   console.log('Redis client connection closed');
// });
// export {client};

// app.get('/', (req, res) => {
//   res.send('Backend 5200');
// });

app.get('/api/v1/test', (req, res) => {
  res.json({msg:'test route'})
})

app.get('/api/users', async(req, res) => {
  console.log("get userrs");
  let data = await User.find({});
  console.log(data);
  res.send(data); 
})

app.use('/api/v1/jobs', authenticateUser, jobRouter)
app.use('/api/v1/users', authenticateUser, userRouter)
// app.use('/api/v1/tasks', taskRouter)
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/getTeacher', userRouter)


app.use(express.static(path.join(__dirname, '/client/dist')))
app.get('*', (req, res) =>{
  res.sendFile(path.join(__dirname, '/client/dist/index.html'))
})

app.use('*', (req, res)=>{
    res.status(404).json({msg: 'not found'})
})

app.use(errorHandlerMiddleware)

const port = process.env.PORT || 5200

try {
  await mongoose.connect(process.env.MONGO_URL)
  app.listen(port, () => {
    console.log(`Server running on port ${port}..`);
  });
} catch (error) {
  console.log(error);
  process.exit(1);
}


