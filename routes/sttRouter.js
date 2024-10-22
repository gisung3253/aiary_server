import express from 'express';
import  stt  from '../controllers/sttControllers.js'; // named import

const router = express.Router();


router.post('/', stt);

export default router; 