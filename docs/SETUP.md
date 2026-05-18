# DineEase Setup Guide

## Prerequisites
- Node.js 18+
- PostgreSQL database
- Redis instance (Upstash)

## Installation

1. Clone repository
2. Copy `.env.example` to `.env`
3. Fill in environment variables
4. Run `npm install`
5. Run `npx prisma generate`
6. Run `npx prisma db push`
7. Run `npm run dev`
