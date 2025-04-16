# JustShelf - Online Bookstore

JustShelf is a modern e-commerce platform for books, built with React and Node.js. This project includes both frontend and backend components.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 14 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Git](https://git-scm.com/)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/rajveermakkar/JustShelf.git
cd JustShelf
```

### 2. Setup Backend

1. Navigate to the backend directory:
```bash
cd Backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the Backend directory:
```env
# Server Configuration
PORT=3000
FRONTEND_URL=http://localhost:5173

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
```

4. Start the backend server:
```bash
npm start
```

The backend server will start on http://localhost:3000

### 3. Setup Frontend

1. Open a new terminal and navigate to the frontend directory:
```bash
cd Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the Frontend directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:3000
```

4. Start the frontend development server:
```bash
npm run dev
```

The frontend will start on http://localhost:5173

## 🔑 Environment Variables Guide

### Backend `.env`

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Backend server port | 3000 |
| FRONTEND_URL | Frontend application URL | http://localhost:5173 |
| SUPABASE_URL | Your Supabase project URL | https://xxxxx.supabase.co |
| SUPABASE_ANON_KEY | Supabase anonymous key | eyJ0eXAiOiJKV1QiLCJhbGciOi... |
| SUPABASE_SERVICE_ROLE_KEY | Supabase service role key | eyJ0eXAiOiJKV1QiLCJhbGciOi... |
| JWT_SECRET | Secret key for JWT tokens | your-secret-key-here |

### Frontend `.env`

| Variable | Description | Example |
|----------|-------------|---------|
| VITE_SUPABASE_URL | Your Supabase project URL | https://xxxxx.supabase.co |
| VITE_SUPABASE_ANON_KEY | Supabase anonymous key | eyJ0eXAiOiJKV1QiLCJhbGciOi... |
| VITE_API_URL | Backend API URL | http://localhost:3000 |

## 🔧 Getting Supabase Credentials

1. Go to [Supabase](https://supabase.com/) and create an account
2. Create a new project
3. Once created, go to Project Settings > API
4. You'll find your:
   - Project URL (SUPABASE_URL)
   - anon public key (SUPABASE_ANON_KEY)
   - service_role key (SUPABASE_SERVICE_ROLE_KEY)

## 📱 Features

- 📚 Browse and search books
- 🛒 Shopping cart functionality
- 👤 User authentication
- 📦 Order management
- 🎨 Responsive design
- 👑 Admin dashboard

## 👥 User Types

### Regular User
- Browse books
- Add to cart
- Place orders
- View order history
- Manage profile

### Admin User
- Manage books (add/edit/delete)
- View all orders
- Manage users
- View dashboard statistics

## 💡 Default Admin Credentials
```
Email: admin@justshelf.com
Password: admin123
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## ⚠️ Common Issues & Solutions

1. **Backend won't start**
   - Check if port 3000 is already in use
   - Verify all environment variables are set correctly
   - Make sure Supabase credentials are valid

2. **Frontend won't start**
   - Check if port 5173 is already in use
   - Verify environment variables are set correctly
   - Run `npm install` again if modules are missing

3. **Database Connection Issues**
   - Verify Supabase credentials
   - Check if Supabase project is active
   - Ensure database tables are properly set up

## 📞 Support

If you encounter any issues or need help, please:
1. Check the issues section on GitHub
2. Create a new issue with detailed information about your problem
3. Contact the maintainer at [your-email@example.com]

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details 