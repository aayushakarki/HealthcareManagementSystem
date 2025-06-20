import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js"
import ErrorHandler from "../middlewares/errorMiddleware.js"
import { Vitals } from "../models/vitalsSchema.js"
import { Notification } from "../models/notificationSchema.js"

// Get patient's vitals history
export const getVitalsHistory = catchAsyncErrors(async (req, res, next) => {
  const patientId = req.user._id

  const vitals = await Vitals.find({ patientId }).sort({ date: -1 })

  res.status(200).json({
    success: true,
    vitals,
  })
})

// Add new vitals record
export const addVitals = catchAsyncErrors(async (req, res, next) => {
  const { patientId, bloodPressure, heartRate, cholesterol, hdlCholesterol, respiratoryRate, weight, height, notes } = req.body

  if (!patientId || !bloodPressure || !heartRate || !cholesterol || !hdlCholesterol) {
    return next(new ErrorHandler("Please provide required vital signs and patient ID!", 400))
  }

  const vitals = await Vitals.create({
    patientId,
    bloodPressure,
    heartRate,
    cholesterol,
    hdlCholesterol,
    respiratoryRate,
    weight,
    height,
    notes,
    recordedBy: "Doctor",
  })

  // Create notification for the patient
    await Notification.create({
      userId: patientId,
      message: "Your vital signs were recorded by your doctor",
      type: "Vitals",
      relatedId: vitals._id,
      onModel: "Vitals",
    })

  res.status(201).json({
    success: true,
    vitals,
    message: "Vitals recorded successfully!",
  })
})

// Get a specific vitals record
export const getVitalsRecord = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params

  const vitals = await Vitals.findById(id)

  if (!vitals) {
    return next(new ErrorHandler("Vitals record not found!", 404))
  }

  // Check if the user is authorized to view this record
  if (req.user.role === "Patient" && vitals.patientId.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("You are not authorized to view this record!", 403))
  }

  res.status(200).json({
    success: true,
    vitals,
  })
})

// Delete a vitals record
export const deleteVitalsRecord = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params

  const vitals = await Vitals.findById(id)

  if (!vitals) {
    return next(new ErrorHandler("Vitals record not found!", 404))
  }

  // Only allow the patient who owns the record or doctors to delete it
  if (req.user.role === "Patient" && vitals.patientId.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("You are not authorized to delete this record!", 403))
  }

  await vitals.deleteOne()

  res.status(200).json({
    success: true,
    message: "Vitals record deleted successfully!",
  })
})

// Summarize latest vitals for a patient
export const summarizeVitals = catchAsyncErrors(async (req, res, next) => {
  try {
    const patientId = req.user._id;
    // Fetch the latest vitals record for this patient
    const latestVitals = await Vitals.findOne({ patientId }).sort({ date: -1 });
    if (!latestVitals) {
      return res.status(200).json({ summary: "No vitals data found to summarize." });
    }
    // Compose a prompt for Gemini
    const prompt = `
      Summarize the following patient vitals in simple, patient-friendly language:
      ${JSON.stringify(latestVitals, null, 2)}
    `;
    // Call Gemini API (text-only, no image)
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt }
              ]
            }
          ]
        })
      }
    );
    if (!geminiResponse.ok) {
      return res.status(200).json({ summary: "Sorry, I couldn't get a summary from the AI at this time." });
    }
    const data = await geminiResponse.json();

    console.log("Latest vitals sent to Gemini:", latestVitals); // for summarizeVitals
console.log("Gemini API response:", JSON.stringify(data, null, 2));

    const summary = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Summary not available.";
    res.status(200).json({ summary });
  } catch (error) {
    console.error("summarizeVitals error:", error);
    res.status(200).json({ summary: "Sorry, something went wrong while getting your summary." });
  }
});

export const askVitalAI = async (req, res, next) => {
  try {
    const { question } = req.body;
    const patientId = req.user._id;
    // Fetch the latest vitals record for this patient
    const latestVitals = await Vitals.findOne({ patientId }).sort({ date: -1 });
    if (!latestVitals) {
      return res.status(200).json({ answer: "No vitals data found to answer your question." });
    }
    // Compose a prompt for Gemini
    const prompt = `
      The following is the patient's latest vitals:
      ${JSON.stringify(latestVitals, null, 2)}
      \nQuestion: ${question}
      \nAnswer in simple, patient-friendly language.
    `;
    // Call Gemini API (text-only)
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt }
              ]
            }
          ]
        })
      }
    );
    if (!geminiResponse.ok) {
      return res.status(200).json({ answer: "Sorry, I couldn't get an answer from the AI at this time." });
    }
    const data = await geminiResponse.json();
    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No answer available.";
    res.status(200).json({ answer });
  } catch (error) {
    console.error("askVitalAI error:", error);
    res.status(200).json({ answer: "Sorry, something went wrong while getting your answer." });
  }
};