DROP TABLE IF EXISTS medical_records, prescriptions, appointments, patients, doctors, users;

CREATE TABLE users (
    pesel VARCHAR(11) PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    birth_date DATE NOT NULL,
    address VARCHAR(100), 
    gender CHAR(1) CHECK (gender IN ('M', 'F')),
    phone_number VARCHAR(15)
);

CREATE TABLE doctors (
    doctor_pesel VARCHAR(11) PRIMARY KEY REFERENCES users(pesel) ON DELETE CASCADE,
    specialization VARCHAR(50) NOT NULL,
    title VARCHAR(50) NOT NULL
);

CREATE TABLE patients (
    patient_pesel VARCHAR(11) PRIMARY KEY REFERENCES users(pesel) ON DELETE CASCADE,
    allergies VARCHAR(100),
    chronic_conditions VARCHAR(100)
);

CREATE TABLE appointments (
    appointment_id SERIAL PRIMARY KEY,
    date_time TIMESTAMP NOT NULL,
    doctor_pesel VARCHAR(11) REFERENCES doctors(doctor_pesel),
    patient_pesel VARCHAR(11) REFERENCES patients(patient_pesel),
    status VARCHAR(20) CHECK (status IN ('scheduled', 'completed', 'canceled')),
    notes TEXT,
    room_number VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prescriptions (
    prescription_id SERIAL PRIMARY KEY,
    appointment_id INT REFERENCES appointments(appointment_id) ON DELETE CASCADE,
    medication VARCHAR(100) NOT NULL,
    dosage VARCHAR(50) NOT NULL,
    instructions TEXT,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE medical_records (
    record_id SERIAL PRIMARY KEY,
    patient_pesel VARCHAR(11) REFERENCES patients(patient_pesel) ON DELETE CASCADE,
    doctor_pesel VARCHAR(11) REFERENCES doctors(doctor_pesel),
    diagnosis TEXT,
    treatment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample data
INSERT INTO users (pesel, first_name, last_name, birth_date, address, gender, phone_number) VALUES
('12345678901', 'John', 'Doe', '1980-01-01', '123 Main St, City, Country', 'M', '123-456-789'),
('23456789012', 'Jane', 'Smith', '1990-02-02', '456 Elm St, City, Country', 'F', '234-567-890'),
('34567890123', 'Alice', 'Johnson', '1985-03-03', '789 Oak St, City, Country', 'F', '345-678-901'),
('45678901234', 'Bob', 'Brown', '1975-04-04', '101 Pine St, City, Country', 'M', '456-789-012'),
('56789012345', 'Charlie', 'Davis', '2000-05-05', '202 Maple St, City, Country', 'M', '567-890-123'),
('32121212324', 'Eve', 'Wilson', '1988-06-06', '303 Cedar St, City, Country', 'F', '678-901-234'),
('32121212325', 'Frank', 'Miller', '1987-07-07', '404 Birch St, City, Country', 'M', '789-012-345'),
('32121212326', 'Grace', 'Lee', '1991-08-08', '505 Spruce St, City, Country', 'F', '890-123-456'),
('32121212327', 'Hank', 'Kim', '1982-09-09', '606 Fir St, City, Country', 'M', '901-234-567'),
('32121212328', 'Ivy', 'Park', '1993-10-10', '707 Ash St, City, Country', 'F', '012-345-678');

INSERT INTO doctors (doctor_pesel, specialization, title) VALUES
('12345678901', 'Cardiology', 'Dr.'),
('23456789012', 'Dermatology', 'Dr.'),
('34567890123', 'Pediatrics', 'Dr.'),
('45678901234', 'Neurology', 'Dr.'),
('56789012345', 'Orthopedics', 'Dr.'),
('32121212324', 'General Practice', 'Dr.'),
('32121212325', 'Endocrinology', 'Dr.'),
('32121212326', 'Gastroenterology', 'Dr.'),
('32121212327', 'Psychiatry', 'Dr.'),
('32121212328', 'Ophthalmology', 'Dr.');

INSERT INTO patients (patient_pesel, allergies, chronic_conditions) VALUES
('12345678901', 'Penicillin', 'Asthma'),
('23456789012', 'None', 'Diabetes'),
('34567890123', 'Peanuts', 'Hypertension'),
('45678901234', 'None', 'None'),
('56789012345', 'Shellfish', 'None'),
('32121212324', 'None', 'None'),
('32121212325', 'None', 'None'),
('32121212326', 'None', 'None'),
('32121212327', 'None', 'None'),
('32121212328', 'None', 'None');

INSERT INTO appointments (date_time, doctor_pesel, patient_pesel, status, notes, room_number) VALUES 
('2023-10-01 10:00:00', '12345678901', '12345678901', 'scheduled', 'Initial consultation', '101'), 
('2023-10-02 11:00:00', '23456789012', '23456789012', 'completed', 'Follow-up visit', '102'), 
('2023-10-03 12:00:00', '34567890123', '34567890123', 'canceled', 'Patient rescheduled', '103'), 
('2023-10-04 13:00:00', '45678901234', '45678901234', 'scheduled', 'Routine check-up', '104'), 
('2023-10-05 14:00:00', '56789012345', '56789012345', 'completed', 'Post-surgery follow-up', '105');

INSERT INTO prescriptions (appointment_id, medication, dosage, instructions) VALUES
(1, 'Aspirin', '100mg', 'Take once daily after meal'),
(2, 'Ibuprofen', '200mg', 'Take every 6 hours if needed'),
(3, 'Amoxicillin', '500mg', 'Take 3 times daily for 7 days'),
(4, 'Lisinopril', '10mg', 'Take once daily'),
(5, 'Metformin', '500mg', 'Take with breakfast and dinner');

