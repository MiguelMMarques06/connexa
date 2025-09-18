const db = require('../../database');

class UserService {
    static async findByEmail(email) {
        return new Promise((resolve, reject) => {
            // Case-insensitive email search
            db.get(
                'SELECT * FROM users WHERE LOWER(email) = LOWER(?)', 
                [email],
                (err, row) => {
                    if (err) {
                        console.error('Database error when checking email:', err);
                        reject(new Error('Database error when checking email'));
                    }
                    resolve(row);
                }
            );
        });
    }

    static async createUser(name, email, passwordHash) {
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
                [name, email, passwordHash],
                function(err) {
                    if (err) {
                        // Check for unique constraint violation
                        if (err.code === 'SQLITE_CONSTRAINT') {
                            reject(new Error('Email already exists'));
                        } else {
                            console.error('Database error when creating user:', err);
                            reject(new Error('Error creating user'));
                        }
                        return;
                    }
                    resolve(this.lastID);
                }
            );
        });
    }
}

module.exports = UserService;