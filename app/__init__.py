from flask import Flask
from .database import init_db

def create_app():
    app = Flask(__name__)
    app.secret_key = "steek-borduurweelde"

    init_db()

    from .routes import products, sales, settings, main
    app.register_blueprint(main.bp)
    app.register_blueprint(products.bp)
    app.register_blueprint(sales.bp)
    app.register_blueprint(settings.bp)

    from .backup import start_scheduler
    start_scheduler()

    return app
