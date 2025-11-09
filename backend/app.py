import os

from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS
from .api import register_api
from .database import create_db_tables
from .sample_data import seed_initial_data


load_dotenv()


def create_app() -> Flask:
    app = Flask(__name__)
    app.config["JSON_AS_ASCII"] = False

    cors_origins = os.getenv("CORS_ORIGINS", "*")
    CORS(
        app,
        resources={r"/api/*": {"origins": cors_origins}},
        supports_credentials=True,
    )

    register_api(app)

    @app.get("/health")
    def healthcheck():
        return jsonify(status="ok")



    return app


app = create_app()


if __name__ == "__main__":
    with app.app_context():
        create_db_tables()
        seed_initial_data()
    app.run(debug=os.getenv("FLASK_DEBUG", "0") == "1")

