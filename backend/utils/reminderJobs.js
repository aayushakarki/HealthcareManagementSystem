import cron from "node-cron";
import { Prescription } from "../models/prescriptionSchema.js";
import { Appointment } from "../models/appointmentSchema.js";
import { User } from "../models/userSchema.js";
import { sendEmail } from "./sendEmail.js";
import { Notification } from "../models/notificationSchema.js";

// This job runs every day at 9am server time
cron.schedule("0 9 * * *", async () => {
  console.log("Running daily prescription reminder job...");

  const today = new Date();
  const soon = new Date();
  soon.setDate(today.getDate() + 2); // Remind 2 days before end

  // Find prescriptions ending in the next 2 days
  const prescriptions = await Prescription.find({
    endDate: { $gte: today, $lte: soon }
  }).populate("patientId");

  for (const pres of prescriptions) {
    if (pres.patientId && pres.patientId.email) {
      // Create an in-app notification
      await Notification.create({
        userId: pres.patientId._id,
        message: `Your prescription for ${pres.medicationName} is ending soon.`,
        type: "Prescription",
        relatedId: pres._id,
        onModel: "Prescription",
      });

      // Send an email notification
      await sendEmail({
        to: pres.patientId.email,
        subject: "MediCure: Prescription Ending Soon",
        text: `Your prescription for ${pres.medicationName} is ending soon.`,
        html: `<p>Your prescription for <b>${pres.medicationName}</b> is ending soon.</p>`,
      });
    }
  }
});

// Weekly appointment reminders (every Monday at 8am)
cron.schedule("0 8 * * 1", async () => {
  const today = new Date();
  today.setHours(0,0,0,0);
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  const appointments = await Appointment.find({
    appointment_date: { $gte: today, $lt: nextWeek }
  }).populate("patientId");

  for (const app of appointments) {
    if (app.patientId && app.patientId.email) {
      await Notification.create({
        userId: app.patientId._id,
        message: `You have an appointment scheduled for ${app.appointment_date}`,
        type: "Appointment",
        relatedId: app._id,
        onModel: "Appointment",
      });
      await sendEmail({
        to: app.patientId.email,
        subject: "MediCure: Upcoming Appointment Reminder",
        text: `You have an appointment scheduled for ${app.appointment_date}`,
        html: `<p>You have an appointment scheduled for <b>${app.appointment_date}</b></p>`,
      });
    }
  }
});

// Same-day appointment reminders (every hour, for appointments in next 2 hours)
cron.schedule("0 * * * *", async () => {
  const now = new Date();
  const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  const appointments = await Appointment.find({
    appointment_date: { $gte: now, $lt: twoHoursLater }
  }).populate("patientId");

  for (const app of appointments) {
    if (app.patientId && app.patientId.email) {
      await Notification.create({
        userId: app.patientId._id,
        message: `You have an appointment today at ${app.appointment_date}`,
        type: "Appointment",
        relatedId: app._id,
        onModel: "Appointment",
      });
      await sendEmail({
        to: app.patientId.email,
        subject: "MediCure: Appointment Reminder",
        text: `You have an appointment today at ${app.appointment_date}`,
        html: `<p>You have an appointment today at <b>${app.appointment_date}</b></p>`,
      });
    }
  }
});
