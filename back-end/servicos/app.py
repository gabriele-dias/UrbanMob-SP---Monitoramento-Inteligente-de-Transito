import logging

from flask import Flask, jsonify
from werkzeug.exceptions import HTTPException

from rotas import api


def create_app():
    app = Flask(__name__)
    app.register_blueprint(api)

    @app.errorhandler(HTTPException)
    def handle_http_error(error):
        return jsonify({"erro": error.description}), error.code

    @app.errorhandler(Exception)
    def handle_unexpected_error(error):
        app.logger.exception("Erro inesperado ao processar a requisição", exc_info=error)
        return jsonify({"erro": "Erro interno do servidor"}), 500

    return app


logging.basicConfig(level=logging.INFO)
app = create_app()


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=False,
    )
