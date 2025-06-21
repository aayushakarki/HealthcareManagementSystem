from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import pandas as pd

# Create the Flask app
app = Flask(__name__)

# --- Enable CORS ---
# This will allow your frontend (:5173) to communicate with this API (:5001)
CORS(app, resources={r"/predict/*": {"origins": "http://localhost:5173"}})

# --- Load the Heart Disease Model and Scaler ---
try:
    with open('models/heart_disease_model.sav', 'rb') as model_file:
        model = pickle.load(model_file)
    with open('models/scaler.pkl', 'rb') as scaler_file:
        scaler = pickle.load(scaler_file)
except FileNotFoundError as e:
    print(f"Model or scaler file not found. Please check the path. Error: {e}")
    model = None
    scaler = None


# --- API Endpoint for Heart Disease Prediction ---
@app.route('/predict/heart', methods=['POST'])
def predict_heart_disease():
    if not model or not scaler:
        return jsonify({'error': 'Model or scaler is not loaded.'}), 500

    try:
        data = request.get_json()
        
        # Create a pandas DataFrame from the input data
        input_df = pd.DataFrame([data])
        
        # Define the expected feature order, matching the training data columns
        feature_order = [
            'age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 
            'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal'
        ]
        
        # Ensure the DataFrame has columns in the correct order
        input_df = input_df[feature_order]

        # Scale the features
        input_scaled = scaler.transform(input_df)
        
        # Make a prediction
        prediction = model.predict(input_scaled)
        
        # Return result: 0 for no heart disease, 1 for presence of heart disease
        return jsonify({'prediction': int(prediction[0])})

    except KeyError as e:
        return jsonify({'error': f'Missing feature in request: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# --- Run the App ---
if __name__ == '__main__':
    # Use 0.0.0.0 to make the API accessible from your main application
    app.run(host='0.0.0.0', port=5001, debug=True)