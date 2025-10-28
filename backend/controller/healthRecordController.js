import { HealthRecord } from '../models/healthRecordSchema.js';
import { v2 as cloudinary } from 'cloudinary';
import { sendEmail } from "../utils/sendEmail.js";
import { User } from "../models/userSchema.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
<<<<<<< HEAD
import https from 'https';

=======
// import { documentAnalysisService } from '../utils/documentAnalysisService.js';
import https from 'https';

// Helper function to validate file type
>>>>>>> 1984fa28dbeb61e6196f67b473ee616e3cd4a27a
const isValidFileType = (mimetype) => {
  return mimetype === 'image/jpeg' || mimetype === 'image/png';
};

<<<<<<< HEAD
export const uploadHealthRecord = catchAsyncErrors(async (req, res, next) => {
  const { patientId, recordType, description } = req.body;

=======
// Upload a health record (for doctor or admin)
export const uploadHealthRecord = catchAsyncErrors(async (req, res, next) => {
  const { patientId, recordType, description } = req.body;

  // Check if file is uploaded
>>>>>>> 1984fa28dbeb61e6196f67b473ee616e3cd4a27a
  if (!req.files || !req.files.file) {
    return next(new ErrorHandler("Please upload a file", 400));
  }

  const file = req.files.file;

<<<<<<< HEAD
=======
  // Validate file type (only jpg or pdf)
>>>>>>> 1984fa28dbeb61e6196f67b473ee616e3cd4a27a
  if (!isValidFileType(file.mimetype)) {
    return next(new ErrorHandler("Only JPG and PNF images are allowed", 400));
  }

<<<<<<< HEAD
=======
  // Upload file to cloudinary
>>>>>>> 1984fa28dbeb61e6196f67b473ee616e3cd4a27a
  const result = await cloudinary.uploader.upload(file.tempFilePath, {
    folder: 'health_records',
    resource_type: 'auto'
  });

<<<<<<< HEAD
=======
  // Create health record
>>>>>>> 1984fa28dbeb61e6196f67b473ee616e3cd4a27a
  const healthRecord = await HealthRecord.create({
    patientId,
    recordType,
    description,
    fileUrl: result.secure_url,
    fileName: file.name,
    createdBy: req.user.id
  });

<<<<<<< HEAD
=======
  // Immediately analyze with Gemini
>>>>>>> 1984fa28dbeb61e6196f67b473ee616e3cd4a27a
  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (geminiApiKey) {
      const analysis = await documentAnalysisService.analyzeDocument(
        healthRecord.fileUrl,
        healthRecord.fileName.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
        geminiApiKey
      );
      healthRecord.analysis = { ...analysis, analyzedAt: new Date() };
      await healthRecord.save();
    }
  } catch (err) {
<<<<<<< HEAD
    console.error('Gemini analysis failed:', err);
  }

=======
    // Optionally log error, but don't block upload
    console.error('Gemini analysis failed:', err);
  }

  // Send email notification
>>>>>>> 1984fa28dbeb61e6196f67b473ee616e3cd4a27a
  const user = await User.findById(patientId);
  if (user && user.email) {
    try {
      await sendEmail({
        to: user.email,
        subject: `MediCure: New Health Record Added`,
        text: `A new health record has been added to your profile.`,
        html: `<p>A new health record has been added to your profile.</p>`,
      });
    } catch (error) {
      console.error("Failed to send email notification:", error);
<<<<<<< HEAD
=======
      // Don't fail the request if email fails
>>>>>>> 1984fa28dbeb61e6196f67b473ee616e3cd4a27a
    }
  }

  res.status(201).json({
    success: true,
    healthRecord
  });
});

<<<<<<< HEAD
=======
// Update a health record (for doctor or admin)
>>>>>>> 1984fa28dbeb61e6196f67b473ee616e3cd4a27a
export const updateHealthRecord = catchAsyncErrors(async (req, res, next) => {
  const { recordId } = req.params;
  const { recordType, description } = req.body;

<<<<<<< HEAD
=======
  // Find the health record
>>>>>>> 1984fa28dbeb61e6196f67b473ee616e3cd4a27a
  let healthRecord = await HealthRecord.findById(recordId);

  if (!healthRecord) {
    return next(new ErrorHandler("Health record not found", 404));
  }

<<<<<<< HEAD
=======
  // Update fields
>>>>>>> 1984fa28dbeb61e6196f67b473ee616e3cd4a27a
  const updateData = {
    recordType: recordType || healthRecord.recordType,
    description: description || healthRecord.description
  };

<<<<<<< HEAD
  if (req.files && req.files.file) {
    const file = req.files.file;

=======
  // If file is uploaded, update file
  if (req.files && req.files.file) {
    const file = req.files.file;

    // Validate file type
>>>>>>> 1984fa28dbeb61e6196f67b473ee616e3cd4a27a
    if (!isValidFileType(file.mimetype)) {
      return next(new ErrorHandler("Only JPG and PNG images are allowed", 400));
    }

<<<<<<< HEAD
=======
    // Delete old file from cloudinary
>>>>>>> 1984fa28dbeb61e6196f67b473ee616e3cd4a27a
    if (healthRecord.fileUrl) {
      const publicId = healthRecord.fileUrl.split('/').pop().split('.')[0];
      try {
        await cloudinary.uploader.destroy(`health_records/${publicId}`);
      } catch (error) {
        console.error("Failed to delete old file from cloudinary:", error);
<<<<<<< HEAD
      }
    }

=======
        // Continue with the update even if deletion fails
      }
    }

    // Upload new file
>>>>>>> 1984fa28dbeb61e6196f67b473ee616e3cd4a27a
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: 'health_records',
      resource_type: 'auto'
    });

    updateData.fileUrl = result.secure_url;
    updateData.fileName = file.name;
  }

