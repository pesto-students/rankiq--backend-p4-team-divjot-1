import express from 'express';
import { getContent } from '../controllers/content.controller';
import { CONTENT } from '../constants/endpoint';

const contentRouter = express.Router();

contentRouter.get(CONTENT.GET_CONTENT, getContent);

export default contentRouter;
