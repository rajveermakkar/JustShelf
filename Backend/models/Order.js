class Order {
    constructor(id, userId, items, totalAmount, status = 'pending', shippingAddress, paymentMethod, createdAt = new Date().toISOString()) {
        this.id = id;
        this.userId = userId;
        this.items = items; // Array of {bookId, quantity, price}
        this.totalAmount = totalAmount;
        this.status = status; // pending, processing, shipped, delivered, cancelled
        this.shippingAddress = shippingAddress;
        this.paymentMethod = paymentMethod;
        this.createdAt = createdAt;
    }
}

module.exports = Order; 