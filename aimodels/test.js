import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const openAiApiKey = process.env.OPENAI_API_KEY;
const replicateApiToken = process.env.REPLICATE_API_TOKEN;

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
          { role: 'system', content: 'You are a helpful assistant that generates prompts for image generation, vintage cartoon style.' },
          { role: 'user', content: `Generate a prompt for an image based on the following description: ${contents}` }
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

    // 미리 제공된 문구를 포함한 최종 프롬프트 생성
    const staticText = `Trigger: vintage cartoon\nA vintage, noir-inspired cartoon scene that evokes the elegance and mystery of mid-20th century aesthetics. The characters are stylishly dressed in glamorous evening wear, from tailored suits to sleek black dresses, and are depicted in luxurious settings like dimly lit bars, cobblestone streets, and sophisticated cafés. The overall tone is monochromatic or sepia, with dramatic lighting and deep shadows, enhancing the mood of intrigue and class. The scenes capture moments of quiet solitude or subtle interactions, often with a hint of mystery, reminiscent of classic film noir. Architectural elements include European-style streets, high-end urban offices with views of iconic city skylines, and cozy yet opulent interiors. The illustrations exude a sense of timeless elegance, with expressive character designs and a rich atmosphere that feels both nostalgic and cinematic.\n\n`;

    // GPT 프롬프트와 미리 정의된 문구 결합
    return staticText + gptPrompt;
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
async function generateImageModel1(contents) {
  try {
    // GPT-3.5 API를 사용해 프롬프트 생성
    const prompt = await generatePromptFromGPT(contents);
    console.log('Generated Prompt:', prompt);

    // Replicate를 사용해 이미지 생성
    const imageUrl = await generateImageWithReplicate(prompt);
    console.log('Generated Image URL:', imageUrl);

    // 이미지 URL 반환
    return imageUrl;
  } catch (error) {
    console.error('Error generating image model:', error);
    throw error;
  }
}

// 사용 예시
(async () => {
  const contents = "오늘 하루종일 공부했더니 너무 피곤해서 힘들어";
  const imageUrl = await generateImageModel1(contents);
  console.log('Final Image URL:', imageUrl);
})();
