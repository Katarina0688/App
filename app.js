const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const mysql = require('mysql2');
const session = require('express-session');
const multer = require('multer'); // Za upload slika

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Define the storage configuration for Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/'); // Set upload directory
    },
    filename: (req, file, cb) => {
        // Extract file extension
        const ext = path.extname(file.originalname);
        // Generate a unique filename
        const filename = `${Date.now()}${ext}`;
        cb(null, filename); // Save file with unique name and extension
    }
});

// Initialize multer with the storage configuration
const upload = multer({ storage: storage });

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'katalog_automobila'
});

app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

// Middleware za autentifikaciju
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    res.redirect('/login');
};

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to the database');
});

// Rute za profil
app.get('/profile', isAuthenticated, (req, res) => {
    const userId = req.session.user.u_id;
    db.query('SELECT * FROM car_c WHERE c_user_id = ?', [userId], (err, cars) => {
        if (err) throw err;
        console.log(cars)
        res.render('profile', { cars });
    });
});

app.get('/profile/add-car', isAuthenticated, (req, res) => {
    res.render('add-car');
});

app.post('/profile/add-car', isAuthenticated, upload.single('image'), (req, res) => {
    const { title, link, video } = req.body;
    const imagePath = req.file ? path.basename(req.file.path) : ''; // Uzmi samo ime fajla
    const userId = req.session.user.u_id;

    db.query('INSERT INTO car_c (c_user_id, c_title, c_image_path, c_link, c_video) VALUES (?, ?, ?, ?, ?)', [userId, title, imagePath, link, video], (err) => {
        if (err) throw err;
        res.redirect('/profile');
    });
});

app.post('/profile/edit-car/:id', isAuthenticated, upload.single('image'), (req, res) => {
    const carId = req.params.id;
    const { title, link, video } = req.body;
    const imagePath = req.file ? path.basename(req.file.path) : ''; // Uzmi samo ime fajla

    db.query('UPDATE car_c SET c_title = ?, c_image_path = ?, c_link = ?, c_video = ? WHERE c_id = ?', [title, imagePath, link, video, carId], (err) => {
        if (err) throw err;
        res.redirect('/profile');
    });
});

app.get('/profile/edit-car/:id', isAuthenticated, (req, res) => {
    const carId = req.params.id;

    db.query('SELECT * FROM car_c WHERE c_id = ?', [carId], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Server Error');
            return;
        }

        if (results.length === 0) {
            res.status(404).send('Car not found');
            return;
        }

        res.render('edit-car', { car: results[0] });
    });
});

app.post('/profile/edit-car/:id', isAuthenticated, upload.single('image'), (req, res) => {
    const carId = req.params.id;
    const { title, link, video } = req.body;
    const imagePath = req.file ? req.file.path : '';

    db.query('UPDATE car_c SET c_title = ?, c_image_path = ?, c_link = ?, c_video = ? WHERE c_id = ?', [title, imagePath, link, video, carId], (err) => {
        if (err) throw err;
        res.redirect('/profile');
    });
});

app.post('/profile/delete-car/:id', isAuthenticated, (req, res) => {
    const carId = req.params.id;
    db.query('DELETE FROM car_c WHERE c_id = ?', [carId], (err) => {
        if (err) throw err;
        res.redirect('/profile');
    });
});

app.get('/api/check-email', (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ error: 'Email je obavezan.' });
    }

    const query = 'SELECT COUNT(*) AS count FROM user_u WHERE u_email = ?';
    db.query(query, [email], (err, result) => {
        if (err) throw err;

        if (result[0].count > 0) {
            res.json({ available: false, message: 'Email je već zauzet.' });
        } else {
            res.json({ available: true });
        }
    });
});

app.get('/api/check-username', (req, res) => {
    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ error: 'Korisničko ime je obavezno.' });
    }

    const query = 'SELECT COUNT(*) AS count FROM user_u WHERE u_username = ?';
    db.query(query, [username], (err, result) => {
        if (err) throw err;

        if (result[0].count > 0) {
            res.json({ available: false, message: 'Korisničko ime je već zauzeto.' });
        } else {
            res.json({ available: true });
        }
    });
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT * FROM user_u WHERE u_username = ? AND u_password = ?';

    db.query(query, [username, password], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            req.session.user = results[0];
            res.redirect('/');
        } else {
            res.send('Invalid username or password');
        }
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) throw err;
        res.redirect('/');
    });
});

app.get('/register', (req, res) => {
    res.render('register', {});
});

app.post('/register', async (req, res) => {
    const { username, email, name, last_name, password } = req.body;

    const nameRegex = /^[a-zA-Z]+$/;
    const usernameRegex = /^.{8,}$/; // Minimum 8 karaktera
    const passwordRegex = /^.{8,}$/; // Minimum 8 karaktera
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Validan email format

    // Proveri validnost podataka
    if (!nameRegex.test(name) || !nameRegex.test(last_name)) {
        return res.status(400).send('Ime i prezime moraju sadržavati samo slova.');
    }

    if (!usernameRegex.test(username)) {
        return res.status(400).send('Korisničko ime mora imati najmanje 8 karaktera.');
    }

    if (!emailRegex.test(email)) {
        return res.status(400).send('Nevalidan email format.');
    }

    if (!passwordRegex.test(password)) {
        return res.status(400).send('Lozinka mora imati najmanje 8 karaktera.');
    }

    const query = `INSERT INTO user_u (u_username, u_email, u_name, u_last_name, u_password, u_created_at) VALUES (?, ?, ?, ?, ?, NOW())`;
    db.query(query, [username, email, name, last_name, password], (err, result) => {
        if (err) throw err;
        res.redirect('/login');
    });
});

app.get('/', (req, res) => {
    res.render('index', {});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server je pokrenut na portu ${PORT}`);
});
