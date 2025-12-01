# Hướng dẫn kết nối Google Colab với Website

## 1. Chuẩn bị Google Colab Notebook

### Tạo notebook mới trên Google Colab:

```python
# Cell 1: Cài đặt các thư viện cần thiết
!pip install flask flask-cors pillow tensorflow numpy opencv-python ngrok

# Cell 2: Import thư viện
import os
import io
import base64
import numpy as np
from PIL import Image
import tensorflow as tf
from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
from pyngrok import ngrok
import threading
```

### Cell 3: Tạo Flask API server

```python
app = Flask(__name__)
CORS(app)

# Load model đã train (thay thế bằng model của bạn)
# model = tf.keras.models.load_model('your_fashion_model.h5')

# Mock model cho demo
class MockFashionModel:
    def predict(self, image_array):
        # Trả về kết quả mock
        return {
            'predictions': [
                {
                    'product_id': 'men-tshirt-1',
                    'confidence': 0.95,
                    'similarity': 0.92,
                    'category': 'men',
                    'features': ['cotton', 'casual', 'basic']
                },
                {
                    'product_id': 'men-tshirt-2', 
                    'confidence': 0.87,
                    'similarity': 0.84,
                    'category': 'men',
                    'features': ['cotton', 'sport', 'dry']
                }
            ],
            'processing_time': 0.5
        }

model = MockFashionModel()

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'AI model is ready'})

@app.route('/model-info', methods=['GET'])
def model_info():
    return jsonify({
        'model_name': 'Fashion Recognition Model',
        'version': '1.0',
        'accuracy': '89.5%',
        'last_updated': '2024-01-25',
        'categories': ['men', 'women', 'kids'],
        'features': ['color_detection', 'style_classification', 'material_recognition']
    })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No image selected'}), 400
        
        # Đọc và xử lý hình ảnh
        image = Image.open(file.stream)
        image_array = np.array(image)
        
        # Resize image nếu cần
        if image_array.shape[0] > 512 or image_array.shape[1] > 512:
            image = image.resize((512, 512))
            image_array = np.array(image)
        
        # Predict với model
        result = model.predict(image_array)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/analyze-text', methods=['POST'])
def analyze_text():
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        # Xử lý text search (có thể dùng NLP model)
        result = {
            'keywords': text.split(),
            'category_suggestions': ['men', 'women'],
            'product_suggestions': ['t-shirt', 'jeans', 'dress']
        }
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Chạy server
def run_server():
    app.run(host='0.0.0.0', port=5000, debug=False)

# Tạo ngrok tunnel
public_url = ngrok.connect(5000)
print(f"Public URL: {public_url}")

# Chạy server trong thread riêng
server_thread = threading.Thread(target=run_server)
server_thread.daemon = True
server_thread.start()

print("Server is running...")
print(f"Health check: {public_url}/health")
print(f"Model info: {public_url}/model-info") 
print(f"Predict endpoint: {public_url}/predict")
```

## 2. Cấu hình ngrok (nếu cần)

```python
# Cell 4: Cấu hình ngrok với auth token (tùy chọn)
# Đăng ký tài khoản ngrok và lấy auth token
# ngrok.set_auth_token("your_ngrok_auth_token")
```

## 3. Test API

```python
# Cell 5: Test API endpoints
import requests

# Test health check
response = requests.get(f"{public_url}/health")
print("Health check:", response.json())

# Test model info
response = requests.get(f"{public_url}/model-info")
print("Model info:", response.json())
```

## 4. Sử dụng model thật

Để sử dụng model đã train thật:

```python
# Thay thế MockFashionModel bằng model thật
model = tf.keras.models.load_model('/path/to/your/model.h5')

# Hoặc load từ Google Drive
from google.colab import drive
drive.mount('/content/drive')
model = tf.keras.models.load_model('/content/drive/MyDrive/fashion_model.h5')

# Cập nhật hàm predict
def predict_with_real_model(image_array):
    # Preprocess image
    processed_image = preprocess_image(image_array)
    
    # Predict
    predictions = model.predict(processed_image)
    
    # Post-process results
    results = post_process_predictions(predictions)
    
    return results
```

## 5. Kết nối từ Website

Sau khi chạy Colab notebook:

1. Copy URL ngrok được tạo ra
2. Vào website, mở tính năng "Tìm kiếm bằng AI"
3. Click vào icon Settings trong modal
4. Paste URL vào ô "Colab URL"
5. Click "Kết nối"

## 6. Troubleshooting

### Lỗi CORS:
```python
# Thêm CORS headers
from flask_cors import cross_origin

@app.route('/predict', methods=['POST'])
@cross_origin()
def predict():
    # ...
```

### Lỗi ngrok timeout:
```python
# Reconnect ngrok
ngrok.disconnect(public_url)
public_url = ngrok.connect(5000)
print(f"New URL: {public_url}")
```

### Lỗi memory:
```python
# Clear memory
import gc
gc.collect()

# Giảm batch size hoặc image size
```

## 7. Tips

- Giữ Colab notebook chạy để duy trì kết nối
- Sử dụng Colab Pro để có thời gian chạy lâu hơn
- Lưu model vào Google Drive để tránh mất dữ liệu
- Monitor logs để debug lỗi
- Test API bằng Postman trước khi kết nối website

## 8. Environment Variables

Tạo file `.env` trong project:

```env
REACT_APP_COLAB_URL=https://your-ngrok-url.ngrok.io
REACT_APP_COLAB_API_KEY=your_optional_api_key
```

## 9. Production Deployment

Để deploy production:

1. Deploy model lên cloud service (AWS, GCP, Azure)
2. Tạo proper API endpoint
3. Cập nhật URL trong website
4. Thêm authentication nếu cần