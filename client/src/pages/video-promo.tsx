import { Button } from "@/components/ui/button";
import { Download, ArrowLeft, Play } from "lucide-react";
import { useLocation } from "wouter";

export default function VideoPromoPage() {
  const [, setLocation] = useLocation();

  // Configuração do SEU VÍDEO ÚNICO
  const video = {
    src: "/videos/truevideo_1764359168903.mp4", // O caminho exato na pasta public
    filename: "true_signal_promo_oficial.mp4", // Nome para baixar
    title: "TRUE SIGNAL: VÍDEO OFICIAL",
    description: "Material publicitário principal para campanhas."
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = video.src;
    link.download = video.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 flex flex-col items-center">
      
      {/* Cabeçalho */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-8">
        <Button 
          onClick={() => setLocation('/')}
          variant="ghost"
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar
        </Button>
      </div>

      {/* Área do Player */}
      <div className="w-full max-w-4xl space-y-6">
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-sora font-bold text-white">
            Material de Divulgação
          </h1>
          <p className="text-gray-400">Vídeo Oficial True Signal Intelligence</p>
        </div>

        {/* O Player de Vídeo */}
        <div className="relative rounded-2xl overflow-hidden border border-[#33b864]/30 shadow-[0_0_50px_rgba(51,184,100,0.15)] bg-black aspect-video">
          <video 
            src={video.src} 
            controls 
            className="w-full h-full object-contain"
          >
            Seu navegador não suporta o vídeo.
          </video>
        </div>

        {/* Botão de Download */}
        <div className="flex justify-center pt-4">
          <Button 
            onClick={handleDownload}
            className="bg-[#33b864] hover:bg-[#289a54] text-black font-bold h-14 px-10 rounded-xl text-lg shadow-lg shadow-green-900/20 flex items-center gap-3 transition-transform active:scale-95"
          >
            <Download className="w-6 h-6" />
            BAIXAR VÍDEO MP4
          </Button>
        </div>

        <div className="text-center text-xs text-gray-600 mt-8 font-mono">
          ARQUIVO: {video.src.split('/').pop()}
        </div>

      </div>
    </div>
  );
}