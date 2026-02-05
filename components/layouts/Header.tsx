"use client";

import { useState } from "react";
import { Menu, X, Search } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <a
            href="/"
            className="font-serif text-2xl font-bold text-foreground hover:text-primary transition-colors"
          >
            Kairo's Blog
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="/"
              className="text-foreground/80 hover:text-primary transition-colors font-medium"
            >
              Trang chủ
            </a>
            <a
              href="/about"
              className="text-foreground/80 hover:text-primary transition-colors font-medium"
            >
              Về tôi
            </a>
            <a
              href="/categories"
              className="text-foreground/80 hover:text-primary transition-colors font-medium"
            >
              Danh mục
            </a>
            <button className="p-2 hover:bg-secondary rounded-full transition-colors">
              <Search className="w-5 h-5 text-foreground/70" />
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 flex flex-col gap-4 animate-fade-in">
            <a
              href="/"
              className="text-foreground/80 hover:text-primary transition-colors font-medium py-2"
            >
              Trang chủ
            </a>
            <a
              href="/about"
              className="text-foreground/80 hover:text-primary transition-colors font-medium py-2"
            >
              Về tôi
            </a>
            <a
              href="/categories"
              className="text-foreground/80 hover:text-primary transition-colors font-medium py-2"
            >
              Danh mục
            </a>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
