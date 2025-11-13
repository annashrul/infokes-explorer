# Infokes Explorer

Aplikasi file explorer modern dengan interface Windows 11, dibuat menggunakan Vue 3, Elysia (Bun), dan MySQL.

## ✨ Fitur

- 🗂️ **Folder Tree Navigation** - Navigasi folder hierarkis di sidebar
- 📁 **File & Folder Management** - Buat, rename, dan hapus folder/file
- 🔍 **Search Functionality** - Pencarian folder dan file
- 🎨 **Windows 11 UI** - Interface modern dengan styling Windows 11
- ⚡ **Real-time Updates** - Perubahan langsung terlihat di UI
- 🔄 **Navigation History** - Back/forward navigation seperti browser

## 🚀 Instalasi

### Opsi 1: Menggunakan Docker (Recommended)


#### Langkah Instalasi

1. **Clone repository**
   ```bash
   git clone https://github.com/annashrul/infokes-explorer.git
   cd infokes-explorer
   ```

2. **Jalankan dengan Docker Compose**
   ```bash
   docker-compose up --build
   ```

3. **Akses aplikasi**
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:3000
   - **phpMyAdmin**: http://localhost:8080
   - **MySQL**: localhost:3306

4. **Login phpMyAdmin** (opsional)
   - Username: `explorer_user`
   - Password: `explorer_pass`



### Opsi 2: Manual Installation


#### Langkah Instalasi

1. **Clone repository**
   ```bash
   git clone https://github.com/annashrul/infokes-explorer.git
   cd infokes-explorer
   ```

2. **Setup Database**
   ```bash
   # Login ke MySQL
   mysql -u root -p
   
   # Buat database dan user
   CREATE DATABASE explorer_db;
   CREATE USER 'explorer_user'@'localhost' IDENTIFIED BY 'explorer_pass';
   GRANT ALL PRIVILEGES ON explorer_db.* TO 'explorer_user'@'localhost';
   FLUSH PRIVILEGES;
   
   # Import schema
   USE explorer_db;
   SOURCE init.sql;
   ```

3. **Setup Backend**
   cd apps/backend
   bun install
   cp .env.example .env
   
   # Edit .env sesuai konfigurasi database Anda
   # DATABASE_HOST=localhost
   # DATABASE_PORT=3306
   # DATABASE_NAME=explorer_db
   # DATABASE_USER=explorer_user
   # DATABASE_PASSWORD=explorer_pass
   # PORT=3000
   
   bun run dev
   ```

4. **Setup Frontend**
   cd apps/frontend
   bun install
   cp .env.example .env
   
   # Edit .env jika perlu
   # VITE_API_URL=http://localhost:3000
   
   bun run dev
   ```

5. **Akses aplikasi**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000


## 🔧 Konfigurasi

### Environment Variables

**Backend (.env)**
```env
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=explorer_db
DATABASE_USER=explorer_user
DATABASE_PASSWORD=explorer_pass
PORT=3000
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:3000
```
