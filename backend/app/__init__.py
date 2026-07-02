from flask import Flask, jsonify
from flask_cors import CORS

from app.extensions import db
from config import Config


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    CORS(app, origins=app.config["CORS_ORIGINS"])

    from app.routes import tasks_bp
    app.register_blueprint(tasks_bp)

    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok"}), 200

    @app.errorhandler(404)
    def not_found(_e):
        return jsonify({"error": "not found"}), 404

    @app.errorhandler(500)
    def server_error(_e):
        return jsonify({"error": "internal server error"}), 500

    return app
