# Postman Collection - Ekin Backend API

Koleksi Postman lengkap untuk testing API Ekin Backend dengan konfigurasi autentikasi.

## File yang Tersedia

1. **Ekin-Backend-API.postman_collection.json** - Koleksi utama dengan semua endpoint
2. **Ekin-Backend-Environment.postman_environment.json** - Environment variables
3. **README.md** - Dokumentasi penggunaan (file ini)

## Cara Import ke Postman

### 1. Import Collection
1. Buka Postman
2. Klik **Import** di pojok kiri atas
3. Pilih file `Ekin-Backend-API.postman_collection.json`
4. Klik **Import**

### 2. Import Environment
1. Klik **Import** lagi
2. Pilih file `Ekin-Backend-Environment.postman_environment.json`
3. Klik **Import**
4. Pilih environment "Ekin Backend Environment" di dropdown pojok kanan atas

## Endpoint yang Tersedia

### App Endpoints
- **GET /** - Root endpoint (Hello World)

### Authentication Endpoints
- **POST /auth/login** - Login dengan username dan password
- **GET /auth/health** - Health check (public)
- **GET /auth/profile** - Get profile (protected)
- **POST /auth/verify** - Verify token (protected)
- **GET /auth/me** - Get current user info (protected)

## Konfigurasi Environment Variables

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `base_url` | http://localhost:3000 | Base URL aplikasi |
| `jwt_token` | (empty) | JWT token untuk autentikasi |
| `username` | testuser | Username untuk login |
| `password` | password123 | Password untuk login |
| `jwks_url` | https://your-auth-server.com/.well-known/jwks.json | JWKS URL |

## Cara Penggunaan

### 1. Testing Endpoint Public
- Jalankan **GET /** atau **GET /auth/health**
- Tidak memerlukan autentikasi

### 2. Testing Login
- Jalankan **POST /auth/login**
- Body sudah dikonfigurasi dengan username dan password default
- Jika login berhasil dan mengembalikan token, akan otomatis disimpan ke variable `jwt_token`

### 3. Testing Endpoint Protected
- Pastikan sudah ada JWT token (dari login atau set manual)
- Jalankan endpoint yang memerlukan autentikasi:
  - **GET /auth/profile**
  - **POST /auth/verify**
  - **GET /auth/me**
- Header Authorization akan otomatis menggunakan Bearer token

## Fitur Otomatis

### Pre-request Script
- Otomatis set base_url jika belum dikonfigurasi

### Test Script
- Otomatis extract JWT token dari response login
- Log response status dan body untuk debugging

## Kustomisasi

### Mengubah Base URL
1. Buka environment "Ekin Backend Environment"
2. Edit variable `base_url` sesuai kebutuhan (misal: https://api.yourdomain.com)

### Menggunakan JWT Token Manual
1. Dapatkan JWT token dari external auth service
2. Set variable `jwt_token` dengan token tersebut
3. Semua endpoint protected akan menggunakan token ini

## Troubleshooting

### 401 Unauthorized
- Pastikan JWT token valid dan belum expired
- Cek konfigurasi JWKS URL di environment aplikasi
- Pastikan format Authorization header: `Bearer <token>`

### Connection Error
- Pastikan aplikasi NestJS berjalan di port yang benar
- Cek base_url di environment variables
- Pastikan tidak ada firewall yang memblokir koneksi

## Integrasi dengan External Auth

Untuk mengintegrasikan dengan sistem autentikasi eksternal:

1. Update endpoint login untuk mengarah ke auth service eksternal
2. Set JWKS URL yang sesuai di environment aplikasi
3. Update variable `jwks_url` di Postman environment
4. Test dengan JWT token yang valid dari auth service eksternal