import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import '../../css/HeartDiseaseForm.css';
import AppointmentBookingForm from './AppointmentBookingForm';
import AdviceChat from './AdviceChat';

const HeartDiseaseForm = ({ patientData, onClose }) => {
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isBookingFormVisible, setBookingFormVisible] = useState(false);
  const [isAdviceChatVisible, setAdviceChatVisible] = useState(false);

  // This function will now be triggered by a button click
  const handlePredict = async () => {
    if (!patientData) {
      setError("No data available to make a prediction.");
      return;
    }
    
    setLoading(true);
    setError('');
    setPrediction(null);

    // The data is already in the correct format from the prop
    try {
      const response = await axios.post('http://localhost:5001/predict/heart', patientData);
      setPrediction(response.data.prediction);
    } catch (err) {
      setError('An error occurred while making the prediction. Please check the console and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBookingForm = () => setBookingFormVisible(true);
  const handleCloseBookingForm = () => setBookingFormVisible(false);

  const handleBookingSuccess = () => {
    handleCloseBookingForm();
    onClose(); // Also close the prediction modal
  };

  // Advice Chat Modal Handlers
  const handleOpenAdviceChat = () => setAdviceChatVisible(true);
  const handleCloseAdviceChat = () => setAdviceChatVisible(false);

  // Display component for the clinical data
  const DataDisplay = ({ label, value }) => (
    <div className="hd-data-item">
      <span className="hd-data-label">{label}</span>
      <span className="hd-data-value">{value}</span>
    </div>
  );

  return (
    <>
      {/* Main modal overlay + backdrop */}
      <div className={`hd-form-modal-overlay ${isAdviceChatVisible ? 'with-chat' : ''}`}>
        <div className="hd-form-backdrop" onClick={onClose} />
        <div className={`hd-form-container ${isAdviceChatVisible ? 'sidebar-open' : ''}`}>
          <div className="hd-form-header">
            <h3>Heart Disease Prediction</h3>
            <button onClick={onClose} className="hd-close-btn">
              <X size={24} />
            </button>
          </div>
          
          {!patientData ? (
            <div className="hd-no-data">
              Your doctor has not yet entered the required clinical data for a prediction. Please consult your doctor.
            </div>
          ) : (
            <>
              <p>This prediction is based on the following clinical data entered by your doctor. It is not a diagnosis.</p>
              <div className="hd-data-grid">
                <DataDisplay label="Age" value={patientData.age} />
                <DataDisplay label="Sex" value={patientData.sex === 1 ? 'Male' : 'Female'} />
                <DataDisplay label="Chest Pain Type" value={patientData.cp} />
                <DataDisplay label="Resting Blood Pressure" value={`${patientData.trestbps} mmHg`} />
                <DataDisplay label="Cholesterol" value={`${patientData.chol} mg/dl`} />
                <DataDisplay label="Fasting Blood Sugar > 120 mg/dl" value={patientData.fbs === 1 ? 'True' : 'False'} />
                <DataDisplay label="Resting ECG" value={patientData.restecg} />
                <DataDisplay label="Max Heart Rate" value={patientData.thalach} />
                <DataDisplay label="Exercise Angina" value={patientData.exang === 1 ? 'Yes' : 'No'} />
                <DataDisplay label="Oldpeak" value={patientData.oldpeak} />
                <DataDisplay label="Slope" value={patientData.slope} />
                <DataDisplay label="Major Vessels (ca)" value={patientData.ca} />
                <DataDisplay label="Thalassemia (thal)" value={patientData.thal} />
              </div>

              <button onClick={handlePredict} className="hd-submit-btn" disabled={loading}>
                {loading ? 'Predicting...' : 'Run Prediction'}
              </button>
              
              <div className="hd-result-container">
                {error && <div className="hd-error">{error}</div>}
                {prediction !== null && (
                  <div className={`hd-result ${prediction === 1 ? 'hd-positive' : 'hd-negative'}`}>
                    <h4>Prediction Result:</h4>
                    <p>
                      {prediction === 1
                        ? 'The model predicts a HIGH LIKELIHOOD of heart disease.'
                        : 'The model predicts a LOW LIKELIHOOD of heart disease.'}
                    </p>
                    {prediction === 1 && (
                      <div className="hd-actions">
                        <button onClick={handleOpenBookingForm} className="hd-action-btn book-appointment-btn">
                          Book Appointment
                        </button>
                        <button onClick={handleOpenAdviceChat} className="hd-action-btn get-advice-btn">
                          Get Advice
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Appointment Booking Form Modal */}
      <AppointmentBookingForm
        isVisible={isBookingFormVisible}
        onClose={handleCloseBookingForm}
        onSubmitSuccess={handleBookingSuccess}
      />

      {/* Advice Chat Sidebar */}
      {isAdviceChatVisible && <div className="advice-chat-backdrop" onClick={handleCloseAdviceChat} />}
      <AdviceChat
        show={isAdviceChatVisible}
        onClose={handleCloseAdviceChat}
        heartData={patientData}
      />
    </>
  );
};

export default HeartDiseaseForm;