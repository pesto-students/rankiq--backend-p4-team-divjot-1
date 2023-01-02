import JWT from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const verifyToken = async (req, res, next) => {
  let token = req.headers['x-access-token'];

  if (!token) {
    return res.status(403).send({ message: 'No token provided!' });
  }
  JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'Unauthorized!' });
    }
    req.email = decoded.email;
    req.status = decoded.status;
    next();
  });
};

export { verifyToken };
