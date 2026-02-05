import Link from "next/link";
import Header from "@/components/layouts/Header";
import Footer from "@/components/layouts/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-6xl font-bold text-foreground">404</h1>
          <p className="mb-4 text-xl text-muted-foreground">
            Oops! Trang không tồn tại
          </p>
          <p className="mb-8 text-muted-foreground">
            Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Quay về trang chủ
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
