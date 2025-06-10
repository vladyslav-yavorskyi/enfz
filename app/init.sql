DROP TABLE IF EXISTS kartoteki_medyczne, recepty, wizyty, pacjenci, lekarze, użytkownicy, terminy_wizyt, dokumnetacja_medyczna CASCADE;

CREATE TABLE użytkownicy (
    pesel VARCHAR(11) PRIMARY KEY,
    imię VARCHAR(50) NOT NULL,
    nazwisko VARCHAR(50) NOT NULL,
    adres VARCHAR(100), 
    płeć CHAR(1) CHECK (płeć IN ('M', 'K')),
    numer_telefonu VARCHAR(15),
    hasło VARCHAR(255) NOT NULL
);

CREATE TABLE lekarze (
    pesel_lekarza VARCHAR(11) PRIMARY KEY REFERENCES użytkownicy(pesel) ON DELETE CASCADE,
    specjalizacja VARCHAR(50) NOT NULL,
    tytuł VARCHAR(50) NOT NULL,
    numer_gabinetu VARCHAR(10) NOT NULL
);

CREATE TABLE pacjenci (
    pesel_pacjenta VARCHAR(11) PRIMARY KEY REFERENCES użytkownicy(pesel) ON DELETE CASCADE,
    telefon_pełnomocnika INT DEFAULT 0
);

CREATE TABLE dokumnetacja_medyczna (
    id_dokumentacji SERIAL PRIMARY KEY,
    pesel_pacjenta VARCHAR(11) REFERENCES pacjenci(pesel_pacjenta) ON DELETE CASCADE,
    alergie TEXT,
    choroby_przewlekłe TEXT,
    operacje TEXT,
    grupa_krwi VARCHAR(3)
);


CREATE TABLE wizyty (
    id_wizyty SERIAL PRIMARY KEY,
    data DATE NOT NULL, 
    czas TIME NOT NULL,
    pesel_lekarza VARCHAR(11) REFERENCES lekarze(pesel_lekarza),
    pesel_pacjenta VARCHAR(11) REFERENCES pacjenci(pesel_pacjenta),
    rozpoznanie TEXT,
    notatki TEXT,
    czy_zrealizowana BOOLEAN NOT NULL DEFAULT FALSE,
    zalecenia TEXT
);

CREATE TABLE recepty (
    id_recepty SERIAL PRIMARY KEY,
    id_wizyty INT REFERENCES wizyty(id_wizyty) ON DELETE CASCADE,
    opis_leku VARCHAR(100) NOT NULL
);

CREATE TABLE terminy_wizyt (
    pesel_lekarza VARCHAR(11) REFERENCES lekarze(pesel_lekarza) ON DELETE CASCADE,
    data_dostępności DATE NOT NULL,
    godzina_rozpoczęcia TIME NOT NULL,
    czy_dostępny BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (pesel_lekarza, data_dostępności, godzina_rozpoczęcia)
);

-- Przykładowe dane
INSERT INTO użytkownicy (pesel, imię, nazwisko, adres, płeć, numer_telefonu, hasło) VALUES
('12345678901', 'Jan', 'Kowalski', 'ul. Główna 123, Miasto, Polska', 'M', '123-456-789', 'haslo_zaszyfrowane_1'),
('23456789012', 'Anna', 'Nowak', 'ul. Klonowa 456, Miasto, Polska', 'K', '234-567-890', 'haslo_zaszyfrowane_2'),
('11111111111', 'Piotr', 'Zieliński', 'ul. Lipowa 321, Miasto, Polska', 'M', '111-222-333', 'haslo_zaszyfrowane_1'),
('34567890123', 'Alicja', 'Wiśniewska', 'ul. Dębowa 789, Miasto, Polska', 'K', '345-678-901', 'haslo_zaszyfrowane_3'),
('45678901234', 'Robert', 'Wójcik', 'ul. Sosnowa 101, Miasto, Polska', 'M', '456-789-012', 'haslo_zaszyfrowane_4'), 
('56789012345', 'Karol', 'Krawczyk', 'ul. Klonowa 202, Miasto, Polska', 'M', '567-890-123', 'haslo_zaszyfrowane_5'),
('32121212324', 'Ewa', 'Wilk', 'ul. Cedrowa 303, Miasto, Polska', 'K', '678-901-234', 'haslo_zaszyfrowane_6'),
('32121212325', 'Franciszek', 'Milewski', 'ul. Brzozowa 404, Miasto, Polska', 'M', '789-012-345', 'haslo_zaszyfrowane_7'),
('32121212326', 'Grażyna', 'Lis', 'ul. Świerkowa 505, Miasto, Polska', 'K', '890-123-456', 'haslo_zaszyfrowane_8'),
('32121212327', 'Henryk', 'Kim', 'ul. Jodłowa 606, Miasto, Polska', 'M', '901-234-567', 'haslo_zaszyfrowane_9'),
('32121212328', 'Iwona', 'Park', 'ul. Jesionowa 707, Miasto, Polska', 'K', '012-345-678', 'haslo_zaszyfrowane_10');

