UITfit - Website quan ly lich tap va theo doi suc khoe ca nhan
Nhom 28 - MSSV 25210260 - IE104.F31.CN1.CNTT - GVHD: Mai Xuan Hung

1. CHAY BACKEND (Laravel) - http://localhost:8000
   cd Source/backend/uitfit-api
   composer install
   cp .env.example .env        (sua DB_USERNAME / DB_PASSWORD neu can)
   php artisan key:generate
   Tao database "uitfit" (utf8mb4) roi chay:  php artisan migrate --seed
   (hoac import file Data/uitfit.sql)
   php artisan storage:link
   php artisan serve

2. CHAY FRONTEND (Angular) - http://localhost:4200
   cd Source/frontend/uitfit-angular
   npm install
   npx ng serve

3. TAI KHOAN DEMO (mat khau: 123456)
   Admin : admin@uitfit.com
   User  : user@uitfit.com
   User bi khoa (de test): khoa@uitfit.com

4. LUONG DEMO GOI Y
   Landing -> Dang ky -> Dang nhap -> Dashboard -> Ho so -> Cap nhat chi so
   -> Tien trinh -> Thu vien bai tap -> Tim "bench" -> Chi tiet -> Tao lich "Push Day"
   -> Bat dau tap -> Nhap tung set (reps/kg/RPE/note) -> Rest Timer -> Hoan thanh
   -> Lich su -> Dashboard cap nhat -> Dang xuat -> Admin: Dashboard, CRUD bai tap,
   Quan ly nguoi dung, Khoa/Mo khoa.

5. RESET DU LIEU DEMO
   php artisan migrate:fresh --seed

6. KHAC
   - Postman collection: Docs/UITfit_API.postman_collection.json
   - Kich ban video: Demo/demo_script.md
