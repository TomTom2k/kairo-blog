const HeroSection = () => {
  return (
    <section className="py-16 md:py-24 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl">
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground leading-tight mb-6 animate-fade-in">
            Chào mừng đến với
            <span className="text-primary block mt-2">góc nhỏ của tôi</span>
          </h1>
          <p
            className="text-lg md:text-xl text-muted-foreground leading-relaxed animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            Nơi tôi chia sẻ những suy nghĩ, trải nghiệm và kiến thức về công
            nghệ, cuộc sống và những điều thú vị mà tôi học được mỗi ngày.
          </p>
          <div
            className="flex items-center gap-4 mt-8 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-serif text-2xl font-bold">
              TT
            </div>
            <div>
              <p className="font-semibold text-foreground">Thành Tín</p>
              <p className="text-sm text-muted-foreground">Software Engineer</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
