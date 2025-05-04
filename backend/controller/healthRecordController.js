import { HealthRecord } from '../models/healthRecordSchema.js';
import { v2 as cloudinary } from 'cloudinary';

// Helper function to validate file type
const isValidFileType = (mimetype) => {
  return mimetype === 'image/jpeg' || mimetype === 'application/pdf';
};

// Upload a health record (for doctor or admin)
export const uploadHealthRecord = async (req, res) => {
  try {
    const { patientId, recordType, description } = req.body;

    // Check if file is uploaded
    if (!req.files || !req.files.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const file = req.files.file;

    // Validate file type (only jpg or pdf)
    if (!isValidFileType(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Only JPG and PDF files are allowed'
      });
    }

    // Upload file to cloudinary
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: 'health_records',
      resource_type: 'auto'
    });

    // Create health record
    const healthRecord = await HealthRecord.create({
      patientId,
      recordType,
      description,
      fileUrl: result.secure_url,
      fileName: file.name,
      createdBy: req.user.id // From authentication middleware
    });

    res.status(201).json({
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

// Update a health record (for doctor or admin)
export const updateHealthRecord = async (req, res) => {
  try {
    const { recordId } = req.params;
    const { recordType, description } = req.body;

    // Find the health record
    let healthRecord = await HealthRecord.findById(recordId);

    if (!healthRecord) {
      return res.status(404).json({
        success: false,
        message: 'Health record not found'
      });
    }

    // Update fields
    const updateData = {
      recordType: recordType || healthRecord.recordType,
      description: description || healthRecord.description
    };

    // If file is uploaded, update file
    if (req.files && req.files.file) {
      const file = req.files.file;

      // Validate file type
      if (!isValidFileType(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: 'Only JPG and PDF files are allowed'
        });
      }

      // Delete old file from cloudinary
      if (healthRecord.fileUrl) {
        const publicId = healthRecord.fileUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`health_records/${publicId}`);
      }

      // Upload new file
      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: 'health_records',
        resource_type: 'auto'
      });

      updateData.fileUrl = result.secure_url;
      updateData.fileName = file.name;
    }

    // Update health record
    healthRecord = await HealthRecord.findByIdAndUpdate(
      recordId,
      updateData,
      { new: true, runValidators: true }
    );

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

// Delete a health record (for doctor or admin)
export const deleteHealthRecord = async (req, res) => {
  try {
    const { recordId } = req.params;

    // Find the health record
    const healthRecord = await HealthRecord.findById(recordId);

    if (!healthRecord) {
      return res.status(404).json({
        success: false,
        message: 'Health record not found'
      });
    }

    // Delete file from cloudinary
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