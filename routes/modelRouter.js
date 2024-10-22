import express from 'express';
import  handleModelRequest  from '../controllers/modelController.js'; // named export를 가져오는지 확인

const router = express.Router();

router.post('/model', handleModelRequest); // POST 요청에 대한 처리 함수 연결

export default router;
