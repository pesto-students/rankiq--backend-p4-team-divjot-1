import express from 'express';
import { body, check } from 'express-validator';
import checkDuplicateUser from '../middlewares/checkDuplicateUser';
import { REGEX } from '../constants/global';
import { USER } from '../constants/endpoint';
import {
  signUp,
  signIn,
  verifyUser,
  createResetPasswordLink,
  updatePassword,
} from '../controllers/user.controller';

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

userRouter.post(
  USER.RESET_PASSWORD_LINK,
  [body('email').isEmail().withMessage('Enter valid email')],
  createResetPasswordLink
);

userRouter.post(
  USER.UPADATE_PASSWORD,
  [
    check('password')
      .matches(REGEX.PASSWORD)
      .withMessage(
        'Passowrd must contain combination of numbers,alphabets and special chars along with Capital letter'
      ),
  ],
  updatePassword
);

export default userRouter;
