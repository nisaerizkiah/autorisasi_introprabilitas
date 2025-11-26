# Praktikum Autorisasi API dengan JWT dan RBAC
**Nama : Nisa Eka Kholifaturrizkiah**
**Nim : 362458302018**

## Sesi Praktikum
1. Membuat dan Memodifikasi Database
- Membuat tabel users dengan kolom: id, username, password, dan role.
- Menambahkan kolom role yang menentukan hak akses (user atau admin).
- Role default ditetapkan sebagai "user" jika tidak ditentukan.
- Membuat tabel directors untuk menyimpan data sutradara.
- Menghapus database lama agar struktur terbaru dapat dibuat secara otomatis oleh script.

2. Membuat Endpoint Registrasi User
- Endpoint: POST /auth/register
- Digunakan untuk pendaftaran akun pengguna baru.
- Password pengguna disimpan dalam bentuk hash (bcrypt) sehingga lebih aman.
- Semua akun yang didaftarkan melalui endpoint ini otomatis memiliki role user.

3. Membuat Endpoint Registrasi Admin
- Endpoint: POST /auth/register-admin
- Digunakan untuk membuat akun dengan role admin.
- Password tetap melalui proses hash sebelum disimpan.
- Endpoint ini digunakan sebagai akun yang memiliki akses penuh untuk pengujian.

4. Membuat Endpoint Login
- Endpoint: POST /auth/login
- Melakukan validasi username dan password.
- Jika data valid, server memberikan token JWT.
- Token JWT berisi: id, username, role
- Token memiliki masa berlaku tertentu

5. Membuat Middleware Autentikasi dan Autorisasi
- authenticateToken
- Mengecek apakah request membawa JWT yang valid.
- Jika valid, payload token ditempel ke req.user.
- authorizeRole(role)
- Memastikan hanya user dengan role tertentu (misalnya admin) yang boleh mengakses endpoint tertentu.

 6. Menggabungkan Middleware pada Endpoint
 - GET /directors	Public	Tidak memerlukan token
 - GET /directors/:id	Public	Tidak memerlukan token
 - POST /directors	Protected	Token diperlukan (user/admin diperbolehkan)
 - PUT /directors/:id	Admin Only	Perlu token + role admin
 - DELETE /directors/:id	Admin Only	Perlu token + role admin

 7. Pengujian Pada Postman
 - GET Public Tanpa Token menampilkan semua data directors
   <img width="1920" height="1200" alt="Screenshot 2025-11-26 151711" src="https://github.com/user-attachments/assets/1f0844ba-2b45-483c-9a5e-79eb9c83add0" />

 - REGISTER USER
   <img width="1920" height="1200" alt="Screenshot 2025-11-26 151724" src="https://github.com/user-attachments/assets/f8703365-c091-4e17-a04d-112521de04f8" />

 - REGISTER ADMIN
   <img width="1920" height="1200" alt="Screenshot 2025-11-26 151747" src="https://github.com/user-attachments/assets/2b5462ae-a1d2-40a9-94c1-0ca1a758b764" />

 - LOGIN USER
   <img width="1920" height="1200" alt="Screenshot 2025-11-26 151804" src="https://github.com/user-attachments/assets/9b026459-357a-40f6-ab4e-5ce24128a9c6" />
  
 - POST DIRECTOR DENGAN MENGGUNAKAN TOKEN USER
   <img width="1920" height="1200" alt="Screenshot 2025-11-26 151847" src="https://github.com/user-attachments/assets/19220638-d1ae-4b84-a902-d2b610a269b9" />

   <img width="1920" height="1200" alt="Screenshot 2025-11-26 151901" src="https://github.com/user-attachments/assets/fdf45b4a-81d6-4851-a436-fd66b64a01f7" />

  - COBA DELETE DENGAN MENGGUNAKAN TOKEN USER. Hasilnya ditolak karena hanya admin yang memiliki akses menghapus.
    <img width="1920" height="1200" alt="Screenshot 2025-11-26 153448" src="https://github.com/user-attachments/assets/fecdcce8-11e7-4f8a-9321-f65ab4b828fa" />
    
  - LOGIN ADMIN
    <img width="1920" height="1200" alt="Screenshot 2025-11-26 151926" src="https://github.com/user-attachments/assets/a0466bee-e016-4d35-8242-14cd3b95e125" />
    
  - COBA DELETE DENGAN MENGGUNAKAN TOKEN ADMIN
    <img width="1920" height="1200" alt="Screenshot 2025-11-26 152122" src="https://github.com/user-attachments/assets/b61bac62-24b8-4ef8-926c-9277e91a427d" />
    
  - Hasil setelah directors/1 dihapus oleh admin, directors dengan id 1 sudah terhapus.
    <img width="1920" height="1200" alt="Screenshot 2025-11-26 152156" src="https://github.com/user-attachments/assets/10034b12-adcd-46ee-bc2f-4b7b0f9d38e8" />
    
  - PUT DIRECTORS/2 DENGAN MENGGUNAKAN TOKEN USER
    <img width="1920" height="1200" alt="Screenshot 2025-11-26 153300" src="https://github.com/user-attachments/assets/80be508a-17d0-42ee-97b8-858f007aa290" />
    
  - PUT DIRECTORS/2 DENGAN MENGGUNAKAN TOKEN ADMIN
    <img width="1920" height="1200" alt="Screenshot 2025-11-26 154026" src="https://github.com/user-attachments/assets/8a5bec51-a145-4b33-9c4a-f49f3e9d6228" />
    
  - HASIL AKHIR SETELAH MELAKUKAN PUT
    <img width="1920" height="1200" alt="Screenshot 2025-11-26 154201" src="https://github.com/user-attachments/assets/378d6023-2605-4cd0-8749-7be267ba5b18" />
    
    <img width="1920" height="1200" alt="Screenshot 2025-11-26 154217" src="https://github.com/user-attachments/assets/c83af6a0-826b-4356-862b-790c02b1ee45" />
