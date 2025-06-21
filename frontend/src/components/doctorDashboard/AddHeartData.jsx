"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { HeartPulse } from "lucide-react"

const AddHeartData = () => {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [formData, setFormData] = useState({
    patientId: "",
    age: '',
    sex: '1',
    cp: '0',
    trestbps: '',
    chol: '',
    fbs: '0',
    restecg: '0',
    thalach: '',
    exang: '0',
    oldpeak: '',
    slope: '0',
    ca: '0',
    thal: '1',
  })

  // Fetch patients associated with the doctor
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true)
        const appointmentsResponse = await axios.get("http://localhost:4000/api/v1/appointment/doctor/me", {
          withCredentials: true,
        })

        if (appointmentsResponse.data.success) {
          const appointments = appointmentsResponse.data.appointments
          const uniquePatients = []
          const patientIds = new Set()
          appointments.forEach((appointment) => {
            if (!patientIds.has(appointment.patientId)) {
              patientIds.add(appointment.patientId)
              uniquePatients.push({
                id: appointment.patientId,
                name: `${appointment.firstName} ${appointment.lastName}`,
              })
            }
          })
          setPatients(uniquePatients)
        }
        setLoading(false)
      } catch (error) {
        toast.error("Failed to load patients list.")
        setLoading(false)
      }
    }
    fetchPatients()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Convert string numbers to actual numbers before sending
    const numericFormData = { ...formData };
    for (const key in numericFormData) {
      if (key !== 'patientId') { // Don't convert patientId
        const numValue = Number(numericFormData[key]);
        if (!isNaN(numValue)) {
          numericFormData[key] = numValue;
        } else {
           toast.error(`Please enter a valid number for ${key}.`);
           return;
        }
      }
    }
    
    // Check for empty required fields
    const requiredFields = ['patientId', 'age', 'trestbps', 'chol', 'thalach', 'oldpeak'];
    for(const field of requiredFields) {
        if(formData[field] === '') {
            toast.error(`Please fill out the ${field} field.`);
            return;
        }
    }


    try {
      setSubmitLoading(true)
      const response = await axios.post("http://localhost:4000/api/v1/heartdata/add", numericFormData, {
        withCredentials: true,
      })

      if (response.data.success) {
        const selectedPatient = patients.find((p) => p.id === formData.patientId)
        toast.success(`Heart data has been added for ${selectedPatient.name}`)
        // Reset form
        setFormData({
          patientId: "", age: '', sex: '1', cp: '0', trestbps: '', chol: '', fbs: '0',
          restecg: '0', thalach: '', exang: '0', oldpeak: '', slope: '0', ca: '0', thal: '1',
        })
      }
      setSubmitLoading(false)
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add heart data.")
      setSubmitLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading patient data...</div>
  }

  return (
    <div className="prescription-upload-container">
      <div className="section-header">
        <h2>Heart Disease Data Entry</h2>
      </div>
      <form onSubmit={handleSubmit} className="prescription-form">
        <div className="form-group">
          <label htmlFor="patientId">Select Patient *</label>
          <select id="patientId" name="patientId" value={formData.patientId} onChange={handleInputChange} required className="form-select">
            <option value="">-- Select a Patient --</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>{patient.name}</option>
            ))}
          </select>
        </div>

        {/* Row 1 */}
        <div className="form-row">
            <div className="form-group">
                <label>Age *</label>
                <input type="number" name="age" value={formData.age} onChange={handleInputChange} required className="form-input" placeholder="e.g., 55"/>
            </div>
            <div className="form-group">
                <label>Sex</label>
                <select name="sex" value={formData.sex} onChange={handleInputChange} className="form-select">
                    <option value="1">Male</option>
                    <option value="0">Female</option>
                </select>
            </div>
            <div className="form-group">
                <label>Chest Pain Type (CP)</label>
                <select name="cp" value={formData.cp} onChange={handleInputChange} className="form-select">
                    <option value="0">Typical Angina</option>
                    <option value="1">Atypical Angina</option>
                    <option value="2">Non-anginal Pain</option>
                    <option value="3">Asymptomatic</option>
                </select>
            </div>
        </div>

        {/* Row 2 */}
        <div className="form-row">
            <div className="form-group">
                <label>Resting Blood Pressure (trestbps) *</label>
                <input type="number" name="trestbps" value={formData.trestbps} onChange={handleInputChange} required className="form-input" placeholder="e.g., 140"/>
            </div>
            <div className="form-group">
                <label>Serum Cholesterol (chol) in mg/dl *</label>
                <input type="number" name="chol" value={formData.chol} onChange={handleInputChange} required className="form-input" placeholder="e.g., 210"/>
            </div>
             <div className="form-group">
                <label>Fasting Blood Sugar &gt; 120 mg/dl (fbs)</label>
                <select name="fbs" value={formData.fbs} onChange={handleInputChange} className="form-select">
                    <option value="1">True</option>
                    <option value="0">False</option>
                </select>
            </div>
        </div>

        {/* Row 3 */}
        <div className="form-row">
            <div className="form-group">
                <label>Resting ECG Results (restecg)</label>
                <select name="restecg" value={formData.restecg} onChange={handleInputChange} className="form-select">
                    <option value="0">Normal</option>
                    <option value="1">ST-T wave abnormality</option>
                    <option value="2">Probable or definite left ventricular hypertrophy</option>
                </select>
            </div>
            <div className="form-group">
                <label>Max Heart Rate Achieved (thalach) *</label>
                <input type="number" name="thalach" value={formData.thalach} onChange={handleInputChange} required className="form-input" placeholder="e.g., 155"/>
            </div>
            <div className="form-group">
                <label>Exercise Induced Angina (exang)</label>
                <select name="exang" value={formData.exang} onChange={handleInputChange} className="form-select">
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                </select>
            </div>
        </div>
        
        {/* Row 4 */}
        <div className="form-row">
            <div className="form-group">
                <label>ST depression induced by exercise (oldpeak) *</label>
                <input type="number" step="0.1" name="oldpeak" value={formData.oldpeak} onChange={handleInputChange} required className="form-input" placeholder="e.g., 1.2"/>
            </div>
            <div className="form-group">
                <label>Slope of peak exercise ST segment</label>
                <select name="slope" value={formData.slope} onChange={handleInputChange} className="form-select">
                    <option value="0">Upsloping</option>
                    <option value="1">Flat</option>
                    <option value="2">Downsloping</option>
                </select>
            </div>
            <div className="form-group">
                <label>Major vessels colored by flourosopy (ca)</label>
                <select name="ca" value={formData.ca} onChange={handleInputChange} className="form-select">
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                </select>
            </div>
        </div>

        {/* Row 5 */}
        <div className="form-row">
            <div className="form-group">
                <label>Thalassemia (thal)</label>
                <select name="thal" value={formData.thal} onChange={handleInputChange} className="form-select">
                    <option value="1">Normal</option>
                    <option value="2">Fixed defect</option>
                    <option value="3">Reversible defect</option>
                </select>
            </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={submitLoading}>
            {submitLoading ? 'Submitting...' : (<><HeartPulse className="w-4 h-4 mr-1" />Submit Data</>)}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddHeartData; 