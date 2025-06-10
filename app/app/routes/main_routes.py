from app.db import get_db
from flask_cors import CORS
from flask import Blueprint, Flask, request, jsonify

main_bp = Blueprint('main', __name__)
CORS(main_bp)

@main_bp.route('/api/data', methods=['GET'])
def home():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM użytkownicy')
    users = cursor.fetchall()
    cursor.close()
    return {'users': users}

@main_bp.route('/api/login', methods=['POST'])
def login():
    data = request.json
    pesel = data.get('pesel')
    password = data.get('password')

    print("Login attempt with pesel:", pesel)
    # Validate input
    if not pesel or not password:
        return jsonify({"message": "pesel and password are required"}), 400

    try:
        conn = get_db()
        cursor = conn.cursor()

        query = "SELECT * FROM użytkownicy WHERE pesel = %s AND hasło = %s"
        cursor.execute(query, (pesel, password))
        user = cursor.fetchone()
        print("User fetched:", user)
        cursor.close()

        if user:
            return jsonify({"message": "Login successful"}), 200
        else:
            return jsonify({"message": "Invalid credentials"}), 401

    except Exception as e:
        print("Login error:", e)
        return jsonify({"message": "Internal server error"}), 500


@main_bp.route('/api/lekarze', methods=['GET'])
def get_doctors():
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM lekarze')
        doctors = cursor.fetchall()
        cursor.close()
        return jsonify({"doctors": doctors}), 200
    except Exception as e:
        print("Error fetching doctors:", e)
        return jsonify({"message": "Internal server error"}), 500


# /available-doctors?date=2025-06-09
@main_bp.route('/available-doctors', methods=['GET'])
def available_doctors():
    print('Fetching available doctors...')
    try:
        date = request.args.get('date')
        print("Fetching available doctors for date:", date)
        if not date:
            return jsonify({"message": "Missing date parameter"}), 400

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT DISTINCT l.pesel_lekarza, u.imię, u.nazwisko, l.specjalizacja
            FROM terminy_wizyt t
            JOIN lekarze l ON t.pesel_lekarza = l.pesel_lekarza
            JOIN użytkownicy u ON u.pesel = l.pesel_lekarza  
        """, (date,))
        doctors = cursor.fetchall()
        cursor.close()

        return jsonify([
            {
                "pesel": d[0],
                "imie": d[1],
                "nazwisko": d[2],
                "specjalizacja": d[3]
            } for d in doctors
        ])
    except Exception as e:
        print("Error fetching doctors:", e)
        return jsonify({"message": "Internal server error"}), 500


# /available-timeslots?date=2025-06-09&doctor=12345678901
@main_bp.route('/available-timeslots', methods=['GET'])
def available_timeslots():
    try:
        date = request.args.get('date')
        pesel = request.args.get('doctor')
        print("Fetching available timeslots for doctor:", pesel, "on date:", date)
        if not date or not pesel:
            return jsonify({"message": "Missing parameters"}), 400

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT godzina_rozpoczęcia
            FROM terminy_wizyt
            WHERE pesel_lekarza = %s AND data_dostępności = %s AND czy_dostępny = TRUE
            ORDER BY godzina_rozpoczęcia
        """, (pesel, date))
        times = cursor.fetchall()
        print("Available timeslots:", times)
        cursor.close()

        return jsonify([t[0].strftime("%H:%M") for t in times])
    except Exception as e:
        print("Error fetching timeslots:", e)
        return jsonify({"message": "Internal server error"}), 500

