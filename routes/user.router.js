import express from 'express';
import { body, check } from 'express-validator';
import checkDuplicateUser from '../middlewares/checkDuplicateUser.js';
import { REGEX } from '../constants/global.js';
import { USER } from '../constants/endpoint.js';
import { signUp, signIn, verifyUser } from '../controllers/user.controller.js';

const userRouter = express.Router();

userRouter.post(
  USER.SIGNUP,
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
  USER.SIGNIN,
  [
    body('email').isEmail().withMessage('Enter valid email'),
    body('password').not().isEmpty().withMessage('firstName is required'),
  ],
  signIn
);

userRouter.get(USER.CONFIRM, verifyUser);

export default userRouter;
