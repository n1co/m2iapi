const db = require("../database/database")

class User {
    static getAll(callback) {
        db.get("SELECT * FROM users", [], callback); //mauvaise pratique * et pas de limit
    }

    static getById(id, callback) {
        db.get("SELECT * FROM users WHERE id = ?", [id], callback)
    }

    static create(name, email, callback) {
        db.run(
            "INSERT INTO users (name, email) VALUES (?,?)",
            [name,email],
            function (err) {
                callback(err, this.lastId)
            },
        );   
    }

    static update(id, name, email, callback) {
        db.run(
            "UPDATE users SET name = ?, email = ? WHERE id = ?",
            [name, email, id],
            callback,
        );
    }

    static delete(id, callback) {
        db.run("DELETE FROM users WHERE id = ?", [id], callback)
    }
}

module.exports = User;