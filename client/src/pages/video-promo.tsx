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
import videoTeam from '@assets/generated_videos/team_working_office_green_shirts.mp4';
import videoAnalyst from '@assets/generated_videos/analyst_typing_dashboard_close-up.mp4';
import videoManPhone from '@assets/generated_videos/man_using_app_on_phone_office.mp4';
import videoWalkthrough from '@assets/generated_videos/office_walkthrough_team_working.mp4';
import videoWoman from '@assets/generated_videos/woman_celebrating_app_win_smartphone.mp4';

const videos = [
  { 
    src: videoTeam, 
    title: "EQUIPE TRABALHANDO", 
    description: "Time de analistas no escritório com camisetas verdes",
    filename: "equipe_trabalhando.mp4",
    category: "realista"
  },
  { 
    src: videoAnalyst, 
    title: "ANALISTA NO PC", 
    description: "Close-up do dashboard na tela do computador",
    filename: "analista_pc.mp4",
    category: "realista"
  },
  { 
    src: videoManPhone, 
    title: "USANDO O APP", 
    description: "Homem usando o app no celular no escritório",
    filename: "usando_app_celular.mp4",
    category: "realista"
  },
  { 
    src: videoWalkthrough, 
    title: "TOUR NO ESCRITÓRIO", 
    description: "Walkthrough pelo escritório moderno",
    filename: "tour_escritorio.mp4",
    category: "realista"
  },
  { 
    src: videoWoman, 
    title: "CELEBRANDO VITÓRIA", 
    description: "Mulher comemorando resultado no app",
    filename: "celebrando_vitoria.mp4",
    category: "realista"
  },
  { 
    src: video1, 
    title: "CENA 1: O Gancho", 
    description: "Chute em slow-motion com dados e trajetória",
    filename: "cena1_gancho.mp4",
    category: "cinematico"
  },
  { 
    src: video2, 
    title: "CENA 2: War Room", 
    description: "Centro de operações com analistas",
    filename: "cena2_war_room.mp4",
    category: "cinematico"
  },
  { 
    src: video3, 
    title: "CENA 3: O Produto", 
    description: "Showcase do app no iPhone",
    filename: "cena3_produto.mp4",
    category: "cinematico"
  },
  { 
    src: video4, 
    title: "CENA 4: Motor de IA", 
    description: "Rede neural processando dados",
    filename: "cena4_motor_ia.mp4",
    category: "cinematico"
  },
  { 
    src: video5, 
    title: "CENA 5: O Resultado", 
    description: "Gol e celebração da vitória",
    filename: "cena5_resultado.mp4",
    category: "cinematico"
  },
  { 
    src: videoPromo, 
    title: "PROMO GERAL", 
    description: "Vídeo promocional completo",
    filename: "true_signal_promo.mp4",
    category: "cinematico"
  },
];

export default function VideoPromoPage() {
  const [, setLocation] = useLocation();
  const [selectedVideo, setSelectedVideo] = useState(0);
  const [filter, setFilter] = useState<'todos' | 'realista' | 'cinematico'>('todos');

  const filteredVideos = filter === 'todos' 
    ? videos 
    : videos.filter(v => v.category === filter);

  const handleDownload = (src: string, filename: string) => {
    const link = document.createElement('a');
    link.href = src;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAll = () => {
    filteredVideos.forEach((video, index) => {
      setTimeout(() => {
        handleDownload(video.src, video.filename);
      }, index * 500);
    });
  };

  const currentVideo = filteredVideos[selectedVideo] || filteredVideos[0];

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
            Baixar Todos ({filteredVideos.length})
          </Button>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Vídeos Promocionais</h1>
          <p className="text-gray-400">TRUE SIGNAL - 11 vídeos para sua campanha</p>
        </div>

        <div className="flex justify-center gap-2">
          <Button
            onClick={() => { setFilter('todos'); setSelectedVideo(0); }}
            variant={filter === 'todos' ? 'default' : 'outline'}
            className={filter === 'todos' ? 'bg-primary text-black' : 'border-white/20 text-white'}
            size="sm"
          >
            Todos (11)
          </Button>
          <Button
            onClick={() => { setFilter('realista'); setSelectedVideo(0); }}
            variant={filter === 'realista' ? 'default' : 'outline'}
            className={filter === 'realista' ? 'bg-primary text-black' : 'border-white/20 text-white'}
            size="sm"
          >
            Equipe Real (5)
          </Button>
          <Button
            onClick={() => { setFilter('cinematico'); setSelectedVideo(0); }}
            variant={filter === 'cinematico' ? 'default' : 'outline'}
            className={filter === 'cinematico' ? 'bg-primary text-black' : 'border-white/20 text-white'}
            size="sm"
          >
            Cinematográfico (6)
          </Button>
        </div>

        <div className="relative rounded-2xl overflow-hidden border-2 border-primary/30 shadow-2xl shadow-primary/20 bg-black">
          <video 
            key={currentVideo?.src}
            src={currentVideo?.src} 
            controls 
            autoPlay 
            loop 
            playsInline
            className="w-full max-h-[60vh] object-contain"
            data-testid="video-main"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs px-2 py-0.5 rounded ${currentVideo?.category === 'realista' ? 'bg-blue-500/30 text-blue-300' : 'bg-purple-500/30 text-purple-300'}`}>
                {currentVideo?.category === 'realista' ? 'EQUIPE REAL' : 'CINEMATOGRÁFICO'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">{currentVideo?.title}</h2>
            <p className="text-gray-300 text-sm">{currentVideo?.description}</p>
          </div>
        </div>

        <div className="flex justify-center">
          <Button 
            onClick={() => handleDownload(currentVideo?.src, currentVideo?.filename)}
            className="bg-primary hover:bg-primary/90 text-black font-bold h-12 px-8"
            data-testid="btn-download-current"
          >
            <Download className="w-5 h-5 mr-2" />
            Baixar Este Vídeo
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {filteredVideos.map((video, index) => (
            <button
              key={video.filename}
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
                className="w-full h-20 object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Play className="w-6 h-6 text-white/80" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-1.5">
                <p className="text-white text-[10px] font-semibold truncate">{video.title}</p>
              </div>
              {selectedVideo === index && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </div>

        <div className="bg-white/5 rounded-xl p-4 text-center">
          <p className="text-gray-400 text-sm">
            <span className="text-primary font-semibold">11 vídeos</span> • Formato MP4 • 8 segundos cada • Aspecto 9:16
          </p>
          <p className="text-gray-500 text-xs mt-2">
            5 vídeos realistas com equipe + 6 vídeos cinematográficos
          </p>
        </div>
      </div>
    </div>
  );
}
