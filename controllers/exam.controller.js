import { validationResult } from 'express-validator';
import dbUtils from '../utils/mongoUtils';

const { getDb } = dbUtils;

export const logMarks = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ errors: errors.array().map(({ msg }) => msg) });
  }
  try {
    const {
      rollNumber,
      userId,
      name,
      subject,
      caste,
      shift,
      date,
      reservation,
      zone,
      url,
      mark,
    } = req.body;
    const db = getDb();
    const marksCollection = db.collection('rrc2022');
    const markObj = await marksCollection.findOne({ rollNumber });
    if (markObj) {
      const updateDocument = {
        $set: {
          userIds: [...markObj.userIds, userId],
        },
      };
      const result = await marksCollection.updateOne(
        { rollNumber },
        updateDocument
      );
      if (result.modifiedCount === 1) {
        res.status(200).send({
          message: 'marks added successfully',
        });
      } else {
        res
          .status(500)
          .send({ message: 'Error saving marks. Please try again' });
        return;
      }
    } else {
      const dataToInsert = {
        rollNumber,
        name,
        mark,
        subject,
        caste,
        shift,
        normalisedMark: null,
        date,
        reservation,
        zone,
        userIds: userId ? [userId] : [],
        url,
      };

      await marksCollection.insertOne(dataToInsert);

      res.status(200).json({ message: 'Marks added successfully' });
    }
  } catch (e) {
    next();
  }
};
