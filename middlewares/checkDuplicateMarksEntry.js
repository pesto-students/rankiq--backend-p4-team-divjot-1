import _lodash from 'lodash';
import dbUtils from '../utils/mongoUtils.js';

const { isEmpty } = _lodash;
const { getDb } = dbUtils;

const checkDuplicateMarksEntry = async (req, res, next) => {
  const { rollNumber = '', userId = '' } = req.body;
  const db = getDb();
  const marksCollection = db.collection('rrc2022');
  const marksCursor = await marksCollection.find({
    rollNumber,
    userIds: userId,
  });
  const marks = await marksCursor.toArray();
  if (!isEmpty(marks)) {
    res.status(200).send({ message: 'marks already saved' });
    return;
  }

  next();
};

export default checkDuplicateMarksEntry;
