import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import PacjentDashboard from './PacjentDashboard';
import AppointmentForm from './LekarzDashboard';
import LekarzDashboard from './Lekarz';
import PatientAppointments from './Pacjent';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/visit/:id" element={<AppointmentForm />} />
                <Route path="/pacjent/:pesel" element={<PacjentDashboard />} />
                <Route path="/" element={<Login />} />
                <Route path="/lekarz" element={<LekarzDashboard />} />
                <Route path="/pacjent/:pesel/appointments" element={<PatientAppointments />} />
            </Routes>
        </Router>
    );
}

export default App;
