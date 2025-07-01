import numpy as np

# Logistic Regression from Scratch
class LogisticRegressionScratch:
    def __init__(self, learning_rate=0.01, epochs=1000):
        self.lr = learning_rate
        self.epochs = epochs
        self.weights = None
        self.bias = None

    def sigmoid(self, z):
        return 1 / (1 + np.exp(-z))

    def fit(self, X, y):
        n_samples, n_features = X.shape
        self.weights = np.zeros(n_features)
        self.bias = 0

        for epoch in range(self.epochs):
            linear_output = np.dot(X, self.weights) + self.bias
            predictions = self.sigmoid(linear_output)

            dw = np.dot(X.T, (predictions - y)) / n_samples
            db = np.sum(predictions - y) / n_samples

            self.weights -= self.lr * dw
            self.bias -= self.lr * db

            if epoch % 100 == 0:
                loss = -np.mean(y * np.log(predictions + 1e-15) + (1 - y) * np.log(1 - predictions + 1e-15))
                print(f"Epoch {epoch}, Loss: {loss:.4f}")

    def predict_proba(self, X):
        return self.sigmoid(np.dot(X, self.weights) + self.bias).reshape(-1, 1)

    def predict(self, X):
        proba = self.predict_proba(X)
        return (proba >= 0.5).astype(int).flatten()