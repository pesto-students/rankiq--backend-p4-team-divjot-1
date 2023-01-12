import nodeMailer from '../utils/emailUtils';

export const sendFeedback = async (req, res) => {
  console.log('sendFeedback', req.body);
  const data = {
    name: `${req.body.firstName} ${req.body.lastName}`,
    email: req.body.email,
    subject: req.body.subject,
    feedback: req.body.feedback,
  };
  try {
	  nodeMailer.sendFeedbackEmail(data);
    res.status(200).json({ message: 'feedback email sent successfully' });
  } catch (e) {
    console.warn('send feedback falied', data);
    res.status(401).json({ message: 'feedback email failed' });
  }
};
