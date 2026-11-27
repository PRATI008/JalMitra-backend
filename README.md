# 🌊 JalMitra - Express Backend API Server

This is the dedicated Express.js backend for the **JalMitra Water Supply** application.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Run the Backend Server
```bash
# Production mode
npm start

# Development mode (with auto-reload)
npm run dev
```

The server runs by default on **http://localhost:5000**.

---

## 📡 API Endpoints

### 🩺 Health Check
- `GET /api/health` - Server status and timestamp

### 💧 Water Suppliers
- `GET /api/suppliers` - List all suppliers (supports query parameters: `?q=...`, `?waterType=Cold|Normal|Both`, `?sort=rating|price_asc|price_desc`)
- `GET /api/suppliers/:id` - Get supplier details by ID

### 📦 Water Orders
- `GET /api/orders` - Get order history (filter by mobile: `?mobile=...`)
- `GET /api/orders/:id` - Get single order by Order ID
- `POST /api/orders` - Place new water order (auto-assigns Order ID, delivery partner & notification)
- `PATCH /api/orders/:id/status` - Update or simulate order progress (`Placed` -> `Accepted` -> `Preparing` -> `Out for Delivery` -> `Delivered`)
- `POST /api/orders/:id/cancel` - Cancel active order

### 👤 Authentication & Profiles
- `POST /api/auth/login` - Login or auto-register using 10-digit mobile number
- `GET /api/auth/profile/:mobile` - Fetch user profile & delivery addresses
- `PUT /api/auth/profile/:mobile` - Update profile, contact & address info

### 💬 Reviews & Testimonials
- `GET /api/reviews` - Fetch verified customer reviews
- `POST /api/reviews` - Submit a new review with star rating

### 🔔 Live Notifications
- `GET /api/notifications` - Fetch order updates and promos
- `PATCH /api/notifications/mark-all-read` - Mark all notifications as read

---

## 💾 Data Persistence
All data is persistently stored in `data/db.json` with file read/write synchronization.
No external database setup is required to run out of the box!

"# JalMitra-backend" 
