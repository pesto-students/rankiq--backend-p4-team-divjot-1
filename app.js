import mongoUtil from './utils/mongoUtils.js';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
import userRouter from './routes/user.router';
import contentRouter from './routes/content.routes';
import examRouter from './routes/exam.router';
import feedbackRouter from './routes/feedback.router';
import { CONTENT, EXAM, FEEDBACK, USER } from './constants/endpoint';

dotenv.config();
const port = parseInt(process.env.PORT, 10) || 3000;
const app = express();

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({
      // to trace all requests to the default router
      app,
      // alternatively, you can specify the routes you want to trace:
      // router: someRouter,
    }),
  ],
  tracesSampleRate: 1.0,
});

app.use(cors());
app.use(express.json());

app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

// make enum for routes
app.use(USER.BASE, userRouter);
app.use(CONTENT.BASE, contentRouter);
app.use(EXAM.BASE, examRouter);
app.use(FEEDBACK.BASE, feedbackRouter);
app.get('/', (req, res) => {
  res.send('hello world latest');
});

app.use(Sentry.Handlers.errorHandler());

const transaction = Sentry.startTransaction({
  op: 'appConnection',
  name: 'DB connection and App Hosting',
});

mongoUtil.connectToServer((err) => {
  if (err) {
    Sentry.captureException(err);
  }
  app.listen(port, () => {
    transaction.finish();
    console.log('app listening on port ' + port);
  });
});
