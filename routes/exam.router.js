import express from 'express';
import { body } from 'express-validator';
import _lodash from 'lodash';
import checkDuplicateMarksEntry from '../middlewares/checkDuplicateMarksEntry';
import { logMarks } from '../controllers/exam.controller';

const { isNaN } = _lodash;

const examRouter = express.Router();

examRouter.post(
  '/logMarks',
  [
    body('rollNumber').not().isEmpty().withMessage('rollNumber is required'),
    body('name').not().isEmpty().withMessage('name is required'),
    body('caste').not().isEmpty().withMessage('caste is required'),
    body('date')
      .custom((v) => !isNaN(Date.parse(v)))
      .optional()
      .withMessage('date is invalid'),
    body('shift').not().isEmpty().withMessage('shift is required'),
    body('mark').not().isEmpty().withMessage('mark is required'),
    body('reservation').not().isEmpty().withMessage('reservation is required'),
    body('subject').not().isEmpty().withMessage('subject is required'),
    body('url').not().isEmpty().withMessage('url is required'),
    body('zone').not().isEmpty().withMessage('zone is required'),
    checkDuplicateMarksEntry,
  ],
  logMarks
);

export default examRouter;
