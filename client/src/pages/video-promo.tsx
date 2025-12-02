import { Button } from "@/components/ui/button";
import { Download, ArrowLeft, Play } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

import video1 from '@assets/generated_videos/soccer_ball_data_visualization_slow-mo.mp4';
import video2 from '@assets/generated_videos/elite_analysts_war_room_scene.mp4';
import video3 from '@assets/generated_videos/premium_app_showcase_iphone_close-up.mp4';
import video4 from '@assets/generated_videos/ai_neural_network_data_processing.mp4';
import video5 from '@assets/generated_videos/goal_celebration_victory_moment.mp4';
import videoPromo from '@assets/generated_videos/true_signal_sports_betting_app_promo.mp4';

const videos = [
  { 
    src: video1, 
    title: "CENA 1: O Gancho", 
    description: "Chute em slow-motion com dados e trajetória",
    filename: "cena1_gancho.mp4"
  },
  { 
    src: video2, 
    title: "CENA 2: War Room", 
    description: "Centro de operações com analistas",
    filename: "cena2_war_room.mp4"
  },
  { 
    src: video3, 
    title: "CENA 3: O Produto", 
    description: "Showcase do app no iPhone",
    filename: "cena3_produto.mp4"
  },
  { 
    src: video4, 
    title: "CENA 4: Motor de IA", 
    description: "Rede neural processando dados",
    filename: "cena4_motor_ia.mp4"
  },
  { 
    src: video5, 
    title: "CENA 5: O Resultado", 
    description: "Gol e celebração da vitória",
    filename: "cena5_resultado.mp4"
  },
  { 
    src: videoPromo, 
    title: "PROMO GERAL", 
    description: "Vídeo promocional completo",
    filename: "true_signal_promo.mp4"
  },
];

export default function VideoPromoPage() {
  const [, setLocation] = useLocation();
  const [selectedVideo, setSelectedVideo] = useState(0);

  const handleDownload = (src: string, filename: string) => {
    const link = document.createElement('a');
    link.href = src;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAll = () => {
    videos.forEach((video, index) => {
      setTimeout(() => {
        handleDownload(video.src, video.filename);
      }, index * 500);
    });
  };

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            onClick={() => setLocation('/')}
            variant="ghost"
            className="text-white hover:bg-white/10"
            data-testid="btn-back"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </Button>
          <Button 
            onClick={downloadAll}
            className="bg-primary hover:bg-primary/90 text-black font-bold"
            data-testid="btn-download-all"
          >
            <Download className="w-5 h-5 mr-2" />
            Baixar Todos
          </Button>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Vídeos Promocionais</h1>
          <p className="text-gray-400">TRUE SIGNAL - "Billion Dollar" Launch Videos</p>
        </div>

        <div className="relative rounded-2xl overflow-hidden border-2 border-primary/30 shadow-2xl shadow-primary/20 bg-black">
          <video 
            key={selectedVideo}
            src={videos[selectedVideo].src} 
            controls 
            autoPlay 
            loop 
            playsInline
            className="w-full max-h-[60vh] object-contain"
            data-testid="video-main"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <h2 className="text-xl font-bold text-white">{videos[selectedVideo].title}</h2>
            <p className="text-gray-300 text-sm">{videos[selectedVideo].description}</p>
          </div>
        </div>

        <div className="flex justify-center">
          <Button 
            onClick={() => handleDownload(videos[selectedVideo].src, videos[selectedVideo].filename)}
            className="bg-primary hover:bg-primary/90 text-black font-bold h-12 px-8"
            data-testid="btn-download-current"
          >
            <Download className="w-5 h-5 mr-2" />
            Baixar Este Vídeo
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {videos.map((video, index) => (
            <button
              key={index}
              onClick={() => setSelectedVideo(index)}
              className={`relative rounded-xl overflow-hidden border-2 transition-all hover:scale-[1.02] ${
                selectedVideo === index 
                  ? 'border-primary ring-2 ring-primary/50' 
                  : 'border-white/20 hover:border-primary/50'
              }`}
              data-testid={`btn-video-${index}`}
            >
              <video 
                src={video.src} 
                muted 
                playsInline
                className="w-full h-24 object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Play className="w-8 h-8 text-white/80" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-2">
                <p className="text-white text-xs font-semibold truncate">{video.title}</p>
              </div>
              {selectedVideo === index && (
                <div className="absolute top-2 right-2 w-3 h-3 bg-primary rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </div>

        <div className="bg-white/5 rounded-xl p-4 text-center">
          <p className="text-gray-400 text-sm">
            <span className="text-primary font-semibold">6 vídeos</span> • Formato MP4 • 8 segundos cada • Aspecto 9:16 (Stories/Reels)
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Ideal para Instagram, TikTok, YouTube Shorts e WhatsApp Status
          </p>
        </div>
      </div>
    </div>
  );
}