@main_bp.route('/api/appointments', methods=['GET'])
def get_appointments():
    try:
        pesel = request.args.get('pesel')
        if not pesel:
            return jsonify({"message": "Missing PESEL parameter"}), 400

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT w.data_czas, l.pesel_lekarza, u.imię, u.nazwisko
            FROM wizyty w
            JOIN lekarze l ON w.pesel_lekarza = l.pesel_lekarza
            JOIN użytkownicy u ON u.pesel = l.pesel_lekarza
            WHERE w.pesel_pacjenta = %s
        """, (pesel,))
        appointments = cursor.fetchall()
        cursor.close()

        return jsonify([
            {
                "data_czas": a[0].strftime("%Y-%m-%d %H:%M"),
                "pesel_lekarza": a[1],
                "lekarz_imie": a[2],
                "lekarz_nazwisko": a[3]
            } for a in appointments
        ])
    except Exception as e:
        print("Error fetching appointments:", e)
        return jsonify({"message": "Internal server error"}), 500



# /api/visits?pesel=12345678901&date=2025-06-09
@main_bp.route('/visits', methods=['GET'])
def get_visits_doctor():
    try:
        pesel = request.args.get('pesel')
        date = request.args.get('date')
        print("Fetching visits for doctor:", pesel, "on date:", date)
        if not pesel or not date:
            return jsonify({"message": "Missing parameters"}), 400

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id_wizyty, w.data, w.czas, u.imię, u.nazwisko, u.pesel
            FROM wizyty w
            JOIN użytkownicy u ON w.pesel_pacjenta = u.pesel
            WHERE w.pesel_lekarza = %s AND w.data = %s
        """, (pesel, date))
        visits = cursor.fetchall()
        cursor.close()

        return jsonify([ 
            {
                "id_wizyty": v[0],
                "data": v[1].strftime("%Y-%m-%d"),
                "czas": v[2].strftime("%H:%M"),
                "pacjent_imie": v[3],
                "pacjent_nazwisko": v[4],
                "pacjent_pesel": v[5]
            } for v in visits
        ])
    except Exception as e:
        print("Error fetching visits:", e)
        return jsonify({"message": "Internal server error"}), 500



@main_bp.route('/name', methods=['GET'])
def get_name():
    try:
        pesel = request.args.get('pesel')
        print("Fetching name for PESEL:", pesel)
        if not pesel:
            return jsonify({"message": "Missing PESEL parameter"}), 400

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT imię, nazwisko FROM użytkownicy WHERE pesel = %s", (pesel,))
        name = cursor.fetchone()
        cursor.close()

        if name:
            return jsonify({"imię": name[0], "nazwisko": name[1]}), 200
        else:
            return jsonify({"message": "User not found"}), 404
    except Exception as e:
        print("Error fetching name:", e)
        return jsonify({"message": "Internal server error"}), 500

@main_bp.route('/count', methods=['GET'])
def count_appointments_for_day():
    try:
        date = request.args.get('date')
        pesel = request.args.get('pesel')
        print("Counting appointments for PESEL:", pesel, "on date:", date)
        if not date or not pesel:
            return jsonify({"message": "Missing parameters"}), 400

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT COUNT(*)
            FROM wizyty
            WHERE pesel_lekarza = %s AND data = %s
        """, (pesel, date))
        count = cursor.fetchone()[0]
        cursor.close()

        return jsonify({"count": count}), 200
    except Exception as e:
        print("Error counting appointments:", e)
        return jsonify({"message": "Internal server error"}), 500

@main_bp.route('visit/<visit_id>', methods=['GET'])
def get_visit_details(visit_id):
    try:
        print("Fetching details for visit ID:", visit_id)
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT w.id_wizyty, w.data, w.czas, 
                   p.imię, p.nazwisko, p.pesel, 
                   l.pesel_lekarza, d.imię, d.nazwisko, w.rozpoznanie, w.notatki, w.zalecenia
            FROM wizyty w
            JOIN użytkownicy p ON w.pesel_pacjenta = p.pesel
            JOIN lekarze l ON w.pesel_lekarza = l.pesel_lekarza
            JOIN użytkownicy d ON l.pesel_lekarza = d.pesel
            WHERE w.id_wizyty = %s
        """, (visit_id,))
        visit = cursor.fetchone()
        cursor.close()

        if visit:
            return jsonify({
                "id_wizyty": visit[0],
                "data": visit[1].strftime("%Y-%m-%d"),
                "czas": visit[2].strftime("%H:%M"),
                "pacjent_imie": visit[3],
                "pacjent_nazwisko": visit[4],
                "pacjent_pesel": visit[5],
                "lekarz_pesel": visit[6],
                "lekarz_imie": visit[7],
                "lekarz_nazwisko": visit[8],
                "rozpoznanie": visit[9],
                "notatki": visit[10],
                "zalecenia": visit[11]
            }), 200
        else:
            return jsonify({"message": "Visit not found"}), 404
    except Exception as e:
        print("Error fetching visit details:", e)
        return jsonify({"message": "Internal server error"}), 500
    
