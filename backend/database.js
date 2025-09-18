const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'connexa.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to SQLite database');
    
    // Create users table if it doesn't exist
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            UNIQUE(email COLLATE NOCASE)
        )`, (err) => {
            if (err) {
                console.error('Error creating users table:', err);
                return;
            }
            console.log('Users table ready');
        });

        // Create an index on email for faster lookups
        db.run(`CREATE INDEX IF NOT EXISTS idx_users_email 
                ON users(email COLLATE NOCASE)`, (err) => {
            if (err) {
                console.error('Error creating email index:', err);
                return;
            }
            console.log('Email index ready');
        });
    });
});

module.exports = db;