import express from 'express';
import { body } from 'express-validator';
import checkDuplicateMarksEntry from '../middlewares/checkDuplicateMarksEntry';
import checkForNewMarks from '../middlewares/checkForNewMarks';
import {
  logMarks,
  computeNormalisedMarks,
  calculateRank,
  getExamHistory,
} from '../controllers/exam.controller';
import { EXAM } from '../constants/endpoint';
import { verifyToken } from '../middlewares/authJWT';

const examRouter = express.Router();

examRouter.post(
  EXAM.LOG_MARKS,
  [
    body('rollNumber').not().isEmpty().withMessage('rollNumber is required'),
    body('name').not().isEmpty().withMessage('name is required'),
    body('caste').not().isEmpty().withMessage('caste is required'),
    body('date').not().isEmpty().withMessage('caste is required'),
    body('shift').not().isEmpty().withMessage('shift is required'),
    body('mark').not().isEmpty().withMessage('mark is required'),
    body('subject').not().isEmpty().withMessage('subject is required'),
    body('url').not().isEmpty().withMessage('url is required'),
    body('zone').not().isEmpty().withMessage('zone is required'),
    checkDuplicateMarksEntry,
  ],
  logMarks
);

examRouter.get(EXAM.NORMALISE, [checkForNewMarks], computeNormalisedMarks);

examRouter.post(
  EXAM.CHECK_RANK,
  [body('rollNumber').not().isEmpty().withMessage('rollNumber is required')],
  calculateRank
);

examRouter.get(EXAM.HISTORY, [verifyToken], getExamHistory);

export default examRouter;
