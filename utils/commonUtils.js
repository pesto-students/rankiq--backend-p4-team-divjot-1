import _lodash from 'lodash';

const { meanBy, findIndex, uniq } = _lodash;

export function getStandardDeviation(array, key = 'mark') {
  const n = array.length;
  const mean = meanBy(array, key);
  return Math.sqrt(
    array.map(({ [key]: x }) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) /
      n
  );
}

export const findRank = (arr, mark) => {
  const marksArray = arr.map((d) => d.mark);
  const uniqueMarkArray = uniq(marksArray);
  const index = findIndex(uniqueMarkArray, (d) => d === mark);
  return index !== -1
    ? { rank: index + 1, total: uniqueMarkArray.length }
    : { rank: null, total: null };
};
