import { useState } from "react"
import { ChevronUp } from "lucide-react"

// Framingham risk calculation logic (for both genders)
function getAgePoints(age, gender) {
  if (gender === "male") {
    if (age >= 20 && age <= 34) return -9;
    if (age <= 39) return -4;
    if (age <= 44) return 0;
    if (age <= 49) return 3;
    if (age <= 54) return 6;
    if (age <= 59) return 8;
    if (age <= 64) return 10;
    if (age <= 69) return 11;
    if (age <= 74) return 12;
    if (age <= 79) return 13;
  } else {
    if (age >= 20 && age <= 34) return -7;
    if (age <= 39) return -3;
    if (age <= 44) return 0;
    if (age <= 49) return 3;
    if (age <= 54) return 6;
    if (age <= 59) return 8;
    if (age <= 64) return 10;
    if (age <= 69) return 12;
    if (age <= 74) return 14;
    if (age <= 79) return 16;
  }
  return 0;
}
function getBPPoints(systolic, onMeds, gender) {
  if (gender === "male") {
    if (!onMeds) {
      if (systolic < 120) return 0;
      if (systolic <= 129) return 1;
      if (systolic <= 139) return 2;
      if (systolic <= 159) return 2;
      return 3;
    } else {
      if (systolic < 120) return 0;
      if (systolic <= 129) return 3;
      if (systolic <= 139) return 4;
      if (systolic <= 159) return 5;
      return 6;
    }
  } else {
    if (!onMeds) {
      if (systolic < 120) return 0;
      if (systolic <= 129) return 1;
      if (systolic <= 139) return 2;
      if (systolic <= 159) return 3;
      return 4;
    } else {
      if (systolic < 120) return 0;
      if (systolic <= 129) return 3;
      if (systolic <= 139) return 4;
      if (systolic <= 159) return 5;
      return 6;
    }
  }
}
function getCholPoints(chol, gender) {
  // For simplicity, not used in this version (can be extended)
  return 0;
}
function getHDLPoints(hdl, gender) {
  // For simplicity, not used in this version (can be extended)
  return 0;
}
function getSmokingPoints(smoker, age, gender) {
  if (!smoker) return 0;
  if (gender === "male") {
    if (age >= 20 && age <= 39) return 8;
    if (age <= 49) return 5;
    if (age <= 59) return 3;
    if (age <= 69) return 1;
    if (age <= 79) return 1;
  } else {
    if (age >= 20 && age <= 39) return 9;
    if (age <= 49) return 7;
    if (age <= 59) return 4;
    if (age <= 69) return 2;
    if (age <= 79) return 1;
  }
  return 0;
}
function getDiabetesPoints(diabetic, gender) {
  if (!diabetic) return 0;
  return gender === "male" ? 3 : 4;
}
function getRiskFromPoints(points, gender) {
  if (gender === "male") {
    if (points < 0) return "<1%";
    if (points === 0) return "1%";
    if (points === 1) return "1%";
    if (points === 2) return "1%";
    if (points === 3) return "1%";
    if (points === 4) return "1%";
    if (points === 5) return "2%";
    if (points === 6) return "2%";
    if (points === 7) return "3%";
    if (points === 8) return "4%";
    if (points === 9) return "5%";
    if (points === 10) return "6%";
    if (points === 11) return "8%";
    if (points === 12) return "10%";
    if (points === 13) return "12%";
    if (points === 14) return "16%";
    if (points === 15) return "20%";
    if (points === 16) return "25%";
    return "30%+";
  } else {
    if (points < 9) return "<1%";
    if (points === 9) return "1%";
    if (points === 10) return "1%";
    if (points === 11) return "1%";
    if (points === 12) return "1%";
    if (points === 13) return "2%";
    if (points === 14) return "2%";
    if (points === 15) return "3%";
    if (points === 16) return "4%";
    if (points === 17) return "5%";
    if (points === 18) return "6%";
    if (points === 19) return "8%";
    if (points === 20) return "11%";
    if (points === 21) return "14%";
    if (points === 22) return "17%";
    if (points === 23) return "22%";
    if (points === 24) return "27%";
    return "30%+";
  }
}

const FraminghamCalculation = ({ user, latestVitals, onClose }) => {
  const [form, setForm] = useState({
    smoker: false,
    diabetic: false,
    onMeds: false,
  })
  const [result, setResult] = useState(null)

  // Get age, gender, systolic, cholesterol, hdl from props
  const age = user?.age || 40
  const gender = (user?.gender || "male").toLowerCase()
  const systolic = latestVitals?.bloodPressure?.systolic || 120
  const cholesterol = latestVitals?.cholesterol || 200
  const hdlCholesterol = latestVitals?.hdlCholesterol || 50

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    let points = 0
    points += getAgePoints(age, gender)
    points += getBPPoints(systolic, form.onMeds, gender)
    points += getSmokingPoints(form.smoker, age, gender)
    points += getDiabetesPoints(form.diabetic, gender)
    // Optionally add cholesterol/hdl points if you want to extend
    const risk = getRiskFromPoints(points, gender)
    setResult({ points, risk })
  }

  return (
    <div className="framingham-modal-content">
      <div className="framingham-header">
        <h2>Framingham Risk Score Calculator</h2>
        <p className="framingham-subtitle">
          This calculator estimates your 10-year risk of developing cardiovascular disease based on your clinical data.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="framingham-form">
        <div className="framingham-fields-grid">
          <div className="framingham-field-card">
            <label>Age</label>
            <div className="framingham-field-value">{age}</div>
          </div>
          <div className="framingham-field-card">
            <label>Gender</label>
            <div className="framingham-field-value">{gender.charAt(0).toUpperCase() + gender.slice(1)}</div>
          </div>
          <div className="framingham-field-card">
            <label>Systolic BP</label>
            <div className="framingham-field-value">{systolic}</div>
          </div>
          <div className="framingham-field-card">
            <label>Total Cholesterol</label>
            <div className="framingham-field-value">{cholesterol}</div>
          </div>
          <div className="framingham-field-card">
            <label>HDL Cholesterol</label>
            <div className="framingham-field-value">{hdlCholesterol}</div>
          </div>
          <div className="framingham-field-card">
            <label>Smoking Status</label>
            <div className="framingham-field-value">
              <input type="checkbox" name="smoker" checked={form.smoker} onChange={handleChange} /> Smoker
            </div>
          </div>
          <div className="framingham-field-card">
            <label>Diabetes</label>
            <div className="framingham-field-value">
              <input type="checkbox" name="diabetic" checked={form.diabetic} onChange={handleChange} /> Diabetic
            </div>
          </div>
          <div className="framingham-field-card">
            <label>On BP Medication</label>
            <div className="framingham-field-value">
              <input type="checkbox" name="onMeds" checked={form.onMeds} onChange={handleChange} /> Yes
            </div>
          </div>
        </div>
        <button className="btn-primary framingham-submit-btn" type="submit">
          Calculate Risk
        </button>
      </form>
      {result && (
        <div className="framingham-result">
          <h4>Result</h4>
          <p>Total Points: {result.points}</p>
          <p>10-year CVD Risk: <strong>{result.risk}</strong></p>
        </div>
      )}
    </div>
  )
}

export default FraminghamCalculation 