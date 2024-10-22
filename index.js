import express from 'express'; // express 모듈을 import 방식으로 불러옴
import cors from 'cors'; // cors 모듈을 import 방식으로 불러옴
import dotenv from 'dotenv'; // dotenv 모듈을 import 방식으로 불러옴
import path from 'path'; // 경로 모듈 (필요한 경우)

dotenv.config(); // 환경변수 파일(.env) 로드

const app = express();
const port = 8000;

app.use(cors()); 
app.use(express.json());

// 루트 경로 설정
app.get('/', (req, res) => {
    res.send('루트 페이지입니다.');
});

// /ai 미들웨어 설정 및 Router 연결
import modelRouter from './routes/modelRouter.js'; // 상대 경로에서 .js 확장자를 명시해야 합니다
app.use('/ai', modelRouter);

// /stt 미들웨어 설정 및 Router 연결
import sttRouter from './routes/sttRouter.js'; // 상대 경로에서 .js 확장자를 명시해야 합니다
app.use('/stt', sttRouter);

// 서버 시작
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
