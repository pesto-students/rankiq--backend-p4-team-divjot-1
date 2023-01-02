import express from 'express';
import { getContent } from '../controllers/content.controller';

const contentRouter = express.Router();

contentRouter.get('/getContent', getContent);

export default contentRouter;
