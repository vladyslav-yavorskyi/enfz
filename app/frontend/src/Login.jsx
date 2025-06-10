import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
} from '@mui/material';

function Login() {
    const [pesel, setPesel] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('pacjent');
    const [status, setStatus] = useState(null);
    const [message, setMessage] = useState('');

    const navigate = useNavigate(); // <-- hook do nawigacji

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/login', {
                pesel,
                password,
                role,
            });
            setStatus('success');
            setMessage(res.data.message);

            // po udanym logowaniu przekierowanie:
            if (role === 'pacjent') {
                navigate(`/pacjent/${pesel}`); // zmień na swoją ścieżkę dla pacjenta
            } else if (role === 'lekarz') {
                navigate(`/lekarz?pesel=${pesel}`); // ścieżka dla lekarza
            }
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Wystąpił błąd. Spróbuj ponownie.');
        }
    };

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    marginTop: 8,
                    padding: 4,
                    boxShadow: 3,
                    borderRadius: 2,
                    textAlign: 'center',
                }}
            >
                <Typography variant="h4" gutterBottom>
                    Login
                </Typography>

                {status && (
                    <Alert severity={status} sx={{ mb: 2 }}>
                        {message}
                    </Alert>
                )}

                <form onSubmit={handleLogin}>
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="role-label">Rola</InputLabel>
                        <Select
                            labelId="role-label"
                            id="role"
                            value={role}
                            label="Rola"
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <MenuItem value="pacjent">Pacjent</MenuItem>
                            <MenuItem value="lekarz">Lekarz</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        fullWidth
                        margin="normal"
                        label="PESEL"
                        type="text"
                        required
                        value={pesel}
                        onChange={(e) => setPesel(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Hasło"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2 }}
                    >
                        Zaloguj się
                    </Button>
                </form>
            </Box>
        </Container>
    );
}

export default Login;
