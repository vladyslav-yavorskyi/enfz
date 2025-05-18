from flask import Blueprint, request 
from app.db import get_db

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def home():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users')
    users = cursor.fetchall()
    cursor.close()
    return {'users': users}
