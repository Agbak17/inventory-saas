# Inventory SaaS Platform

A full-stack multi-tenant inventory management platform built with Next.js, TypeScript, AWS Lambda, PostgreSQL, and Supabase.

The project was designed to demonstrate modern full-stack architecture, serverless deployment, authentication, CI/CD pipelines, automated testing, and production-ready infrastructure.

---

## Live Demo

Frontend: https://inventory-saas-web.vercel.app

Repository: https://github.com/Agbak17/inventory-saas

---

## Features

- Multi-tenant inventory management
- Secure authentication and authorization
- Serverless backend architecture
- RESTful API design
- Inventory analytics dashboard
- Automated integration testing
- CI/CD with GitHub Actions
- PostgreSQL relational database integration

---

## Tech Stack

### Frontend
- Next.js
- React
- TypeScript

### Backend
- Node.js
- Hono
- AWS Lambda
- API Gateway

### Database & Authentication
- PostgreSQL
- Supabase

### Testing
- Jest
- Supertest

### DevOps & Deployment
- GitHub Actions
- AWS CDK
- Vercel

---

## Architecture

- Frontend deployed on Vercel
- Backend API deployed using AWS Lambda
- API Gateway handles HTTP routing
- Supabase provides a PostgreSQL database and authentication
- GitHub Actions used for CI/CD automation
- Monorepo structure used for frontend, backend, and infrastructure code

---

## Monorepo Structure

```txt
apps/
  web/       # Next.js frontend
  api/       # Hono API backend

infra/
  cdk/       # AWS infrastructure configuration

.github/
  workflows/ # CI/CD pipelines
```
