# Kairo Blog - Hệ thống Blog Cá nhân & Portfolio

Kairo Blog là một nền tảng blog cá nhân hiện đại, được xây dựng với mục tiêu tối ưu hóa trải nghiệm người dùng, tốc độ tải trang và khả năng SEO vượt trội. Dự án cung cấp đầy đủ các tính năng từ giao diện đọc tin tức cho đến hệ thống quản trị nội dung (CMS) mạnh mẽ.

## ✨ Tính năng chính

### 🌐 Giao diện Người dùng (Client)

- **Trang chủ năng động**: Hiển thị các bài viết mới nhất, tiêu biểu.
- **Phân loại bài viết**: Hệ thống lọc bài viết theo chuyên mục (Categories) và thẻ (Tags) linh hoạt.
- **Trải nghiệm đọc tối ưu**: Giao diện đọc bài viết sạch sẽ, hỗ trợ Typography tốt, tích hợp mục lục.
- **Tương tác**: Tính năng Like, xem số lượt view và để lại bình luận cho bài viết.
- **Tối ưu SEO**: Tích hợp sẵn Meta tags, Open Graph (OG), JSON-LD và Sitemap để tối ưu hóa thứ hạng trên Google.

### 🔐 Hệ thống Quản trị (Admin Dashboard)

- **Tổng quan (Dashboard)**: Thống kê số lượng bài viết, lượt xem và tương tác.
- **Quản lý Bài viết (Posts)**: Trình soạn thảo Rich Text (Tiptap) mạnh mẽ, hỗ trợ upload hình ảnh, định dạng mã nguồn và tùy chỉnh thông số SEO cho từng bài viết.
- **Quản lý Thẻ & Chuyên mục (Tags/Categories)**: Thêm, sửa, xóa và tùy chỉnh màu sắc cho các thẻ.
- **Quản lý Bình luận**: Hệ thống kiểm duyệt và phản hồi bình luận từ người đọc.
- **Bảo mật**: Hệ thống đăng nhập an toàn dành riêng cho quản trị viên.

## 🛠 Công nghệ sử dụng

- **Frontend**: [Next.js](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/).
- **Backend / Database**: [Supabase](https://supabase.com/) (PostgreSQL & Authentication).
- **Trình soạn thảo**: [Tiptap Editor](https://tiptap.dev/).
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/), [Lucide React](https://lucide.dev/).
- **Quản lý Form**: [React Hook Form](https://react-hook-form.com/) kết hợp với [Zod](https://zod.dev/).

## 📁 Cấu trúc thư mục

```text
├── app/                  # Chứa các route của ứng dụng (Admin, Client, Login)
│   ├── (client)/         # Giao diện dành cho người đọc
│   ├── admin/            # Giao diện quản trị viên
│   └── login/            # Trang đăng nhập
├── components/           # Các component dùng chung và UI
├── lib/                  # Các tiện ích và cấu hình (Supabase, Utils)
├── services/             # Lớp giao tiếp với API và Database
├── public/               # Tài nguyên tĩnh (Images, Fonts)
└── types/                # Định nghĩa các kiểu dữ liệu TypeScript
```
