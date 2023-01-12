import dbUtils from '../utils/mongoUtils.js';

const { getDb } = dbUtils;

const checkForNewMarks = async (req, res, next) => {
  const db = getDb();
  const marksCollection = db.collection('rrc2022');
  const mark = await marksCollection.findOne({
    normalisedMark: null,
  });

  if (!mark) {
    res.status(200).send({ message: 'No new records present' });
    return;
  }

  next();
};

export default checkForNewMarks;
