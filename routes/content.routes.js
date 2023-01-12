import express from 'express';
import { getContent } from '../controllers/content.controller.js';
import { CONTENT } from '../constants/endpoint.js';

const contentRouter = express.Router();

contentRouter.get(CONTENT.GET_CONTENT, getContent);

export default contentRouter;
