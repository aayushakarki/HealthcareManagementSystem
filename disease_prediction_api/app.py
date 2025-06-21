from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np

# Create the Flask app
app = Flask(__name__)

# --- Enable CORS ---
# This will allow your frontend (:5173) to communicate with this API (:5001)
CORS(app, resources={r"/predict/*": {"origins": "http://localhost:5173"}})

# --- Load the Heart Disease Model ---
try:
    with open('models/heart_disease_model.sav', 'rb') as model_file:
        model = pickle.load(model_file)
except FileNotFoundError:
    print("Heart disease model file not found. Please check the path: models/heart_disease_model.sav")
    model = None


# --- API Endpoint for Heart Disease Prediction ---
@app.route('/predict/heart', methods=['POST'])
def predict_heart_disease():
    if not model:
        return jsonify({'error': 'Heart disease model is not loaded.'}), 500

    try:
        data = request.get_json()
        
        # Ensure the feature names in the JSON match these keys
        features = [
            data['age'], data['sex'], data['cp'], data['trestbps'],
            data['chol'], data['fbs'], data['restecg'], data['thalach'],
            data['exang'], data['oldpeak'], data['slope'], data['ca'], data['thal']
        ]

        input_array = np.array(features).reshape(1, -1)
        prediction = model.predict(input_array)
        
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