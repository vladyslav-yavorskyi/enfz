import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Box,
    Button,
} from '@mui/material';

export default function PatientAppointments() {
    const { pesel } = useParams();
    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        if (!pesel) return;
        fetch(`http://localhost:5000/patient-appointments?pesel=${pesel}`)
            .then((res) => res.json())
            .then(setAppointments)
            .catch((err) => {
                console.error('Error fetching appointments:', err);
            });
    }, [pesel]);

    return (
        <Container maxWidth="md" sx={{ py: 5 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                <Box textAlign="right" mb={2}>
                    <Button
                        component={Link}
                        to={`/pacjent/${pesel}`}
                        variant="contained"
                        color="primary"
                    >
                        Umów wizytę
                    </Button>
                </Box>
                <Typography variant="h4" gutterBottom>
                    Twoje wizyty
                </Typography>
                {appointments.length === 0 ? (
                    <Typography>Brak umówionych wizyt.</Typography>
                ) : (
                    <TableContainer component={Box} sx={{ mt: 3 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Data</TableCell>
                                    <TableCell>Godzina</TableCell>
                                    <TableCell>Lekarz</TableCell>
                                    <TableCell>Specjalizacja</TableCell>
                                    <TableCell>Szczegóły</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {appointments.map((appt) => (
                                    <TableRow key={appt.id_wizyty}>
                                        <TableCell>{appt.data}</TableCell>
                                        <TableCell>{appt.czas}</TableCell>
                                        <TableCell>
                                            {appt.lekarz_imie} {appt.lekarz_nazwisko}
                                        </TableCell>
                                        <TableCell>{appt.specjalizacja}</TableCell>
                                        <TableCell>
                                            <Button
                                                component={Link}
                                                to={`/visit/${appt.id_wizyty}`}
                                                variant="outlined"
                                                size="small"
                                            >
                                                Szczegóły
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
        </Container>
    );
}
