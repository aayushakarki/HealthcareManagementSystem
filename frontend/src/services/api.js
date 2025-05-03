// services/api.js
import axios from "axios"

const API_URL = "http://localhost:4000/api/v1"

// Configure axios with credentials
axios.defaults.withCredentials = true

// Appointments
export const getPatientAppointments = async () => {
  return axios.get(`${API_URL}/appointment/patient`)
}

// Health Records
export const getPatientHealthRecords = async () => {
  return axios.get(`${API_URL}/health-records/me`)
}

export const getHealthRecord = async (id) => {
  return axios.get(`${API_URL}/health-records/${id}`)
}

// Vitals
export const getVitalsHistory = async () => {
  return axios.get(`${API_URL}/vitals/history`)
}

export const addVitals = async (vitalsData) => {
  return axios.post(`${API_URL}/vitals/add`, vitalsData)
}

// Notifications
export const getUserNotifications = async () => {
  return axios.get(`${API_URL}/notifications/user`)
}

export const markNotificationAsRead = async (id) => {
  return axios.put(`${API_URL}/notifications/read/${id}`)
}

export const markAllNotificationsAsRead = async () => {
  return axios.put(`${API_URL}/notifications/read-all`)
}