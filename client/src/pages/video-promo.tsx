import promoVideo from '@assets/generated_videos/true_signal_sports_betting_app_promo.mp4';
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function VideoPromoPage() {
  const [, setLocation] = useLocation();

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = promoVideo;
    link.download = 'true_signal_promo.mp4';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Vídeo Promocional</h1>
          <p className="text-gray-400">TRUE SIGNAL - Sports Betting Intelligence</p>
        </div>

        <div className="relative rounded-2xl overflow-hidden border-2 border-primary/30 shadow-2xl shadow-primary/20">
          <video 
            src={promoVideo} 
            controls 
            autoPlay 
            loop 
            muted
            playsInline
            className="w-full"
            data-testid="video-promo"
          />
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={() => setLocation('/')}
            variant="outline"
            className="flex-1 h-12 border-white/20 text-white hover:bg-white/10"
            data-testid="btn-back"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </Button>
          <Button 
            onClick={handleDownload}
            className="flex-1 h-12 bg-primary hover:bg-primary/90 text-black font-bold"
            data-testid="btn-download-video"
          >
            <Download className="w-5 h-5 mr-2" />
            Baixar Vídeo
          </Button>
        </div>

        <p className="text-center text-xs text-gray-500">
          Formato: MP4 | Duração: 8 segundos | Aspecto: 9:16 (Stories/Reels)
        </p>
      </div>
    </div>
  );
}
