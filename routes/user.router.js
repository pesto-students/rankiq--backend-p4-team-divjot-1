import express from 'express';
import { body, check } from 'express-validator';
import checkDuplicateUser from '../middlewares/checkDuplicateUser';
import { REGEX } from '../constants/global';
import { signUp, signIn, verifyUser } from '../controllers/user.controller';

const userRouter = express.Router();

// enum for routes
// localisation for server and client
// react-localisation
// Add localisation in NFR for PRD
userRouter.post(
  '/signup',
  [
    body('email').isEmail().withMessage('Enter valid email'),
    body('firstName').not().isEmpty().withMessage('firstName is required'),
    check('password')
      .matches(REGEX.PASSWORD)
      .withMessage(
        'Passowrd must contain combination of numbers,alphabets and special chars along with Capital letter'
      ),
    checkDuplicateUser,
  ],
  signUp
);

userRouter.post(
  '/signin',
  [
    body('email').isEmail().withMessage('Enter valid email'),
    body('password').not().isEmpty().withMessage('firstName is required'),
  ],
  signIn
);

userRouter.get('/confirm/:confirmationCode', verifyUser);

export default userRouter;
