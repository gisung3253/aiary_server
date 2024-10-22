import multer from 'multer';
import speech from '@google-cloud/speech';
import credentials from './aiary-438716-366ed07002e5.json' assert { type: "json" };


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