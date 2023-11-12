import { OpenAI } from 'openai';
import loadingSvg from './images/loading.svg'

const setupInputContainer = document.getElementById('setup-input-container')
const movieBossText = document.getElementById('movie-boss-text')

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true 
})

document.getElementById("send-btn").addEventListener("click", () => {
  const setupTextarea = document.getElementById('setup-textarea')
  if (setupTextarea.value) {
    const userInput = setupTextarea.value
    setupInputContainer.innerHTML = `<img src="${loadingSvg}" class="loading" id="loading">`
    movieBossText.innerText = `Ok, just wait a second while my digital brain digests that...`
   fetchCombinedData(userInput)
  }
})

async function fetchCombinedData(outline) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [
        {
          role: "system",
          content: `Generate a JSON file using the user's outline: 
          message: a short, personalized message in English to enthusiastically respond to the given outline, indicating that the outline sounds interesting and that you need some minutes to think about it. Make sure to reference something from the provided outline. 
          synopsis: an engaging, professional, and marketable movie synopsis based on the same outline, including ideal actors' names in round brackets after each character. 
          title: a catchy movie title for the synopsis provided in the second part
          names: list of extracted names in brackets from the synopsis
          prompt: a short description of an image which could be used to advertise a movie based on a title and synopsis. The description should be rich in visual detail but contain no names.
          `,
        },
        { role: "user", content: `outline: ${outline}` },
      ],
      max_tokens: 800,
      temperature: 1,
      response_format: { type: "json_object" }
    })

    // Parse the JSON content
    const combinedResponseJSON = JSON.parse(response.choices[0].message.content);

    // Now access the properties
    let message = combinedResponseJSON.message;
    let synopsis = combinedResponseJSON.synopsis;
    let title = combinedResponseJSON.title;
    let names = combinedResponseJSON.names;
    let prompt = combinedResponseJSON.prompt;

    movieBossText.innerText = message;
    document.getElementById('output-text').innerText = synopsis;
    document.getElementById('output-title').innerText = title;
    document.getElementById('output-stars').innerText = names;

    fetchImageUrl(prompt);
  } catch (error) {
    console.error("Error in fetchCombinedData:", error);
  }
}

async function fetchImageUrl(prompt){
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: prompt,
    n: 1,
    size: '1024x1024',
    response_format: 'b64_json' 
  })
  document.getElementById('output-img-container').innerHTML = `<img src="data:image/png;base64,${response.data[0].b64_json}">`
  setupInputContainer.innerHTML = `<button id="view-pitch-btn" class="view-pitch-btn">View Pitch</button>`
  document.getElementById('view-pitch-btn').addEventListener('click', ()=>{
    document.getElementById('setup-container').style.display = 'none'
    document.getElementById('output-container').style.display = 'flex'
    movieBossText.innerText = `This idea is so good I'm jealous! It's gonna make you rich for sure! Remember, I want 10% 💰`
  })
}