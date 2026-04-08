### Gruhveda MarketPlace

**Tech stack:**
- Frontend: React 18, Vite, Tailwind CSS v4, Framer Motion, React Router v7, react-hot-toast, react-helmet-async
- Backend: **Django 6**, Django REST Framework, SimpleJWT, django-cors-headers, psycopg2
- Database: **PostgreSQL** (local or hosted — Supabase, Render, Railway, etc.)

---

## Local Development Setup

### Prerequisites
- Node.js 18+ (frontend)
- Python 3.11+ (backend, Django)
- PostgreSQL (Latest, for Database)

---

### 1. Install frontend

```sh
cd main
npm install
```

### 2. Configure frontend env

```sh
VITE_API_URL=http://localhost:8000/api
VITE_SITE_URL=http://localhost:5173
```

### 3. Install backend dependencies

```sh
cd main/backend
pip install -r requirements.txt
```

### 4. Configure backend env

```sh
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DB_ENGINE=postgresql
DB_NAME=marketplace
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
JWT_LIFETIME_DAYS=7
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,
CSRF_TRUSTED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,
STOREFRONT_URL=http://localhost:5173
VITE_API_URL=http://localhost:8000/api
```

### 5. Create database & run migrations

```sh
psql -U postgres -c "CREATE DATABASE Gruhaved Organic Food And Agro Products;"
python manage.py migrate
```

### 6. Create superuser (for admin panel)

```sh
python manage.py createsuperuser
```

### 7. Run the Django backend

```sh
# From main/backend/
python manage.py runserver 8000
```

### 8. Run the frontend

```sh
# From main/
npm run dev
```

- Frontend: **http://localhost:5173**
- API: **http://localhost:8000/api**
- Admin: **http://localhost:8000/login/admin**
