import { Prescription } from "../models/prescriptionSchema.js"
import { User } from "../models/userSchema.js"
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js"
import ErrorHandler from "../middlewares/errorMiddleware.js"
import { Notification } from "../models/notificationSchema.js"
import PDFDocument from 'pdfkit'
import axios from 'axios'
import { sendEmail } from "../utils/sendEmail.js"

// Add a new prescription (for doctor)
export const addPrescription = catchAsyncErrors(async (req, res, next) => {
  try {
    const { patientId, medicationName, dosage, frequency, instructions, startDate, endDate, notes } = req.body

    // Validate required fields
    if (!patientId || !medicationName || !dosage || !frequency || !instructions || !startDate || !endDate) {
      return next(new ErrorHandler("Please provide all required fields", 400))
    }

    // Verify patient exists
    const patientExists = await User.findOne({ _id: patientId, role: "Patient" })
    if (!patientExists) {
      return next(new ErrorHandler("Patient not found", 404))
    }

    // Create prescription
    const prescription = await Prescription.create({
      patientId,
      medicationName,
      dosage,
      frequency,
      instructions,
      startDate,
      endDate,
      notes: notes || "",
      prescribedBy: req.user.id, // From authentication middleware
    })

    // Create notification for the patient
    await Notification.create({
      userId: patientId,
      message: `New prescription for ${medicationName} has been added by Dr. ${req.user.firstName} ${req.user.lastName}`,
      type: "Prescription",
      relatedId: prescription._id,
      onModel: "Prescription",
    })

    // Send email to patient
    const patient = await User.findById(patientId);
    if (patient && patient.email) {
      await sendEmail({
        to: patient.email,
        subject: `MediCure: New Prescription Added`,
        text: `A new prescription for ${medicationName} has been added to your profile by Dr. ${req.user.firstName} ${req.user.lastName}.`,
        html: `<p>A new prescription for <b>${medicationName}</b> has been added to your profile by Dr. ${req.user.firstName} ${req.user.lastName}.</p>`,
      });
    }

    res.status(201).json({
      success: true,
      prescription,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// Update a prescription (for doctor)
export const updatePrescription = catchAsyncErrors(async (req, res, next) => {
  try {
    const { prescriptionId } = req.params
    const { medicationName, dosage, frequency, instructions, startDate, endDate, notes, active } = req.body

    // Find the prescription
    let prescription = await Prescription.findById(prescriptionId)

    if (!prescription) {
      return next(new ErrorHandler("Prescription not found", 404))
    }

    // Check if the doctor is the one who prescribed it
    if (prescription.prescribedBy.toString() !== req.user.id && req.user.role !== "Admin") {
      return next(new ErrorHandler("You are not authorized to update this prescription", 403))
    }

    // Update fields
    const updateData = {
      medicationName: medicationName || prescription.medicationName,
      dosage: dosage || prescription.dosage,
      frequency: frequency || prescription.frequency,
      instructions: instructions || prescription.instructions,
      startDate: startDate || prescription.startDate,
      endDate: endDate || prescription.endDate,
      notes: notes !== undefined ? notes : prescription.notes,
      active: active !== undefined ? active : prescription.active,
    }

    // Update prescription
    prescription = await Prescription.findByIdAndUpdate(prescriptionId, updateData, { new: true, runValidators: true })

    // Create notification for the patient if there's a significant change
    if (medicationName || dosage || frequency || instructions) {
      await Notification.create({
        userId: prescription.patientId,
        message: `Your prescription for ${prescription.medicationName} has been updated`,
        type: "Prescription",
        relatedId: prescription._id,
        onModel: "Prescription",
      })
    }

    res.status(200).json({
      success: true,
      prescription,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// Delete a prescription (for patient only, and only when not active)
export const deletePrescription = catchAsyncErrors(async (req, res, next) => {
  try {
    const { prescriptionId } = req.params

    // Find the prescription
    const prescription = await Prescription.findById(prescriptionId)

    if (!prescription) {
      return next(new ErrorHandler("Prescription not found", 404))
    }

    // Check if the user is the patient
    if (prescription.patientId.toString() !== req.user.id) {
      return next(new ErrorHandler("Only patients can delete their own prescriptions", 403))
    }

    // Check if the end date has passed
    const currentDate = new Date()
    if (new Date(prescription.endDate) > currentDate) {
      return next(new ErrorHandler("Prescriptions can only be deleted after they have expired", 400))
    }

    // Delete prescription
    await Prescription.findByIdAndDelete(prescriptionId)

    res.status(200).json({
      success: true,
      message: "Prescription deleted successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// Get all prescriptions of a patient (for doctor or admin)
export const getPatientPrescriptions = catchAsyncErrors(async (req, res, next) => {
  try {
    const { patientId } = req.params

    // Verify patient exists
    const patientExists = await User.findOne({ _id: patientId, role: "Patient" })
    if (!patientExists) {
      return next(new ErrorHandler("Patient not found", 404))
    }

    const prescriptions = await Prescription.find({ patientId })
      .sort({ createdAt: -1 })
      .populate("prescribedBy", "firstName lastName role")

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      prescriptions,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// Get my prescriptions (for patients)
export const getMyPrescriptions = catchAsyncErrors(async (req, res, next) => {
  try {
    const patientId = req.user.id // From authentication middleware

    const prescriptions = await Prescription.find({ patientId })
      .sort({ createdAt: -1 })
      .populate("prescribedBy", "firstName lastName role")

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      prescriptions,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// Get a specific prescription by ID
export const getPrescriptionById = catchAsyncErrors(async (req, res, next) => {
  try {
    const { prescriptionId } = req.params

    const prescription = await Prescription.findById(prescriptionId)
      .populate("prescribedBy", "firstName lastName role")
      .populate("patientId", "firstName lastName")

    if (!prescription) {
      return next(new ErrorHandler("Prescription not found", 404))
    }

    // If user is a patient, ensure they can only access their own prescriptions
    if (req.user.role === "Patient" && prescription.patientId._id.toString() !== req.user.id) {
      return next(new ErrorHandler("You are not authorized to access this prescription", 403))
    }

    res.status(200).json({
      success: true,
      prescription,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// Get all prescriptions (for admin only)
export const getAllPrescriptions = catchAsyncErrors(async (req, res, next) => {
  try {
    // Only admins should access this endpoint
    if (req.user.role !== "Admin") {
      return next(new ErrorHandler("Not authorized to access this resource", 403))
    }

    const prescriptions = await Prescription.find()
      .sort({ createdAt: -1 })
      .populate("prescribedBy", "firstName lastName role")
      .populate("patientId", "firstName lastName")

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      prescriptions,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// Get active prescriptions for a patient
export const getActivePrescriptions = catchAsyncErrors(async (req, res, next) => {
  try {
    const patientId = req.params.patientId || req.user.id

    // If accessing another patient's prescriptions, check authorization
    if (req.params.patientId && req.user.role === "Patient" && req.params.patientId !== req.user.id) {
      return next(new ErrorHandler("Not authorized to access this resource", 403))
    }

    const currentDate = new Date()

    const prescriptions = await Prescription.find({
      patientId,
      endDate: { $gte: currentDate },
    })
      .sort({ createdAt: -1 })
      .populate("prescribedBy", "firstName lastName role")

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      prescriptions,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// Generate and serve prescription PDF
export const generatePrescriptionPDF = catchAsyncErrors(async (req, res, next) => {
  try {
    const patientId = req.user._id;
    
    // Get all prescriptions for the patient
    const prescriptions = await Prescription.find({ patientId })
      .populate('prescribedBy', 'firstName lastName signature')
      .sort({ createdAt: -1 });

    // ----> ERROR CHECKS BEFORE PDF STREAM <----
    if (!prescriptions || prescriptions.length === 0) {
      return next(new ErrorHandler("No prescriptions found", 404));
    }

    // ----> ONLY NOW START THE PDF STREAM <----
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=MediCure-Prescriptions.pdf');
    doc.pipe(res);

    // Add MediCure header
    doc.fontSize(24)
      .font('Helvetica-Bold')
      .text('MediCure', 50, 50, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12)
      .font('Helvetica')
      .text('Your Prescriptions', { align: 'center' });
    doc.moveDown(2);

    // Table setup
    const tableTop = 130;
    const itemHeight = 25;
    const colWidths = [100, 60, 70, 120, 70, 70];
    const columns = [
      { label: 'Medication', width: colWidths[0] },
      { label: 'Dosage', width: colWidths[1] },
      { label: 'Frequency', width: colWidths[2] },
      { label: 'Instructions', width: colWidths[3] },
      { label: 'Start Date', width: colWidths[4] },
      { label: 'End Date', width: colWidths[5] }
    ];

    // Draw table header
    let x = 50;
    columns.forEach(col => {
      doc.font('Helvetica-Bold').fontSize(12).text(col.label, x, tableTop, { width: col.width, align: 'left' });
      x += col.width;
    });

    // Draw rows
    let y = tableTop + 20;
    for (const prescription of prescriptions) {
      let x = 50;
      doc.font('Helvetica').fontSize(10)
        .text(prescription.medicationName, x, y, { width: colWidths[0] });
      x += colWidths[0];
      doc.text(prescription.dosage, x, y, { width: colWidths[1] });
      x += colWidths[1];
      doc.text(prescription.frequency, x, y, { width: colWidths[2] });
      x += colWidths[2];
      doc.text(prescription.instructions, x, y, { width: colWidths[3] });
      x += colWidths[3];
      doc.text(new Date(prescription.startDate).toLocaleDateString(), x, y, { width: colWidths[4] });
      x += colWidths[4];
      doc.text(new Date(prescription.endDate).toLocaleDateString(), x, y, { width: colWidths[5] });
      y += itemHeight;
    }

    // Add signature and generation date at the bottom
    let signatureAdded = false;
    let signatureY = y + 40;
    for (const prescription of prescriptions) {
      if (
        prescription.prescribedBy &&
        prescription.prescribedBy.signature &&
        prescription.prescribedBy.signature.url &&
        !signatureAdded
      ) {
        doc.fontSize(12)
          .text(`Prescribed by: Dr. ${prescription.prescribedBy.firstName} ${prescription.prescribedBy.lastName}`, 50, signatureY);
        try {
          const response = await axios.get(prescription.prescribedBy.signature.url, { responseType: 'arraybuffer' });
          const imgBuffer = Buffer.from(response.data, 'base64');
          doc.image(imgBuffer, 50, signatureY + 20, {
            fit: [150, 50],
            align: 'left'
          });
        } catch (err) {
          doc.text('(Signature image unavailable)', 50, signatureY + 20);
          console.error('Failed to load signature image:', err.message);
        }
        signatureAdded = true;
        break;
      }
    }
    // Generation date
    doc.fontSize(10)
      .text(`Generated on: ${new Date().toLocaleString()}`, 50, signatureY + 80);

    doc.end();
  } catch (error) {
    if (res.headersSent) {
      console.error('PDF generation error after headers sent:', error);
    } else {
      return next(new ErrorHandler(error.message, 500));
    }
  }
});
