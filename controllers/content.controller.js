import fetch from 'node-fetch';

export const getContent = async (req, res, next) => {
  try {
    const url = req.query.requestUrl;
    if (!url) {
      return res.status(400).json({ message: 'Invalid Url' });
    }
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(400).json({ message: 'Invalid Url' });
    }
    const htmlString = await response.text();
    res.status(200).send(htmlString);
  } catch (e) {
    next();
  }
};
