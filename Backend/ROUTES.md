# API Documentation

## Table of Contents
1. [Authentication](#authentication)
2. [Books](#book-routes)
3. [Users](#user-routes)
4. [Orders](#order-routes)
5. [Admin](#admin-routes)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)

## Authentication
All authenticated routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Request Headers
```
{
  "Content-Type": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1..."
}
```

### Authentication Routes
| Route | Method | Description | Auth Required |
|-------|--------|-------------|---------------|
| `/api/auth/register` | POST | Register a new user | No |
| `/api/auth/login` | POST | Login user | No |

#### Register Request Body
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login Request Body
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### Authentication Response
```json
{
  "token": "eyJhbGciOiJIUzI1...",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  }
}
```

## Book Routes
| Route | Method | Description | Auth Required |
|-------|--------|-------------|---------------|
| `/api/books` | GET | Get all books | No |
| `/api/books/search` | GET | Search books | No |
| `/api/books/:id` | GET | Get book by ID | No |
| `/api/books` | POST | Create a new book | Admin |
| `/api/books/:id` | PUT | Update a book | Admin |
| `/api/books/:id` | DELETE | Delete a book | Admin |

#### Create/Update Book Request Body
```json
{
  "title": "Book Title",
  "author": "Author Name",
  "description": "Book description",
  "price": 29.99,
  "image_url": "https://example.com/image.jpg",
  "stock_quantity": 10,
  "category": "Fiction",
  "isbn": "978-3-16-148410-0"
}
```

## User Routes
| Route | Method | Description | Auth Required |
|-------|--------|-------------|---------------|
| `/users/profile` | GET | Get user profile | Yes |
| `/users/profile` | PUT | Update user profile | Yes |
| `/users/addresses` | GET | Get user addresses | Yes |
| `/users/addresses` | POST | Add new address | Yes |
| `/users/addresses/:id` | DELETE | Delete address | Yes |
| `/users/addresses/:id/default` | PUT | Set default address | Yes |

#### Update Profile Request Body
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890"
}
```

#### Add Address Request Body
```json
{
  "addressLine1": "123 Main St",
  "addressLine2": "Apt 4B",
  "city": "New York",
  "state": "NY",
  "postalCode": "10001",
  "country": "USA",
  "isDefault": false
}
```

## Order Routes
| Route | Method | Description | Auth Required |
|-------|--------|-------------|---------------|
| `/api/orders` | POST | Create a new order | Yes |
| `/api/orders` | GET | Get user's orders | Yes |
| `/api/orders/:id` | GET | Get order by ID | Yes |
| `/api/orders/:id/status` | PUT | Update order status | Admin |

#### Create Order Request Body
```json
{
  "items": [
    {
      "bookId": "book_id",
      "quantity": 2
    }
  ],
  "addressId": "address_id",
  "paymentMethod": "card"
}
```

#### Update Order Status Request Body
```json
{
  "status": "processing"
}
```

## Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {} // Optional additional error details
  }
}
```

### Common Error Codes
| Code | Description | HTTP Status |
|------|-------------|-------------|
| INVALID_CREDENTIALS | Invalid email or password | 401 |
| UNAUTHORIZED | Authentication required or invalid token | 401 |
| FORBIDDEN | Insufficient permissions | 403 |
| NOT_FOUND | Resource not found | 404 |
| VALIDATION_ERROR | Invalid request data | 400 |
| INTERNAL_ERROR | Server error | 500 |

## Rate Limiting
- Rate limit: 100 requests per minute per IP
- Admin routes: 300 requests per minute per IP
- Exceeded rate limit response (HTTP 429):
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests, please try again later",
    "retryAfter": 60
  }
}
```

## File Upload
- Maximum file size: 5MB
- Supported formats: JPG, PNG, WebP
- Upload endpoint: POST `/api/upload`
- Required headers:
  ```
  Content-Type: multipart/form-data
  Authorization: Bearer <token>
  ```

## Environment Variables
```env
PORT=3000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret
DATABASE_URL=your_database_url
```

## API Versioning
Current version: v1
Base URL: `/api/v1`

## Testing
Test environment base URL: `http://localhost:3000`
Test user credentials:
```json
{
  "email": "test@example.com",
  "password": "test123"
}
```

## API Routes Documentation

### Query Parameters

#### Book Search
- `q`: Search term
- `category`: Filter by category

#### Admin Users List
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `role`: Filter by role
- `search`: Search by email or name

#### Admin Orders List
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by order status
- `startDate`: Filter orders from date
- `endDate`: Filter orders until date

#### Order Statistics
- `startDate`: Filter statistics from date
- `endDate`: Filter statistics until date

#### Dashboard Statistics
- `startDate`: Filter data from date
- `endDate`: Filter data until date

### Response Examples

#### Book Response
```json
{
  "id": "book_id",
  "title": "Book Title",
  "author": "Author Name",
  "description": "Book description",
  "price": 29.99,
  "image_url": "https://example.com/image.jpg",
  "stock_quantity": 10,
  "category": "Fiction"
}
```

#### Order Response
```json
{
  "id": "order_id",
  "total": 59.98,
  "status": "processing",
  "createdAt": "2024-03-15T10:30:00Z",
  "items": [
    {
      "id": "book_id",
      "price": 29.99,
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "city": "New York",
    "state": "NY",
    "postal_code": "10001",
    "address_line1": "123 Main St"
  }
}
```

#### Order Statistics Response
```json
{
  "totalOrders": 100,
  "totalRevenue": 5000.00,
  "statusCounts": {
    "pending": 20,
    "processing": 30,
    "completed": 50
  },
  "dailyStats": {
    "2024-04-01": {
      "orders": 5,
      "revenue": 250.00
    },
    "2024-04-02": {
      "orders": 8,
      "revenue": 400.00
    }
  }
}
```

#### Dashboard Response
```json
{
  "salesReports": {
    "totalRevenue": 1500.00,
    "totalOrders": 50,
    "averageOrderValue": 30.00,
    "ordersByStatus": {
      "processing": 10,
      "shipped": 30,
      "delivered": 10
    },
    "dailyRevenue": {
      "2024-03-15": 300.00,
      "2024-03-16": 400.00
    }
  },
  "userActivity": {
    "totalUsers": 100,
    "newUsers": 10,
    "activeUsers": 50,
    "usersByRole": {
      "admin": 2,
      "user": 98
    }
  },
  "inventoryStatus": {
    "totalBooks": 200,
    "lowStockBooks": 5,
    "outOfStockBooks": 2,
    "totalStockValue": 5000.00,
    "booksByCategory": {
      "Fiction": 100,
      "Non-Fiction": 100
    }
  },
  "revenueAnalytics": {
    "monthlyRevenue": {
      "2024-03": 1500.00
    },
    "topSellingBooks": [
      {
        "id": "book_id",
        "title": "Popular Book",
        "totalSales": 50
      }
    ],
    "revenueByCategory": {
      "Fiction": 1000.00,
      "Non-Fiction": 500.00
    }
  }
}
```