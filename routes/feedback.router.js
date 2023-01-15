import express from 'express';
import { body } from 'express-validator';
import { FEEDBACK } from '../constants/endpoint';
import { sendFeedback } from '../controllers/feedback.controller';

const feedbackRouter = express.Router();

feedbackRouter.post(
  FEEDBACK.SEND,
  [
    body('email').isEmail().withMessage('Enter valid email'),
    body('firstName').not().isEmpty().withMessage('firstName is required'),
    body('lastName').not().isEmpty().withMessage('lastName is required'),
    body('subject').not().isEmpty().withMessage('subject is required'),
    body('feedback').not().isEmpty().withMessage('feedback is required'),
  ],
  sendFeedback
);

export default feedbackRouter;
