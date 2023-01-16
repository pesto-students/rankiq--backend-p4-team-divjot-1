import nodeMailer from '../utils/emailUtils';
import * as Sentry from '@sentry/node';

export const sendFeedback = async (req, res) => {
  const data = {
    name: `${req.body.firstName} ${req.body.lastName}`,
    email: req.body.email,
    subject: req.body.subject,
    feedback: req.body.feedback,
  };
  try {
    await nodeMailer.sendFeedbackEmail(data);
    res.status(200).json({ message: 'feedback email sent successfully' });
  } catch (e) {
    Sentry.captureException(e);
  }
};
