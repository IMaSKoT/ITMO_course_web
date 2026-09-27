from flask import Flask
from backend.routes import api
from backend.errors import StorageError

app = Flask(
    __name__,
    static_folder="frontend",
    static_url_path=""
)

app.register_blueprint(api, url_prefix="/api")

@app.errorhandler(StorageError)
def handle_storage_error(error):
    return {
        "error": {
            "code": "STORAGE_ERROR",
            "message": "Ошибка при работе с хранилищем"
        }
    }, 500

@app.get("/")
def index():
    return app.send_static_file("index.html")
if __name__ == "__main__":
    app.run(debug=True)