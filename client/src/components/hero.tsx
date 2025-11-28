import generatedImage from '@assets/generated_images/dark_green_neon_tech_money_background.png';

export function Hero() {
  return (
    <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden mb-8 border border-primary/20 shadow-[0_0_30px_rgba(51,184,100,0.1)] group">
      <img 
        src={generatedImage} 
        alt="Hero Background" 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black dark:from-black from-white/90 via-black/60 dark:via-black/60 via-white/50 to-transparent" />
      
      <div className="absolute inset-0 p-8 flex flex-col justify-center">
        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold uppercase tracking-wider mb-4 w-fit animate-in slide-in-from-left-4 fade-in duration-700 shadow-[0_0_10px_rgba(51,184,100,0.2)]">
          TRUE SIGNAL Intelligence
        </span>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground dark:text-white mb-2 max-w-lg animate-in slide-in-from-left-4 fade-in duration-700 delay-100">
          Domine as <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-400 drop-shadow-[0_0_10px_rgba(51,184,100,0.5)]">
            Estatísticas
          </span>
        </h1>
        <p className="text-muted-foreground max-w-md text-sm md:text-base animate-in slide-in-from-left-4 fade-in duration-700 delay-200">
          Sinais de alta precisão gerados por inteligência artificial e curadoria de especialistas.
        </p>
      </div>
    </div>
  );
}
