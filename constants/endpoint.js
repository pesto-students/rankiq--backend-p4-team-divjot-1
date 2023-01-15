export const USER = {
  BASE: '/user',
  SIGNIN: '/signin',
  SIGNUP: '/signup',
  CONFIRM: '/confirm/:confirmationCode',
  RESET_PASSWORD_LINK: '/resetPasswordLink',
  UPADATE_PASSWORD: '/updatePassword',
};

export const EXAM = {
  BASE: '/exam',
  LOG_MARKS: '/logMarks',
  NORMALISE: '/calculateNormalisedMarks',
  CHECK_RANK: '/checkRank',
  HISTORY: '/userExamHistory',
};

export const CONTENT = {
  BASE: '/content',
  GET_CONTENT: '/getContent',
};

export const FEEDBACK = {
  BASE: '/feedback',
  SEND: '/sendEmail',
};
