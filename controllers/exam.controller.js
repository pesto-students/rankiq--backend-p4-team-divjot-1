import { validationResult } from 'express-validator';
import dbUtils from '../utils/mongoUtils';
import _lodash from 'lodash';
import { getStandardDeviation, findRank } from '../utils/commonUtils';

const { filter, orderBy, maxBy, meanBy, slice } = _lodash;

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

export const computeNormalisedMarks = async (req, res, next) => {
  try {
    const db = getDb();
    const marksCollection = db.collection('rrc2022');
    // find distinct subjects
    const subjects = await marksCollection.distinct('subject');
    const subjectData = {};

    subjects.forEach(async (subject) => {
      const shiftData = {};
      const subjectMarksCursor = await marksCollection.find({ subject });
      const sortedMarks = await subjectMarksCursor.sort({ mark: -1 });
      const subjectMarks = await sortedMarks.toArray();
      const allTop1 = slice(
        subjectMarks,
        0,
        Math.ceil(0.01 * subjectMarks.length)
      );
      const top1Avg = meanBy(allTop1, 'mark');
      const allAvg = meanBy(subjectMarks, 'mark');
      const allStdDev = getStandardDeviation(subjectMarks);
      const distictShiftsCursor = await marksCollection.aggregate([
        { $match: { subject } },
        { $group: { _id: { shift: '$shift', date: '$date' } } },
      ]);
      const distinctShift = await distictShiftsCursor.toArray();

      distinctShift.forEach(({ _id: { shift, date } }) => {
        const filteredArray = filter(
          subjectMarks,
          (s) => s.shift === shift && s.date === date
        );
        const shiftDataArray = orderBy(filteredArray, ['mark'], ['desc']);
        const shiftAverage = meanBy(filteredArray, 'mark');
        shiftData[`${date}-${shift}`] = {
          data: shiftDataArray,
          average: shiftAverage,
          stdDev: getStandardDeviation(shiftDataArray),
          top1: meanBy(
            slice(shiftDataArray, 0, Math.ceil(0.01 * shiftDataArray.length)),
            'mark'
          ),
        };
      });

      const baseShiftValue = maxBy(Object.values(shiftData), 'average');

      shiftData.baseShiftValue = baseShiftValue;

      subjectData[subject] = shiftData;

      subjectMarks.forEach(({ rollNumber, date, shift, mark }) => {
        const shiftKey = `${date}-${shift}`;
        const mgt = top1Avg;
        const mgq = allAvg + allStdDev;
        const mij = mark;
        const mti = shiftData[shiftKey].top1;
        const miq = shiftData[shiftKey].average + shiftData[shiftKey].stdDev;
        const mgmq = meanBy(baseShiftValue.data, 'mark') + allStdDev;
        const normalisedMark = ((mgt - mgq) / (mti - miq)) * (mij - miq) + mgmq;

        const updateDocument = {
          $set: {
            normalisedMark,
          },
        };
        marksCollection.updateOne({ rollNumber }, updateDocument);
      });
    });

    res.status(200).json({ message: 'normalisation started' });
  } catch (e) {
    next();
  }
};

export const calculateRank = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ errors: errors.array().map(({ msg }) => msg) });
  }

  try {
    const { rollNumber } = req.body;
    const db = getDb();
    const marksCollection = db.collection('rrc2022');
    const studentData = await marksCollection.findOne({ rollNumber });
    if (studentData) {
      const { subject, date, time, zone, category, mark } = studentData;
      let overAllCursor = await marksCollection.find({ subject });
      overAllCursor = await overAllCursor.sort({ mark: -1 });
      const overall = await overAllCursor.toArray();

      let zoneCursor = await marksCollection.find({ subject, zone });
      zoneCursor = await zoneCursor.sort({ mark: -1 });
      const zones = await zoneCursor.toArray();

      let zoneShiftCursor = await marksCollection.find({
        subject,
        zone,
        date,
        time,
      });
      zoneShiftCursor = await zoneShiftCursor.sort({ mark: -1 });
      const zoneShift = await zoneShiftCursor.toArray();

      let zoneCategoryCursor = await marksCollection.find({
        subject,
        zone,
        category,
      });
      zoneCategoryCursor = await zoneCategoryCursor.sort({ mark: -1 });
      const zoneCategory = await zoneCategoryCursor.toArray();

      let zoneShiftCategoryCursor = await marksCollection.find({
        subject,
        zone,
        date,
        time,
        category,
      });
      zoneShiftCategoryCursor = await zoneShiftCategoryCursor.sort({
        mark: -1,
      });
      const zoneShiftCategory = await zoneShiftCategoryCursor.toArray();

      const objectToReturn = {
        overall: findRank(overall, rollNumber),
        zone: findRank(zones, rollNumber),
        zoneShift: findRank(zoneShift, rollNumber),
        zoneCategory: findRank(zoneCategory, rollNumber),
        zoneShiftCategory: findRank(zoneShiftCategory, rollNumber),
        rawMarks: mark,
        zoneSelected: zone,
        categorySelected: category,
      };

      res.status(200).json(objectToReturn);
    } else {
      res.status(404).json({ message: 'Details not found' });
    }
  } catch (e) {
    next();
  }
};

export const getExamHistory = async (req, res, next) => {
  try {
    const db = getDb();
    const marksCollection = db.collection('rrc2022');
    const history = await marksCollection
      .find({ userIds: req.email })
      .sort([['_id', -1]])
      .toArray();
    res.status(200).json(history);
  } catch (e) {
    next(e);
  }
};
