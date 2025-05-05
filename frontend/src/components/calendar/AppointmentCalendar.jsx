"use client"

import { useState, useEffect } from "react"
import Calendar from "react-calendar"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import axios from "axios"
import "react-calendar/dist/Calendar.css"
import "./calendar-styles.css" // We'll create this for custom styling

const AppointmentCalendar = ({ appointments, onDateClick, userRole }) => {
  const [value, setValue] = useState(new Date())
  const [nepaliDate, setNepaliDate] = useState(null)

  // Function to check if a date has appointments
  const hasAppointmentOnDay = (date) => {
    return appointments.some((appointment) => {
      const appointmentDate = new Date(appointment.appointment_date || appointment.date)
      return (
        appointmentDate.getDate() === date.getDate() &&
        appointmentDate.getMonth() === date.getMonth() &&
        appointmentDate.getFullYear() === date.getFullYear()
      )
    })
  }

  // Function to fetch Nepali date (optional)
  const fetchNepaliDate = async () => {
    try {
      const options = {
        method: "GET",
        url: "https://nepali-calendar.p.rapidapi.com/nepali-calendar/",
        headers: {
          "x-rapidapi-host": "nepali-calendar.p.rapidapi.com",
          // You would need to add your API key here
          "x-rapidapi-key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY || "",
        },
      }

      const response = await axios.request(options)
      if (response.data) {
        setNepaliDate(response.data.date) // Adjust based on actual API response structure
      }
    } catch (error) {
      console.error("Error fetching Nepali date:", error)
    }
  }

  useEffect(() => {
    // Fetch Nepali date when component mounts
    fetchNepaliDate()
  }, [])

  // Custom navigation for the calendar
  const CustomNavigation = ({ label, onPrevClick, onNextClick }) => (
    <div className="month-selector">
      <h3>{label}</h3>
      <div className="month-navigation">
        <button className="month-nav-btn" onClick={onPrevClick}>
          <ChevronLeft className="w-4 h-4 transform rotate-180" />
        </button>
        <button className="month-nav-btn" onClick={onNextClick}>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )

  // Custom tile content to show appointment indicators
  const tileContent = ({ date, view }) => {
    if (view === "month" && hasAppointmentOnDay(date)) {
      return <div className="appointment-indicator"></div>
    }
    return null
  }

  // Custom tile class to highlight today and appointments
  const tileClassName = ({ date, view }) => {
    if (view !== "month") return ""

    const isToday =
      date.getDate() === new Date().getDate() &&
      date.getMonth() === new Date().getMonth() &&
      date.getFullYear() === new Date().getFullYear()

    const hasAppointment = hasAppointmentOnDay(date)

    if (isToday) return "selected"
    if (hasAppointment) return "has-appointment"
    return ""
  }

  const handleDateClick = (date) => {
    // Don't update the value (which would change the highlight)
    // Just call the onDateClick function
    onDateClick(date)
  }

  return (
    <div className="calendar-container">
      {nepaliDate && <div className="nepali-date-display">Nepali Date: {nepaliDate}</div>}
      <Calendar
        value={value}
        onClickDay={handleDateClick}
        tileContent={tileContent}
        tileClassName={tileClassName}
        navigationLabel={({ date }) => `${date.toLocaleString("default", { month: "long" })} ${date.getFullYear()}`}
        prevLabel={<ChevronLeft className="w-4 h-4 transform rotate-180" />}
        nextLabel={<ChevronRight className="w-4 h-4" />}
        next2Label={null}
        prev2Label={null}
        showNeighboringMonth={false}
        formatShortWeekday={(locale, date) => ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][date.getDay()]}
      />
    </div>
  )
}

export default AppointmentCalendar
