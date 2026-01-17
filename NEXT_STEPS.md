# Burgos Experience System - Next Steps

## 📦 Install Dependencies

From the root of the project:

```bash
cd D:\Bkp\www\Burgos
npm install
```

This will install all dependencies for:
- Root workspace
- apps/web (Next.js)
- apps/api (Node.js)
- packages/database

## 🗄️ Configure Database

1. **Install PostgreSQL** (if not installed):
   - Download from: https://www.postgresql.org/download/windows/
   - Or use Docker: `docker run --name burgos-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15`

2. **Create Database**:
   ```bash
   # Using psql
   psql -U postgres
   CREATE DATABASE burgos;
   \q
   ```

3. **Configure Environment**:
   ```bash
   # Create .env file in root
   copy .env.example .env
   
   # Edit .env and set:
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/burgos
   ```

4. **Run Migrations**:
   ```bash
   npm run db:migrate
   ```

## 🚀 Start Development

Open 2 terminals:

**Terminal 1 - API Server:**
```bash
cd D:\Bkp\www\Burgos
cd apps\api
npm run dev
```

**Terminal 2 - Web App:**
```bash
cd D:\Bkp\www\Burgos
cd apps\web
npm run dev
```

Access: http://localhost:3000

## ✅ Verify Setup

1. Web app loads with Burgos branding ✓
2. API health check: http://localhost:3001/health ✓
3. WebSocket connection established ✓
4. Database tables created ✓

## 📝 Default Admin Credentials

**Important**: Change the password hash in the database after migration!

- Email: `admin@barbeariaburgos.com.br`
- Password: (needs to be hashed - will be created in auth module)

## 🔜 Development Order

1. ✅ Project structure
2. ✅ Next.js web app
3. ✅ API server foundation
4. ✅ Database schema
5. 📋 Authentication system (JWT)
6. 📋 Appointment module
7. 📋 Client preferences
8. 📋 Spotify integration
9. 📋 Electron desktop app
10. 📋 Payment processing

---

Pronto para começar! 🚀💈
