import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient ID is required']
    },
    medicationName: {
      type: String,
      required: [true, 'Medication name is required']
    },
    dosage: {
      type: String,
      required: [true, 'Dosage is required']
    },
    frequency: {
      type: String,
      required: [true, 'Frequency is required']
    },
    instructions: {
      type: String,
      required: [true, 'Instructions are required']
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    prescribedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Prescriber ID is required']
    },
    notes: {
      type: String,
      default: ''
    },
    // active: {
    //   type: Boolean,
    //   default: true
    // }
  },
  { timestamps: true }
);

export const Prescription = mongoose.model('Prescription', prescriptionSchema);