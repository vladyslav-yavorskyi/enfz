import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    TextField,
    Grid,
    Box,
    Paper,
    MenuItem,
    Button,
} from '@mui/material';
import { useParams, Link } from 'react-router-dom';

export default function AppointmentForm() {
    const [formData, setFormData] = useState({
        wywiad: '',
        rozpoznanie: '',
        zalecenia: '',
    });
    const [doctorName, setDoctorName] = useState('');
    const [imiePatient, setImiePatient] = useState('');
    const [nazwiskoPatient, setNazwiskoPatient] = useState('');
    const [peselPatient, setPeselPatient] = useState('');
    const [doctorPesel, setDoctorPesel] = useState('');

    const { id } = useParams();
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    useEffect(() => {
        const fetchVisitData = async () => {
            try {
                const response = await fetch(`http://localhost:5000/visit/${id}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                console.log('Fetched visit data:', data);
                setFormData({
                    wywiad: data.notatki || '',
                    rozpoznanie: data.rozpoznanie || '',
                    zalecenia: data.zalecenia || '',
                });
                setDoctorName(data.lekarz || '');
                setImiePatient(data.pacjent_imie || '');
                setNazwiskoPatient(data.pacjent_nazwisko || '');
                setPeselPatient(data.pacjent_pesel || '');
                setDoctorName(data.lekarz_imie + ' ' + data.lekarz_nazwisko);
                setDoctorPesel(data.lekarz_pesel || '');
            } catch (error) {
                console.error('Error fetching visit data:', error);
            }
        };

        fetchVisitData();
    }, [id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Dane formularza:', formData);
        fetch(`http://localhost:5000/update-visit/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                rozpoznanie: formData.rozpoznanie,
                zalecenia: formData.zalecenia,
                notatki: formData.wywiad,
                id_wizyty: id,
            }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                console.log('Wizyta zaktualizowana:', data);
                alert('Wizyta została zaktualizowana pomyślnie!');
            })
            .catch((error) => {
                console.error('Błąd podczas aktualizacji wizyty:', error);
                alert('Wystąpił błąd podczas aktualizacji wizyty.');
            });
    };

    return (
        <Container maxWidth="md" sx={{ py: 5 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                <Box textAlign="right" mb={2}>
                    <Button
                        component={Link}
                        to={`/lekarz?pesel=${doctorPesel}`}
                        variant="outlined"
                        color="primary"
                    >
                        Powrót do panelu lekarza
                    </Button>
                </Box>
                <Typography variant="h4" gutterBottom>
                    Wizyta lekarska
                </Typography>

                <Typography variant="h6" gutterBottom color="primary">
                    Lekarz prowadzący: {doctorName}
                    Id wizyty: {id}
                </Typography>

                <Box component="form" onSubmit={handleSubmit} mt={4}>
                    <Typography variant="h6" gutterBottom>
                        Dane pacjenta
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={3}>
                            <Typography>{peselPatient}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <Typography>{imiePatient}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <Typography>{nazwiskoPatient}</Typography>
                        </Grid>
                    </Grid>

                    <Box mt={4}>
                        <Typography variant="h6">Wywiad</Typography>
                        <TextField
                            fullWidth
                            name="wywiad"
                            value={formData.wywiad}
                            onChange={handleChange}
                            multiline
                            minRows={4}
                            placeholder="Wprowadź wywiad z pacjentem..."
                        />
                    </Box>

                    <Box mt={4}>
                        <Typography variant="h6">Rozpoznanie</Typography>
                        <TextField
                            fullWidth
                            name="rozpoznanie"
                            value={formData.rozpoznanie}
                            onChange={handleChange}
                            multiline
                            minRows={2}
                            placeholder="Rozpoznanie lekarskie..."
                        />
                    </Box>

                    <Box mt={4}>
                        <Typography variant="h6">Zalecenia</Typography>
                        <TextField
                            fullWidth
                            name="zalecenia"
                            value={formData.zalecenia}
                            onChange={handleChange}
                            multiline
                            minRows={3}
                            placeholder="Zalecenia dla pacjenta..."
                        />
                    </Box>

                    <Box textAlign="right" mt={4}>
                        <Button type="submit" variant="contained" size="large">
                            Zapisz wizytę
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
}
