import { Heart, Github, Twitter, Linkedin, Mail } from "lucide-react";

const quickLinks = [
  { link: "/", label: "Trang chủ" },
  { link: "/about", label: "Về tôi" },
  { link: "/categories", label: "Danh mục" },
  { link: "/contact", label: "Liên hệ" },
];

const medias = [
  { link: "https://github.com/tomtom2k", icon: <Github /> },
  {
    link: "https://www.linkedin.com/in/nguyen-thanh-tin-b6640b271/",
    icon: <Linkedin />,
  },
  { link: "mailto:ngthantin68@gmail.com", icon: <Mail /> },
];

const Footer = () => {
  return (
    <footer className="bg-secondary/50 border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-serif text-xl font-bold text-foreground mb-4">
              Kairo's Blog
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Nơi chia sẻ kiến thức, kinh nghiệm và những câu chuyện thú vị về
              công nghệ và cuộc sống.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">
              Liên kết nhanh
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.link}>
                  <a
                    href={link.link}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Kết nối</h4>
            <div className="flex gap-3">
              {medias.map((media) => (
                <a
                  key={media.link}
                  href={media.link}
                  className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {media.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
            Được làm với <Heart className="w-4 h-4 text-primary fill-primary" />{" "}
            bởi Thành Tín © 2026
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
