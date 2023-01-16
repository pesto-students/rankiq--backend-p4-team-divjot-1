import { validationResult } from 'express-validator';
import JWT from 'jsonwebtoken';
import dotenv from 'dotenv';
import dbUtils from '../utils/mongoUtils';
import nodeMailer from '../utils/emailUtils';
import cryptoUtils from '../utils/cryptoUtils';

const { getDb } = dbUtils;
dotenv.config();
export const signUp = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ errors: errors.array().map(({ msg }) => msg) });
  }
  try {
    const db = getDb();
    const usersCollection = db.collection('users');
    const { email, password, firstName, lastName } = req.body;
    const token = JWT.sign({ email }, process.env.ACCESS_TOKEN_SECRET);
    const userObj = {
      email,
      firstName,
      lastName,
      password: cryptoUtils.encrypt(password),
      status: 'Pending',
      confirmationCode: token,
      resetToken: '',
    };
    await usersCollection.insertOne(userObj);

    res.status(200).json({ message: 'User added successfully' });

    nodeMailer.sendConfirmationEmail(
      userObj.firstName,
      userObj.email,
      userObj.confirmationCode
    );
  } catch (e) {
    next();
  }
};

export const signIn = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ errors: errors.array().map(({ msg }) => msg) });
  }
  try {
    const db = getDb();
    const usersCollection = db.collection('users');
    const { email, password } = req.body;
    const user = await usersCollection.findOne({ email });
    if (!user) {
      res.status(404).send({ message: 'User Not found.' });
    }
    const dbPassword = cryptoUtils.decrypt(user.password);
    const isPasswordInvalid = dbPassword !== password;
    if (isPasswordInvalid) {
      return res.status(401).send({
        accessToken: null,
        message: 'Invalid Password!',
      });
    }

    const accessToken = await JWT.sign(
      { email: user.email, status: user.status },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: 86400 } // 24 hrs
    );

    res.status(200).send({
      email: user.email,
      status: user.status,
      firstName: user.firstName,
      accessToken,
    });
  } catch (e) {
    next();
  }
};

export const verifyUser = async (req, res, next) => {
  try {
    const db = getDb();
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({
      confirmationCode: req.params.confirmationCode,
    });

    if (!user) {
      return res.status(404).send({ message: 'User Not found.' });
    }

    const updateDocument = {
      $set: {
        status: 'Active',
      },
    };
    const result = await usersCollection.updateOne(
      { email: user.email },
      updateDocument
    );

    if (result.modifiedCount === 1) {
      res.status(200).send({
        message: 'Thanks for verifying your account',
      });
    } else {
      res
        .status(500)
        .send({ message: 'Error Activating your account. Please try again' });
      return;
    }
  } catch (e) {
    next();
  }
};

export const createResetPasswordLink = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ errors: errors.array().map(({ msg }) => msg) });
  }
  try {
    const { email } = req.body;
    const db = getDb();
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ email });
    if (!user) {
      res.status(404).send({ message: 'User Not found.' });
    }
    const token = JWT.sign({ email }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '15m',
    });

    const updateDocument = {
      $set: {
        resetToken: token,
      },
    };
    const result = await usersCollection.updateOne(
      { email: user.email },
      updateDocument
    );

    if (result.modifiedCount === 1) {
      nodeMailer.sendResetPasswordLink({
        name: user.firstName,
        email: email,
        token: token,
      });
      return res.status(200).json({
        message: 'Reset password link has been sent. Please check your email.',
      });
    }
    res.status(500).send({ message: 'Reset password link error.' });
  } catch (e) {
    next();
  }
};

export const updatePassword = async (req, res, next) => {
  const { resetToken, password } = req.body;
  if (resetToken) {
    JWT.verify(resetToken, process.env.ACCESS_TOKEN_SECRET, (error) => {
      if (error) {
        return res
          .status(400)
          .send({ message: 'Incorrect token or it is expired' });
      }
    });
  }
  try {
    const db = getDb();
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({
      resetToken: resetToken,
    });

    if (!user) {
      return res.status(404).send({ message: 'User Not found.' });
    }

    const updateDocument = {
      $set: {
        password: cryptoUtils.encrypt(password),
        resetToken: '',
      },
    };
    const result = await usersCollection.updateOne(
      { email: user.email },
      updateDocument
    );

    if (result.modifiedCount === 1) {
      res.status(200).send({
        message: 'password updated successfully',
      });
    } else {
      res.status(500).send({
        message: 'Error occured while updating password. Please try again',
      });
      return;
    }
  } catch (e) {
    next();
  }
};