@main_bp.route('/update-visit/<visit_id>', methods=['PUT'])
def update_visit(visit_id):
    try:
        data = request.json
        visit_id = int(visit_id)
        rozpoznania = data.get('rozpoznanie')
        notatki = data.get('notatki')
        zalecenia = data.get('zalecenia')


        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE wizyty
            SET rozpoznanie = %s, notatki = %s, zalecenia = %s
            WHERE id_wizyty = %s
        """, (rozpoznania, notatki, zalecenia, visit_id))
        conn.commit()
        cursor.close()

        return jsonify({"message": "Visit updated successfully"}), 200
    except Exception as e:
        print("Error updating visit:", e)
        return jsonify({"message": "Internal server error"}), 500
    
@main_bp.route('/api/appointment', methods=['POST'])
def make_appointment():
    data = request.json
    pesel_pacjenta = data.get('pesel_pacjenta')
    pesel_lekarza = data.get('pesel_lekarza')
    date = data.get('data')
    time = data.get('czas')

    print("Creating appointment with data:", data)

    if not pesel_pacjenta or not pesel_lekarza or not date or not time:
        return jsonify({"message": "Missing parameters"}), 400

    try:
        conn = get_db()
        cursor = conn.cursor()

        # Check if the slot is available
        cursor.execute("""
            SELECT czy_dostępny FROM terminy_wizyt
            WHERE pesel_lekarza = %s AND data_dostępności = %s AND godzina_rozpoczęcia = %s
        """, (pesel_lekarza, date, time))
        slot = cursor.fetchone()
        if not slot or not slot[0]:
            cursor.close()
            return jsonify({"message": "Wybrany termin nie jest dostępny"}), 409

        # Insert appointment
        cursor.execute("""
            INSERT INTO wizyty (data, czas, pesel_pacjenta, pesel_lekarza)
            VALUES (%s, %s, %s, %s)
        """, (date, time, pesel_pacjenta, pesel_lekarza))

        # Mark slot as unavailable
        cursor.execute("""
            UPDATE terminy_wizyt
            SET czy_dostępny = FALSE
            WHERE pesel_lekarza = %s AND data_dostępności = %s AND godzina_rozpoczęcia = %s
        """, (pesel_lekarza, date, time))

        conn.commit()
        cursor.close()

        return jsonify({"message": "Wizyta została umówiona"}), 201
    except Exception as e:
        print("Error creating appointment:", e)
        return jsonify({"message": "Internal server error"}), 500
    
@main_bp.route('/patient-appointments', methods=['GET'])
def patient_appointments():
    pesel = request.args.get('pesel')
    if not pesel:
        return jsonify({"message": "Missing pesel"}), 400
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT w.id_wizyty, w.data, w.czas, u.imię, u.nazwisko, l.specjalizacja
            FROM wizyty w
            JOIN lekarze l ON w.pesel_lekarza = l.pesel_lekarza
            JOIN użytkownicy u ON l.pesel_lekarza = u.pesel
            WHERE w.pesel_pacjenta = %s
            ORDER BY w.data DESC, w.czas DESC
        """, (pesel,))
        appointments = cursor.fetchall()
        cursor.close()
        return jsonify([
            {
                "id_wizyty": a[0],
                "data": a[1].strftime("%Y-%m-%d"),
                "czas": a[2].strftime("%H:%M"),
                "lekarz_imie": a[3],
                "lekarz_nazwisko": a[4],
                "specjalizacja": a[5],
            }
            for a in appointments
        ])
    except Exception as e:
        print("Error fetching patient appointments:", e)
        return jsonify({"message": "Internal server error"}), 500