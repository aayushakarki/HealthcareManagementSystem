import cron from "node-cron"
import nodemailer from "nodemailer"
import Appointment from "./models/appointmentSchema.js"
import User from "./models/userSchema.js"
import HealthRecord from "./models/healthRecordSchema.js"

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // or any other email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

// Helper function to send email
const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"Healthcare App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    })
    console.log(`Email sent to ${to}`)
    return true
  } catch (error) {
    console.error("Error sending email:", error)
    return false
  }
}

// Notification for appointment status updates
export const notifyAppointmentStatusChange = async (appointmentId) => {
  try {
    const appointment = await Appointment.findById(appointmentId)
      .populate("patient", "email name")
      .populate("doctor", "name")

    if (!appointment) return

    const { patient, doctor, status, date, time } = appointment

    const subject = `Appointment Status Updated: ${status}`
    const html = `
      <h1>Appointment Status Update</h1>
      <p>Dear ${patient.name},</p>
      <p>Your appointment with Dr. ${doctor.name} scheduled for ${new Date(date).toLocaleDateString()} at ${time} has been updated to <strong>${status}</strong>.</p>
      <p>Please log in to your dashboard for more details.</p>
      <p>Thank you for using our healthcare services.</p>
    `

    await sendEmail(patient.email, subject, html)
  } catch (error) {
    console.error("Error in appointment status notification:", error)
  }
}

// Notification for new health records
export const notifyHealthRecordUploaded = async (recordId) => {
  try {
    const record = await HealthRecord.findById(recordId).populate("patient", "email name").populate("doctor", "name")

    if (!record) return

    const { patient, doctor, recordType } = record

    const subject = `New Health Record Uploaded`
    const html = `
      <h1>New Health Record Available</h1>
      <p>Dear ${patient.name},</p>
      <p>Dr. ${doctor.name} has uploaded a new ${recordType} to your health records.</p>
      <p>Please log in to your dashboard to view this record.</p>
      <p>Thank you for using our healthcare services.</p>
    `

    await sendEmail(patient.email, subject, html)
  } catch (error) {
    console.error("Error in health record notification:", error)
  }
}

// Schedule weekly appointment reminders (runs every Monday at 9 AM)
cron.schedule("0 9 * * 1", async () => {
  console.log("Running weekly appointment reminders")

  try {
    // Find appointments in the next 7 days
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 7)

    const upcomingAppointments = await Appointment.find({
      date: { $gte: startDate, $lte: endDate },
      status: "confirmed",
    })
      .populate("patient", "email name")
      .populate("doctor", "name")

    for (const appointment of upcomingAppointments) {
      const { patient, doctor, date, time } = appointment

      const subject = "Upcoming Appointment Reminder"
      const html = `
        <h1>Weekly Appointment Reminder</h1>
        <p>Dear ${patient.name},</p>
        <p>This is a reminder that you have an appointment with Dr. ${doctor.name} scheduled for ${new Date(date).toLocaleDateString()} at ${time}.</p>
        <p>Please log in to your dashboard for more details or to reschedule if needed.</p>
        <p>Thank you for using our healthcare services.</p>
      `

      await sendEmail(patient.email, subject, html)
    }
  } catch (error) {
    console.error("Error in weekly appointment reminders:", error)
  }
})

// Schedule day-of appointment reminders (runs every day at 7 AM)
cron.schedule("0 7 * * *", async () => {
  console.log("Running day-of appointment reminders")

  try {
    // Get today's date
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todaysAppointments = await Appointment.find({
      date: { $gte: today, $lt: tomorrow },
      status: "confirmed",
    })
      .populate("patient", "email name")
      .populate("doctor", "name")

    for (const appointment of todaysAppointments) {
      const { patient, doctor, date, time } = appointment

      const subject = "Appointment Today"
      const html = `
        <h1>Appointment Reminder</h1>
        <p>Dear ${patient.name},</p>
        <p>This is a reminder that you have an appointment with Dr. ${doctor.name} <strong>today</strong> at ${time}.</p>
        <p>Please arrive 15 minutes before your scheduled time.</p>
        <p>Thank you for using our healthcare services.</p>
      `

      await sendEmail(patient.email, subject, html)
    }
  } catch (error) {
    console.error("Error in day-of appointment reminders:", error)
  }
})

// Schedule medication reminders (runs daily at 8 AM)
cron.schedule("0 8 * * *", async () => {
  console.log("Running medication reminders")

  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Find active prescriptions
    const patients = await User.find({
      role: "patient",
      "prescriptions.startDate": { $lte: today },
      "prescriptions.endDate": { $gte: today },
    })

    for (const patient of patients) {
      const activeMedications = patient.prescriptions.filter((prescription) => {
        const startDate = new Date(prescription.startDate)
        const endDate = new Date(prescription.endDate)
        return startDate <= today && endDate >= today
      })

      if (activeMedications.length > 0) {
        const subject = "Medication Reminder"
        let medicationList = ""

        activeMedications.forEach((med) => {
          medicationList += `<li><strong>${med.medication}</strong>: ${med.dosage} - ${med.instructions}</li>`
        })

        const html = `
          <h1>Daily Medication Reminder</h1>
          <p>Dear ${patient.name},</p>
          <p>This is a reminder to take your prescribed medications today:</p>
          <ul>${medicationList}</ul>
          <p>Please follow your doctor's instructions carefully.</p>
          <p>Thank you for using our healthcare services.</p>
        `

        await sendEmail(patient.email, subject, html)
      }
    }
  } catch (error) {
    console.error("Error in medication reminders:", error)
  }
})

// Initialize notification service
export const initNotificationService = () => {
  console.log("Notification service initialized")
  // You can add any initialization logic here
}