<<<<<<< HEAD
=======
  // Update health record
>>>>>>> 1984fa28dbeb61e6196f67b473ee616e3cd4a27a
  healthRecord = await HealthRecord.findByIdAndUpdate(
    recordId,
    updateData,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    healthRecord
  });
});

<<<<<<< HEAD
=======
// Delete a health record (for doctor or admin)
>>>>>>> 1984fa28dbeb61e6196f67b473ee616e3cd4a27a
export const deleteHealthRecord = async (req, res) => {
  try {
    const { recordId } = req.params;

<<<<<<< HEAD
=======
    // Find the health record
>>>>>>> 1984fa28dbeb61e6196f67b473ee616e3cd4a27a
    const healthRecord = await HealthRecord.findById(recordId);

    if (!healthRecord) {
      return res.status(404).json({
        success: false,
        message: 'Health record not found'
      });
    }

<<<<<<< HEAD
=======
    // Delete file from cloudinary
>>>>>>> 1984fa28dbeb61e6196f67b473ee616e3cd4a27a
    if (healthRecord.fileUrl) {
      const publicId = healthRecord.fileUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`health_records/${publicId}`);
    }

    // Delete health record
    await HealthRecord.findByIdAndDelete(recordId);

    res.status(200).json({
      success: true,
      message: 'Health record deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all health records of a patient (for doctor or admin)
export const getPatientHealthRecords = async (req, res) => {
  try {
    const { patientId } = req.params;

    const healthRecords = await HealthRecord.find({ patientId })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name role');

    res.status(200).json({
      success: true,
      count: healthRecords.length,
      healthRecords
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get my health records (for patients)
export const getMyHealthRecords = async (req, res) => {
  try {
    const patientId = req.user.id; // From authentication middleware

    const healthRecords = await HealthRecord.find({ patientId })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name role');

    res.status(200).json({
      success: true,
      count: healthRecords.length,
      healthRecords
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get a specific health record by ID
export const getHealthRecordById = async (req, res) => {
  try {
    const { recordId } = req.params;
    
    const healthRecord = await HealthRecord.findById(recordId)
      .populate('createdBy', 'name role')
      .populate('patientId', 'name');
      
    if (!healthRecord) {
      return res.status(404).json({
        success: false,
        message: 'Health record not found'
      });
    }
    
    // If user is a patient, ensure they can only access their own records
    if (req.user.role === 'patient' && healthRecord.patientId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this record'
      });
    }
    
    res.status(200).json({
      success: true,
      healthRecord
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const downloadHealthRecord = catchAsyncErrors(async (req, res, next) => {
  const { recordId } = req.params;

  // Find the health record
  const healthRecord = await HealthRecord.findById(recordId);
  if (!healthRecord) {
    return next(new ErrorHandler("Health record not found", 404));
  }

  // Check if user is authorized to download
  if (req.user.role === "Patient" && healthRecord.patientId.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("You are not authorized to download this record", 403));
  }

  // Get the file from Cloudinary
  const fileUrl = healthRecord.fileUrl;

  // Set headers for file download
  res.setHeader('Content-Disposition', `attachment; filename="${healthRecord.fileName}"`);
  res.setHeader('Content-Type', 'application/octet-stream');

  // Stream the file from Cloudinary to the client
  https.get(fileUrl, (fileRes) => {
    fileRes.pipe(res);
  }).on('error', (err) => {
    return next(new ErrorHandler("Failed to download file", 500));
  });
});

export const summarizeHealthRecord = async (req, res, next) => {
  try {
    const { imageUrl } = req.body;

    // Convert the image to base64
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString("base64");

    console.log("Gemini API Key:", process.env.GEMINI_API_KEY);

    // Call Gemini API
const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: "Summarize this medical report image in simple patient-friendly language." },
              { inline_data: { mime_type: "image/jpeg", data: base64Image } }
            ]
          }
        ]
      })
    });

    const data = await geminiResponse.json();

    console.log("Gemini API response:", JSON.stringify(data, null, 2));

    const summary = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Summary not available.";

    res.status(200).json({ summary });
  } catch (error) {
    next(error);
  }
};

export const askHealthRecordAI = async (req, res, next) => {
  try {
    const { imageUrl, question } = req.body;

    // Convert the image to base64
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString("base64");

    // Use the user's question, or default to a summary prompt
    const prompt = question || "Summarize this medical report image in simple patient-friendly language.";

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                { inline_data: { mime_type: "image/jpeg", data: base64Image } }
              ]
            }
          ]
        })
      }
    );

    const data = await geminiResponse.json();
    console.log("Gemini API response:", JSON.stringify(data, null, 2));
    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No answer available.";

    res.status(200).json({ answer });
  } catch (error) {
    next(error);
  }
};