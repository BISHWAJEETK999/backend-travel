interface HeroProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  backgroundImage?: string;
}

export default function Hero({ title, subtitle, children, backgroundImage }: HeroProps) {
  const style = backgroundImage 
    ? {
        backgroundImage: `linear-gradient(135deg, rgba(18, 91, 161, 0.8), rgba(33, 150, 243, 0.8)), url('${backgroundImage}')`
      }
    : {};

  return (
    <div className="hero-section" style={style}>
      <div className="hero-content text-center">
        <div className="container mx-auto px-4">
          <h1 className="font-poppins text-4xl md:text-6xl font-bold mb-4">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
