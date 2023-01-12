import mongoUtil from './utils/mongoUtils.js';
import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
import userRouter from './routes/user.router.js';
import contentRouter from './routes/content.routes.js';
import examRouter from './routes/exam.router.js';
import feedbackRouter from './routes/feedback.router.js';
import { CONTENT, EXAM, FEEDBACK, USER } from './constants/endpoint.js';

dotenv.config();
const port = parseInt(process.env.PORT, 10) || 3000;
const app = express();

app.use(cors());
app.use(express.json());

// make enum for routes
app.use(USER.BASE, userRouter);
app.use(CONTENT.BASE, contentRouter);
app.use(EXAM.BASE, examRouter);
app.use(FEEDBACK.BASE, feedbackRouter);
app.get('/', (req, res) => {
  res.send('hello world latest');
});

mongoUtil.connectToServer((err) => {
  if (err) console.log(err);
  app.listen(port, () => {
    console.log('app listening on port ' + port);
  });
});
