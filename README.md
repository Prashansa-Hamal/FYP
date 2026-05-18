# DineEase - Restaurant Management System

A comprehensive restaurant management system built with Next.js, featuring order management, reservations, payment integration, and multi-role access control.

## Features

- 🍽️ **Order Management** - Complete order lifecycle from placement to completion
- 📅 **Reservations** - Table booking and management system
- 💳 **Payment Integration** - Khalti, eSewa, and Cash on Delivery
- 👥 **Multi-Role System** - Customer, Staff, Chef, Cashier, Manager, Admin
- 🔐 **Secure Authentication** - JWT-based auth with email verification
- 📊 **Kitchen Display** - Station-based order tracking
- ⭐ **Loyalty Program** - Points system for customers
- 📧 **Email Notifications** - Automated order and reservation emails

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL with Prisma ORM
- **Cache:** Redis (Upstash)
- **Auth:** JWT + Session-based
- **Payments:** Khalti, eSewa
- **File Storage:** EdgeStore

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Redis instance

### Installation

1. Clone the repository
```bash
git clone https://github.com/Prashansa-Hamal/FYP.git
cd FYP
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Fill in your credentials in .env
```

4. Set up database
```bash
npx prisma generate
npx prisma db push
```

5. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Documentation

- [Setup Guide](docs/SETUP.md)
- [API Documentation](docs/API.md)
- [Security Policy](SECURITY.md)

## Security

⚠️ **Important:** Never commit `.env` files. See [SECURITY.md](SECURITY.md) for best practices.

## License

This project is for educational purposes.
