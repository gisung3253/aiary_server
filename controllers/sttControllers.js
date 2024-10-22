import multer from 'multer';
import speech from '@google-cloud/speech';

const credentials = {
  type: process.env.GOOGLE_TYPE,
  project_id: process.env.GOOGLE_PROJECT_ID,
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
  private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),  // 줄바꿈 처리
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  client_id: process.env.GOOGLE_CLIENT_ID,
  auth_uri: process.env.GOOGLE_AUTH_URI,
  token_uri: process.env.GOOGLE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
};


const upload = multer();

const client = new speech.SpeechClient({
  credentials,
});

export const stt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const audioBytes = req.file.buffer;

    const audio = {
      content: audioBytes,
    };

    const config = {
      encoding: 'WEBM_OPUS',
      sampleRateHertz: 48000,
      languageCode: 'ko-KR',
    };

    const request = {
      config: config,
      audio: audio,
    };

    const [response] = await client.recognize(request);

    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');

      console.log("===== transcription: ", transcription);
    res.send({ transcription });
  } catch (error) {
    console.error('Error during speech recognition:', error);
    res.status(500).send('Error during speech recognition.');
  }
};

export default [upload.single('audio'), stt];