INSERT INTO lekarze (pesel_lekarza, specjalizacja, tytuł, numer_gabinetu) VALUES
('12345678901', 'Kardiologia', 'Dr', '101'),
('23456789012', 'Dermatologia', 'Dr', '102'),
('34567890123', 'Pediatria', 'Dr', '103'),
('45678901234', 'Neurologia', 'Dr', '104'),
('56789012345', 'Ortopedia', 'Dr', '105'),
('32121212324', 'Medycyna rodzinna', 'Dr', '106'),
('32121212325', 'Endokrynologia', 'Dr', '107'),
('32121212326', 'Gastroenterologia', 'Dr', '108'),
('32121212327', 'Psychiatria', 'Dr', '109'),
('11111111111', 'Chirurgia', 'Dr', '110'),
('32121212328', 'Okulistyka', 'Dr', '110');

INSERT INTO pacjenci (pesel_pacjenta, telefon_pełnomocnika) VALUES
('12345678901', 123456789),
('23456789012', 234567890),
('34567890123', 345678901),
('45678901234', 456789012),
('56789012345', 567890123),
('32121212324', 678901234),
('32121212325', 789012345),
('32121212326', 890123456),
('32121212327', 901234567),
('32121212328', 12345678);

INSERT INTO wizyty (data, czas, pesel_lekarza, pesel_pacjenta, rozpoznanie, czy_zrealizowana, notatki, zalecenia) VALUES
('2025-06-10', '09:00:00', '12345678901', '12345678901', 'Ból w klatce piersiowej', TRUE, 'Pacjent zgłosił ból w klatce piersiowej.', 'Zalecane wykonanie EKG i badania krwi.'),
('2025-06-09', '10:00:00', '11111111111', '23456789012', NULL, FALSE, NULL, NULL),
('2025-06-09', '12:00:00', '11111111111', '12345678901', NULL, FALSE, NULL, NULL),
('2025-06-10', '10:00:00', '11111111111', '23456789012', NULL, FALSE, NULL, NULL),
('2025-06-10', '11:00:00', '11111111111', '23456789012', NULL, FALSE, NULL, NULL),
('2025-06-10', '12:00:00', '11111111111', '23456789012', NULL, FALSE, NULL, NULL),
('2025-06-10', '13:00:00', '11111111111', '23456789012', NULL, FALSE, NULL, NULL),
('2025-06-11', '11:00:00', '11111111111', '12345678901', NULL, FALSE, NULL, NULL),
('2025-06-11', '10:00:00', '23456789012', '23456789012', NULL, FALSE, NULL, NULL),
('2025-06-11', '11:00:00', '34567890123', '34567890123', 'Przeziębienie', TRUE, 'Pacjent ma objawy przeziębienia.', 'Zalecane picie dużej ilości płynów i odpoczynek.'),
('2025-06-09', '12:00:00', '45678901234', '45678901234', 'Ból głowy', TRUE, 'Pacjent zgłasza silny ból głowy.', 'Zalecane przyjmowanie leków przeciwbólowych.'),
('2025-06-11', '13:00:00', '56789012345', '56789012345', 'Ból kolana po urazie sportowym', TRUE, 'Pacjent doznał urazu kolana podczas gry w piłkę nożną.', 'Zalecane unikanie obciążania kolana i stosowanie lodu.');

INSERT INTO dokumnetacja_medyczna (pesel_pacjenta, alergie, choroby_przewlekłe, operacje, grupa_krwi) VALUES
('12345678901', 'Brak', 'Brak', 'Wycięcie wyrostka robaczkowego', 'O+'),
('23456789012', 'Orzeszki ziemne', 'Astma', 'Wycięcie migdałków', 'A-'),
('34567890123', 'Brak', 'Brak', 'Brak', 'B+'),
('45678901234', 'Roztocza', 'Nadciśnienie', 'Usunięcie pęcherzyka żółciowego', 'AB-'),
('56789012345', 'Brak', 'Cukrzyca', 'Operacja kolana', 'O-');

INSERT INTO recepty (id_wizyty, opis_leku) VALUES
(1, 'Paracetamol 500mg - 3 razy dziennie przez 5 dni'),
(2, 'Hydrokortyzon 1% - stosować na skórę 2 razy dziennie'),
(3, 'Ibuprofen 400mg - co 8 godzin w razie bólu'),
(4, 'Sumatriptan 50mg - w razie ataku migreny'),
(5, 'Naproksen 250mg - 2 razy dziennie przez tydzień');


INSERT INTO terminy_wizyt (pesel_lekarza, data_dostępności, godzina_rozpoczęcia, czy_dostępny) VALUES
('12345678901', '2025-06-10', '09:00:00', TRUE),
('12345678901', '2025-06-11', '10:00:00', FALSE),
('23456789012', '2025-06-11', '11:00:00', TRUE),
('34567890123', '2025-06-09', '12:00:00', TRUE),
('45678901234', '2025-06-11', '13:00:00', TRUE),
('11111111111', '2025-06-09', '08:00:00', TRUE),
('11111111111', '2025-06-09', '09:00:00', TRUE),
('11111111111', '2025-06-09', '10:00:00', TRUE),
('11111111111', '2025-06-09', '11:00:00', TRUE),
('11111111111', '2025-06-10', '08:00:00', TRUE),
('11111111111', '2025-06-10', '09:00:00', TRUE),
('11111111111', '2025-06-10', '10:00:00', TRUE),
('11111111111', '2025-06-10', '11:00:00', TRUE),
('56789012345', '2025-06-10', '14:00:00', TRUE);

