import Footer from "@/components/layouts/Footer";
import Header from "@/components/layouts/Header";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background font-sans">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
