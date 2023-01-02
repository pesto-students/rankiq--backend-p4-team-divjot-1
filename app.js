import mongoUtil from './utils/mongoUtils.js';
import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
import userRouter from './routes/user.router';
import contentRouter from './routes/content.routes';

dotenv.config();
const port = parseInt(process.env.PORT, 10) || 3000;
const app = express();

app.use(cors());
app.use(express.json());

// make enum for routes
app.use('/user', userRouter);
app.use('/content', contentRouter);
app.get('/', (req, res) => {
  res.send('hello world latest');
});

mongoUtil.connectToServer((err) => {
  if (err) console.log(err);
  app.listen(port, () => {
    console.log('app listening on port ' + port);
  });
});
