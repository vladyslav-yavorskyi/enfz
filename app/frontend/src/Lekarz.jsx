import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Card,
    CardContent,
    Grid,
    List,
    ListItem,
    ListItemText,
    Divider,
    Box,
    Paper,
} from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { pl } from 'date-fns/locale';
import format from 'date-fns/format';
import { Link } from 'react-router-dom';

export default function DoctorDashboard() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [filteredVisits, setFilteredVisits] = useState([]);
    const [doctorName, setDoctorName] = useState('');
    const [pesel, setPesel] = useState('');
    const [count, setCount] = useState(0);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const peselFromUrl = urlParams.get('pesel');
        if (peselFromUrl) {
            setPesel(peselFromUrl);
        }
    }, []);

    useEffect(() => {
        if (!pesel) return;
        const getVisits = async () => {
            try {
                const response = await fetch(
                    `http://localhost:5000/visits?pesel=${pesel}&date=${
                        selectedDate.toISOString().split('T')[0]
                    }`
                );
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const visits = await response.json();
                console.log('Fetched visits:', visits);
                setFilteredVisits(visits);
            } catch (error) {
                console.error('Error fetching visits:', error);
            }
        };

        const getName = async () => {
            try {
                console.log(`http://localhost:5000/name?pesel=${pesel.trim()}`);
                const response = await fetch(`http://localhost:5000/name?pesel=${pesel.trim()}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                console.log('Fetched doctor name:', data);
                setDoctorName(data.imię + ' ' + data.nazwisko);
            } catch (error) {
                console.error('Error fetching patient name:', error);
            }
        };

        const getCount = async () => {
            try {
                const response = await fetch(
                    `http://localhost:5000/count?pesel=${pesel}&date=${
                        new Date().toISOString().split('T')[0]
                    }`
                );
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                console.log('Fetched count:', data);
                setCount(data.count);
            } catch (error) {
                console.error('Error fetching count:', error);
            }
        };

        getVisits();
        getName();
        getCount();
    }, [selectedDate, pesel]);

    return (
        <Container maxWidth="md" sx={{ py: 5 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Panel lekarza
                </Typography>

                <Typography variant="h6" gutterBottom color="primary">
                    Lekarz prowadzący: {doctorName || 'Nie wybrano lekarza'}
                </Typography>

                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <Card sx={{ backgroundColor: '#e3f2fd' }}>
                            <CardContent>
                                <Typography variant="h6">Liczba wizyt dziś:</Typography>
                                <Typography variant="h3" color="primary">
                                    {count}
                                </Typography>
                            </CardContent>
                        </Card>

                        <Box mt={4}>
                            <Typography variant="h6">
                                Lista wizyt: {format(selectedDate, 'PPP', { locale: pl })}
                            </Typography>

                            {filteredVisits.length === 0 ? (
                                <Typography>Brak wizyt w wybranym dniu.</Typography>
                            ) : (
                                <List>
                                    {filteredVisits.map((visit) => (
                                        <Box key={visit.id_wizyty}>
                                            <ListItem
                                                button
                                                component={Link}
                                                to={`/visit/${visit.id_wizyty}`}
                                            >
                                                <Typography>
                                                    {visit.pacjent_imie} {visit.pacjent_nazwisko} —{' '}
                                                    {visit.czas}
                                                </Typography>
                                            </ListItem>
                                            <Divider />
                                        </Box>
                                    ))}
                                </List>
                            )}
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={pl}>
                            <DateCalendar
                                value={selectedDate}
                                onChange={(newDate) => setSelectedDate(newDate)}
                            />
                        </LocalizationProvider>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
}
