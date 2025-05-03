import mongoose from 'mongoose';

const healthRecordSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient ID is required']
    },
    recordType: {
      type: String,
      enum: ['Lab Result', 'Prescription', 'Imaging', 'Diagnosis', 'Other'],
      required: [true, 'Record type is required']
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required']
    },
    fileName: {
      type: String,
      required: [true, 'File name is required']
    },
    description: {
      type: String,
      required: [true, 'Description is required']
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator ID is required']
    }
  },
  { timestamps: true }
);

export const HealthRecord = mongoose.model('HealthRecord', healthRecordSchema);