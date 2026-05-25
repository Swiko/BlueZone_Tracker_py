import os
import json
import urllib.request
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__, static_folder=BASE_DIR)
CORS(app)

DATA_FILE = os.path.join(BASE_DIR, 'lakes.json')

# Функция автоматической локализации Leaflet (чтобы не качать вручную)
def download_leaflet_locally():
    files = {
        "leaflet.css": "https://cloudflare.com",
        "leaflet.js": "https://cloudflare.com"
    }
    for filename, url in files.items():
        filepath = os.path.join(BASE_DIR, filename)
        if not os.path.exists(filepath):
            print(f"[*] Скачивание локального файла карты {filename}...")
            try:
                urllib.request.urlretrieve(url, filepath)
                print(f"[+] Файл {filename} успешно сохранен!")
            except Exception as e:
                print(f"[❌] Не удалось скачать {filename}: {e}")

def load_lakes_from_file():
    if not os.path.exists(DATA_FILE):
        return []
    try:
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error reading JSON: {e}")
        return []

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/lakes', methods=['GET'])
def get_lakes():
    return jsonify(load_lakes_from_file())

@app.route('/index.js')
def serve_js():
    return send_from_directory(app.static_folder, 'index.js', mimetype='application/javascript')

@app.route('/<path:filename>')
def serve_leaflet_files(filename):
    if filename in ["leaflet.css", "leaflet.js"]:
        ext = "text/css" if filename.endswith(".css") else "application/javascript"
        return send_from_directory(app.static_folder, filename, mimetype=ext)
    return "Not Found", 404

if __name__ == '__main__':
    download_leaflet_locally()  # Автоматический скрипт-загрузчик
    print("=== ГИС Сервер запущен на локальных картах ===")
    app.run(host='127.0.0.1', port=5000, debug=True)
