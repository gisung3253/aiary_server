import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const openAiApiKey = process.env.OPENAI_API_KEY;
const replicateApiToken = process.env.REPLICATE_API_TOKEN;

// 고정된 프롬프트와 생성된 프롬프트를 결합하는 함수
function combinePrompts(staticText, generatedPrompt) {
  if (generatedPrompt.length <= 200) {
    // 생성된 프롬프트가 50자 이하일 경우, 고정 프롬프트를 뒤에 추가
    return generatedPrompt + " " + staticText;
  } else {
    // 생성된 프롬프트가 50자 이상일 경우, 고정 프롬프트를 앞에 추가
    return staticText + generatedPrompt;
  }
}

// GPT-3.5 API를 사용해 입력 텍스트를 프롬프트로 변환
async function generatePromptFromGPT(contents) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that translates Korean descriptions into very short, concise English image prompts. Extract only the most essential and distinctive features, keeping the prompt as brief as possible.' },
          { role: 'user', content: `Extract the most essential and distinctive features from the following Korean description and generate a very short image prompt in English: ${contents}` }
        ],
        max_tokens: 100,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`GPT-3.5 API Error: ${response.statusText}`);
    }

    const data = await response.json();
    const gptPrompt = data.choices[0].message.content.trim();

    // 고정된 프롬프트
    const staticText = `Trigger: pop art\nAlways portraying young men or young women, no text\nGenerate a bold, vibrant pop art image with bright primary colors, strong black-and-white contrasts, and thick outlines. The scene should feature dynamic, exaggerated elements inspired by popular culture and urban life, with simple shapes, halftone shading, and a playful, energetic tone. **No text, letters, or symbols should appear in the image.** Focus on visuals only.\n\n`;

    // 고정된 프롬프트와 GPT 생성된 프롬프트 결합
    return combinePrompts(staticText, gptPrompt);
  } catch (error) {
    console.error('Error generating prompt from GPT-3.5:', error);
    throw error;
  }
}

// Replicate를 사용해 이미지 생성
async function generateImageWithReplicate(prompt) {
  try {
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${replicateApiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: "828f054480d6ac961fd249da0eb95241becfbfd2f909e19301354a99f29bb831",
        input: {
          prompt: prompt,
          output_format: "jpg",
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Replicate API Error: ${response.statusText}`);
    }

    const prediction = await response.json();

    // 이미지 생성 완료될 때까지 상태 확인
    let result;
    const getUrl = prediction.urls.get;
    while (true) {
      const statusResponse = await fetch(getUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${replicateApiToken}`
        }
      });

      result = await statusResponse.json();

      // 상태가 "succeeded"일 때까지 대기
      if (result.status === "succeeded") {
        console.log("Image generation succeeded.");
        break;
      } else if (result.status === "failed") {
        throw new Error("Image generation failed.");
      }

      console.log("Waiting for image generation...");
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3초 대기
    }

    // 이미지 URL 출력
    if (result.output && result.output[0]) {
      return result.output[0];
    } else {
      throw new Error("No image URL found in the prediction response.");
    }
  } catch (error) {
    console.error('Error generating image with Replicate:', error);
    throw error;
  }
}

// 전체 프로세스 실행
async function generateImageModel2(contents) {
  try {
    // GPT-3.5 API를 사용해 프롬프트 생성
    const prompt = await generatePromptFromGPT(contents);
    console.log('Generated Prompt:', prompt);

    // Replicate를 사용해 이미지 생성
    const imageUrl = await generateImageWithReplicate(prompt);

    // 이미지 URL 반환
    return imageUrl;
  } catch (error) {
    console.error('Error generating image model:', error);
    throw error;
  }
}


export default generateImageModel2;
