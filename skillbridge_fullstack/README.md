# SkillBridge – Student & Job Placement Management System

A full-stack learning project built with React, Bootstrap, Python, Django REST Framework and SQLite (with optional MySQL configuration).

## Features
- Student registration and login (token authentication)
- Student profile, skills and education management
- Job listing, search and filtering
- Apply to jobs and track application status
- Admin APIs for creating, updating and deleting jobs
- Dashboard statistics
- Responsive Bootstrap UI

## Requirements
- Python 3.10+
- Node.js 18+
- npm

## 1. Run the backend

Open a terminal in the `backend` folder:

```bash
python -m venv venv
```

Windows PowerShell:
```powershell
.\venv\Scripts\Activate.ps1
```

Windows CMD:
```cmd
venv\Scripts\activate
```

macOS/Linux:
```bash
source venv/bin/activate
```

Install packages:
```bash
pip install -r requirements.txt
```

Create database tables and a superuser:
```bash
python manage.py migrate
python manage.py createsuperuser
```

Start Django:
```bash
python manage.py runserver
```

Backend: http://127.0.0.1:8000  
Django admin: http://127.0.0.1:8000/admin  
API root: http://127.0.0.1:8000/api/

## 2. Run the frontend

Open a SECOND terminal in the `frontend` folder:

```bash
npm install
npm run dev
```

Open the URL shown by Vite, usually http://localhost:5173

Register a student account in the app. To create jobs, sign in to Django admin using the superuser created earlier and add Job records. Set `is_staff` for an account if you want to use admin-only job management endpoints.

## 3. Optional: use MySQL instead of SQLite

Install the MySQL server and create a database:

```sql
CREATE DATABASE skillbridge_db CHARACTER SET utf8mb4;
```

Install the driver:
```bash
pip install mysqlclient
```

Set these environment variables before running Django.

Windows PowerShell:
```powershell
$env:DB_ENGINE="mysql"
$env:DB_NAME="skillbridge_db"
$env:DB_USER="root"
$env:DB_PASSWORD="your_mysql_password"
$env:DB_HOST="127.0.0.1"
$env:DB_PORT="3306"
```

macOS/Linux:
```bash
export DB_ENGINE=mysql
export DB_NAME=skillbridge_db
export DB_USER=root
export DB_PASSWORD=your_mysql_password
export DB_HOST=127.0.0.1
export DB_PORT=3306
```

Then run:
```bash
python manage.py migrate
python manage.py runserver
```

SQLite is the default so you can start the project without installing MySQL. The same Django models and ORM work with either database.

## 4. Main API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/register/` | Register |
| POST | `/api/login/` | Login and receive token |
| GET/PUT | `/api/profile/` | View/update profile |
| GET | `/api/jobs/` | List and search jobs |
| POST | `/api/jobs/` | Create job (staff only) |
| GET/PUT/DELETE | `/api/jobs/<id>/` | Manage a job (staff only for changes) |
| POST | `/api/jobs/<id>/apply/` | Apply to a job |
| GET | `/api/applications/` | My applications |
| GET | `/api/dashboard/` | Dashboard summary |

Search example:
`/api/jobs/?search=python&location=Chennai`

## 5. Suggested learning exercises
1. Add pagination to jobs.
2. Add resume upload validation and file download.
3. Add job application status updates for staff.
4. Add charts to the dashboard.
5. Add automated tests for models and APIs.
6. Deploy the React frontend and Django backend separately.

## Project structure

```text
skillbridge_fullstack/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── config/
│   └── portal/
└── frontend/
    ├── package.json
    ├── index.html
    └── src/
```
