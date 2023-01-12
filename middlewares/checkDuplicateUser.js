import dbUtils from '../utils/mongoUtils.js';
import _lodash from 'lodash';

const { isEmpty } = _lodash;
const { getDb } = dbUtils;

const checkDuplicateUser = async (req, res, next) => {
  const { email = '' } = req.body;
  const db = getDb();
  const usersCollection = db.collection('users');
  const userCursor = await usersCollection.find({
    email,
  });
  const users = await userCursor.toArray();
  if (!isEmpty(users)) {
    res.status(400).send({ message: 'Failed! Email is already in use!' });
    return;
  }

  next();
};

export default checkDuplicateUser;
