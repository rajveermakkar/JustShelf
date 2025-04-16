class Book {
    constructor(id, title, author, description, price, imageUrl, stockQuantity, category) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.description = description;
        this.price = price;
        this.imageUrl = imageUrl;
        this.stockQuantity = stockQuantity;
        this.category = category;
    }

    // Convert to database format
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            author: this.author,
            description: this.description,
            price: this.price,
            image_url: this.imageUrl,
            stock_quantity: this.stockQuantity,
            category: this.category
        };
    }

    // Create from plain object
    static fromJSON(data) {
        return new Book(
            data.id,
            data.title,
            data.author,
            data.description,
            data.price,
            data.image_url,
            data.stock_quantity,
            data.category
        );
    }
}

module.exports = Book;