import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import '../../css/HeartDiseaseForm.css';

const HeartDiseaseForm = ({ patientData, onClose }) => {
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  // Display component for the clinical data
  const DataDisplay = ({ label, value }) => (
    <div className="hd-data-item">
      <span className="hd-data-label">{label}</span>
      <span className="hd-data-value">{value}</span>
    </div>
  );

  return (
    <div className="hd-form-modal-overlay">
      <div className="hd-form-container">
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
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HeartDiseaseForm;
