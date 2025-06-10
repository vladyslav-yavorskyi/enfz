import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Box, Paper, Button } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs from 'dayjs';
import { useParams, Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

export default function AppointmentScheduler() {
    const { pesel } = useParams();
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [selectedTime, setSelectedTime] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:5000/available-doctors?date=${selectedDate.format('YYYY-MM-DD')}`)
            .then((res) => res.json())
            .then((data) => {
                setDoctors(data);
                if (data.length > 0) {
                    setSelectedDoctor(data[0]); // Automatically select the first doctor
                } else {
                    setSelectedDoctor(null);
                }
            });
    }, [selectedDate]);

    useEffect(() => {
        if (selectedDoctor) {
            fetch(
                `http://127.0.0.1:5000/available-timeslots?date=${selectedDate.format(
                    'YYYY-MM-DD'
                )}&doctor=${selectedDoctor.pesel}`
            )
                .then((res) => res.json())
                .then(setAvailableTimes);
        }
    }, [selectedDoctor, selectedDate]);

    const handleSignUp = () => {
        if (!selectedDoctor || !selectedTime || !selectedDate) {
            alert('Wybierz lekarza, godzinę i datę!');
            return;
        }
        console.log({
            pesel_pacjenta: pesel,
            pesel_lekarza: selectedDoctor.pesel,
            data: selectedDate.format('YYYY-MM-DD'),
            czas: selectedTime,
        });

        fetch('http://localhost:5000/api/appointment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                pesel_pacjenta: pesel, // use pesel from URL
                pesel_lekarza: selectedDoctor.pesel,
                data: selectedDate.format('YYYY-MM-DD'),
                czas: selectedTime,
            }),
        })
            .then((res) => {
                if (!res.ok) throw new Error('Błąd podczas rejestracji wizyty');
                return res.json();
            })
            .then((data) => {
                alert('Wizyta została umówiona pomyślnie!');
                navigate(`/pacjent/${pesel}/appointments`);
            })
            .catch((err) => {
                alert('Nie udało się umówić wizyty: ' + err.message);
            });
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Container sx={{ py: 5 }}>
                <Paper elevation={3} sx={{ borderRadius: 4, p: 4 }}>
                    <Box display="flex" gap={4} flexDirection={{ xs: 'column', md: 'row' }}>
                        {/* LEFT COLUMN - CALENDAR */}
                        <Box flex={1}>
                            <Typography variant="h5" gutterBottom>
                                Kalendarz
                            </Typography>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    border: '1px solid #ccc',
                                    borderRadius: 2,
                                    p: 3,
                                }}
                            >
                                <CalendarMonthIcon sx={{ fontSize: 64, mb: 2 }} />
                                <DateCalendar
                                    value={selectedDate}
                                    onChange={(newDate) => setSelectedDate(newDate)}
                                />
                                <Typography variant="body1" mt={2}>
                                    Wybrana data: {selectedDate.format('D MMMM YYYY')}
                                </Typography>
                            </Box>

                            <Box mt={4}>
                                <Typography variant="h6">Rekomendacja</Typography>
                                <Paper elevation={1} sx={{ p: 2, mt: 1 }}>
                                    <Typography variant="body2">
                                        Wizyta kontrolna u dentysty
                                    </Typography>
                                    <Typography variant="caption">
                                        8 Kwiecień, 2021 | 16:00
                                    </Typography>
                                </Paper>
                            </Box>
                        </Box>

                        {/* RIGHT COLUMN - SPECIALIST & TIME */}
                        <Box flex={2}>
                            <Typography variant="h5" gutterBottom>
                                Wybierz specjalistę
                            </Typography>
                            <Grid container spacing={2}>
                                {doctors.map((doc) => (
                                    <Grid item xs={6} sm={4} key={doc.pesel}>
                                        <Button
                                            fullWidth
                                            variant={
                                                selectedDoctor?.pesel === doc.pesel
                                                    ? 'contained'
                                                    : 'outlined'
                                            }
                                            onClick={() => setSelectedDoctor(doc)}
                                        >
                                            {doc.imie} {doc.nazwisko} ({doc.specjalizacja})
                                        </Button>
                                    </Grid>
                                ))}
                            </Grid>
                            <Typography variant="h6" mt={4}>
                                Wybierz dostępną godzinę
                            </Typography>
                            <Grid container spacing={1}>
                                {!availableTimes.length
                                    ? 'brak'
                                    : availableTimes.map((slot) => (
                                          <Grid item xs={4} sm={2} key={slot}>
                                              <Button
                                                  fullWidth
                                                  variant={
                                                      selectedTime === slot
                                                          ? 'contained'
                                                          : 'outlined'
                                                  }
                                                  onClick={() => setSelectedTime(slot)}
                                              >
                                                  {slot}
                                              </Button>
                                          </Grid>
                                      ))}
                            </Grid>

                            <Box textAlign="right" mt={4}>
                                <Button variant="contained" size="large" onClick={handleSignUp}>
                                    UMÓW SIĘ NA WIZYTĘ
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                    <Box textAlign="right" mb={2}>
                        <Button
                            component={Link}
                            to={`/pacjent/${pesel}/appointments`}
                            variant="outlined"
                            color="primary"
                        >
                            Twoje wizyty
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </LocalizationProvider>
    );
}
