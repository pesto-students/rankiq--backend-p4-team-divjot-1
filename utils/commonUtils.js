import _lodash from 'lodash';

const { meanBy, findIndex } = _lodash;

export function getStandardDeviation(array, key = 'mark') {
  const n = array.length;
  const mean = meanBy(array, key);
  return Math.sqrt(
    array.map(({ [key]: x }) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) /
      n
  );
}

export const findRank = (arr, rollNumber) => {
  const index = findIndex(arr, (d) => d.rollNumber === rollNumber);
  return index !== -1
    ? { rank: index + 1, total: arr.length }
    : { rank: null, total: null };
};
