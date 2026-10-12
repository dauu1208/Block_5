# Nhà hàng – SSR Express + Sequelize + Supabase

Trang người dùng xem món ăn + trang quản trị CRUD **Dish / Chef / Ingredient**.
Server-side rendering (EJS), ORM Sequelize (code-first), không có JavaScript phía client.

## Chạy
1. `npm install`
2. Copy `.env.example` -> `.env`, dán chuỗi kết nối Supabase vào `DATABASE_URL`
   (Project Settings → Database → Connection string; nên dùng **Session pooler**, port 5432).
3. `npm run db:seed` – tạo bảng từ model (code-first) và thêm dữ liệu mẫu (**xóa dữ liệu cũ**).
4. `npm start` (hoặc `npm run dev`) → http://localhost:3000

Vào `/login`, chọn role **User** hoặc **Admin** (không cần mật khẩu).
`/dishes` ai cũng xem được; `/admin/*` chỉ role admin (chưa chọn role → redirect /login, role user → 403).

## Bảng request

| Trang | Method | URL | Kết quả |
|---|---|---|---|
| Người dùng | GET | `/dishes?q=` | Danh sách, tìm theo tên, mỗi món có link chi tiết |
| Người dùng | GET | `/dishes/:id` | Đủ các trường; id sai/không có → **404** |
| Quản trị | GET | `/admin/{dishes,chefs,ingredients}` | Danh sách |
| Quản trị | GET | `/admin/:r/new` | Form thêm |
| Quản trị | **POST** | `/admin/:r` | Thêm → **303**; input sai → **400** giữ giá trị |
| Quản trị | GET | `/admin/:r/:id/edit` | Form sửa (id sai → 404) |
| Quản trị | **PATCH** | `/admin/:r/:id` | Sửa → **303**; input sai → **400**; id sai → **404** |
| Quản trị | GET | `/admin/:r/:id/delete` | Trang xác nhận xóa |
| Quản trị | **DELETE** | `/admin/:r/:id` | Xóa → **303** (id sai → 404) |

PATCH/DELETE: form HTML chỉ có GET/POST nên dùng `method-override` ở server
(`<form method="post" action="/admin/dishes/1?_method=PATCH">`) – không dùng fetch/AJAX.
Sau thao tác thành công luôn redirect 303 nên Reload không lặp lại thao tác.

## Cấu trúc
```
src/app.js              cấu hình Express, middleware, 404/500
src/server.js           kết nối DB, sequelize.sync(), listen
src/models/             Dish, Chef, Ingredient + quan hệ (index.js)
src/routes/public.js    TRANG NGƯỜI DÙNG
src/routes/admin.js     TRANG QUẢN TRỊ
src/admin/resources.js  field, validate, quan hệ của từng model
src/routes/auth.js      /login, /logout (chọn role)
src/views/              EJS (public/, admin/, partials/)
scripts/seed.js         dữ liệu mẫu
```
