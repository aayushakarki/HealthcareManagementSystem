import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";

<<<<<<< HEAD
=======
// Function to handle getting initial advice
>>>>>>> 1984fa28dbeb61e6196f67b473ee616e3cd4a27a
export const getAdvice = catchAsyncErrors(async (req, res, next) => {
  const { heartData } = req.body;

  if (!heartData) {
    return res.status(400).json({ success: false, message: "Heart data is required." });
  }

<<<<<<< HEAD
=======
  // Initial prompt for the AI model
>>>>>>> 1984fa28dbeb61e6196f67b473ee616e3cd4a27a
const prompt = `Based on the following clinical data, which indicates a high likelihood of heart disease: ${JSON.stringify(heartData)}, 
explain in simple terms which factors likely contributed the most to this result and why. Then, suggest clear and practical lifestyle changes (diet, exercise, and stress management) to reduce risk and improve heart health. 
Keep the explanation patient-friendly and easy to understand.`;

  try {
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!geminiResponse.ok) {
      console.error("Gemini API Error:", await geminiResponse.text());
      return res.status(500).json({ success: false, message: "Could not get advice from the AI at this time." });
    }

    const data = await geminiResponse.json();
    const advice = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No advice available.";

    res.status(200).json({ success: true, advice });
  } catch (error) {
    console.error("getAdvice controller error:", error);
    next(error);
  }
});

<<<<<<< HEAD
=======
// Function to handle follow-up questions
>>>>>>> 1984fa28dbeb61e6196f67b473ee616e3cd4a27a
export const askQuestion = catchAsyncErrors(async (req, res, next) => {
  const { question, chatHistory } = req.body;

  if (!question || !chatHistory) {
    return res.status(400).json({ success: false, message: "Question and chat history are required." });
  }

<<<<<<< HEAD
=======
  // Construct the conversation history for the AI model
>>>>>>> 1984fa28dbeb61e6196f67b473ee616e3cd4a27a
  const contents = chatHistory.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }],
  }));
  contents.push({ role: 'user', parts: [{ text: question }] });


  try {
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }),
      }
    );

    if (!geminiResponse.ok) {
        console.error("Gemini API Error:", await geminiResponse.text());
        return res.status(500).json({ success: false, message: "Could not get an answer from the AI at this time." });
    }

    const data = await geminiResponse.json();
    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No answer available.";

    res.status(200).json({ success: true, answer });
  } catch (error) {
    console.error("askQuestion controller error:", error);
    next(error);
  }
}); 