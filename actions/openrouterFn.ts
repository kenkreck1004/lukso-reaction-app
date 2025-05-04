export async function callOpenRouter(apiKey: any, role: any, content: any) {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'qwen/qwen3-30b-a3b:free',
          messages: [
            {
              role: role,
              content: content,
            },
          ],
        }),
    });

    // Parse the response as JSON
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    return responseData;
}

export async function genImage(apiKey: any, content: any) {
    const url = 'https://ir-api.myqa.cc/v1/openai/images/generations';
    const options = {
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prompt: content,
            model: 'stabilityai/sdxl-turbo:free'
        })
    };

    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
}