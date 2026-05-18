# API Documentation

## Authentication
- POST /api/auth/login
- POST /api/auth/signup
- POST /api/auth/logout

## Orders
- GET /api/orders
- POST /api/orders/place
- PATCH /api/orders/status
- PATCH /api/orders/payment

## Menu Items
- GET /api/menu-items
- POST /api/menu-items (Admin only)
- PUT /api/menu-items (Admin only)
- DELETE /api/menu-items (Admin only)

## Reservations
- GET /api/reservations
- POST /api/reservations
- PATCH /api/reservations/[id]
- DELETE /api/reservations/[id]
