# Chiro City Health Facilities & HR Management - Backend

NestJS API with Prisma (PostgreSQL), RBAC, and modules for facilities, staff, documents, and notifications.

## Setup

1. **PostgreSQL**: Ensure PostgreSQL is running locally (e.g. port 5432).

2. **Environment**: Copy `.env.example` to `.env` and set:
   - `DATABASE_URL`: e.g. `postgresql://postgres:postgres@localhost:5432/chiro_health?schema=public`
   - `JWT_SECRET`: Secret for JWT signing (change in production)
   - `PORT`: Optional; default 3001

3. **Install and DB**:
   ```bash
   cd backend
   npm install
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

4. **Run**:
   ```bash
   npm run start:dev
   ```

API base: `http://localhost:3001`

## Seed users

- **Admin**: `admin@chirohealth.com` / `password123`
- **Officer**: `officer@chirohealth.com` / `password123`

Seed creates 3 facilities and 15 staff (5 per facility).

## Main endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /auth/login | Login (email, password) |
| GET | /dashboard/stats | Dashboard counts |
| GET/POST/PUT/DELETE | /facilities | Facilities CRUD |
| GET | /facilities/:id/staff | Staff at facility |
| GET/POST/PUT/DELETE | /staff | Staff CRUD |
| GET | /staff/license-expiring?days=30 | Licenses expiring |
| POST | /documents/facility/:facilityId | Upload facility document |
| GET | /documents/facility/:facilityId | List facility documents |
| DELETE | /documents/facility/doc/:id | Delete facility document |
| POST | /documents/staff/:staffId | Upload staff document |
| GET | /documents/staff/:staffId | List staff documents |
| DELETE | /documents/staff/doc/:id | Delete staff document |
| GET | /notifications | List notifications |
| PUT | /notifications/:id/read | Mark notification read |

All except `/auth/login` require `Authorization: Bearer <token>`.

## Roles

- **Admin**: Full control (including delete facility/staff).
- **Officer**: Add/update facilities and staff, upload documents.
