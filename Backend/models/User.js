class User {
    constructor(id, email, password, name, role = 'user', address = null, phone = null, createdAt = new Date().toISOString()) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.name = name;
        this.role = role;
        this.address = address;
        this.phone = phone;
        this.createdAt = createdAt;
    }
}

module.exports = User; 