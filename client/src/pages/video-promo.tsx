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
import videoDrone1 from '@assets/generated_videos/aerial_drone_soccer_field_ai_tracking.mp4';
import videoDrone2 from '@assets/generated_videos/top-down_tactical_analysis_overlay.mp4';
import videoDrone3 from '@assets/generated_videos/night_match_drone_ai_data_overlay.mp4';
import videoMockup1 from '@assets/generated_videos/phone_mockup_green_screen_hands.mp4';
import videoMockup2 from '@assets/generated_videos/person_couch_phone_mockup_screen.mp4';
import videoManCelebrate from '@assets/generated_videos/man_celebrating_looking_at_phone.mp4';
import videoStats3D from '@assets/generated_videos/3d_statistics_visualization_floating.mp4';
import videoStatsMatch from '@assets/generated_videos/soccer_match_stats_visualization.mp4';
import take1 from '@assets/generated_videos/take_1_soccer_field_data_hud.mp4';
import take2 from '@assets/generated_videos/take_2_war_room_analysts_screens.mp4';
import take3 from '@assets/generated_videos/take_3_phone_hero_product_shot.mp4';
import take4 from '@assets/generated_videos/take_4_notification_push_alert.mp4';
import take5 from '@assets/generated_videos/take_5_copy_button_press_action.mp4';
import logoReveal from '@assets/generated_videos/logo_true_signal_animated_reveal.mp4';
import greenProfit from '@assets/generated_videos/green_profit_notification_celebration.mp4';
import manWinning from '@assets/generated_videos/man_genuine_celebration_winning_reaction.mp4';
import ctaFinal from '@assets/generated_videos/cta_final_5_dias_gratis_end_card.mp4';
import logoOriginal from '@assets/generated_videos/true_signal_shield_pulse_logo_animation.mp4';
import logoFinal from '@assets/generated_videos/shield_pulse_logo_true_gray_signal_white.mp4';
import logoBillion from '@assets/generated_videos/elegant_billion_style_logo_true_signal.mp4';
import greenMatrix from '@assets/generated_videos/matrix_style_professional_green_celebration.mp4';
import redFrustration from '@assets/generated_videos/red_frustration_hollywood_disappointment_moment.mp4';
import socialProof from '@assets/generated_videos/social_proof_stats_87_assertividade_premium.mp4';
import urgencyTimer from '@assets/generated_videos/urgency_countdown_ultimas_vagas_timer.mp4';
import matchMatrix from '@assets/generated_videos/football_match_matrix_algorithm_tracking.mp4';
import playerData from '@assets/generated_videos/sportsman_running_matrix_data_overlay.mp4';
import fanStadium from '@assets/generated_videos/fan_in_stadium_checking_phone_green_glow.mp4';
import pushNotif from '@assets/generated_videos/smartphone_push_notification_green_alert.mp4';
import floatingCard from '@assets/generated_videos/person_with_floating_notification_card_face.mp4';
import stadiumPOV from '@assets/generated_videos/stadium_pov_phone_screen_visible_overlay_ready.mp4';
import dronePossession from '@assets/generated_videos/drone_possession_web_tactical_green_lines.mp4';
import droneStriker from '@assets/generated_videos/drone_striker_tracking_hud_speed_metrics.mp4';
import droneHeatmap from '@assets/generated_videos/drone_corner_kick_heat_map_pressure_zone.mp4';
import warRoom from '@assets/generated_videos/war_room_analysts_green_screens_billions.mp4';
import matrixGlitch from '@assets/generated_videos/stadium_matrix_wireframe_digital_glitch.mp4';
import stressedEye from '@assets/generated_videos/stressed_eye_red_screen_frustration_defeat.mp4';
import luxuryNotif from '@assets/generated_videos/phone_notification_green_luxury_suit_urgent.mp4';
import serverDoor from '@assets/generated_videos/server_door_closing_access_restricted_vault.mp4';
import moneyShot from '@assets/generated_videos/money_shot_phone_holographic_cards_dataverse.mp4';
import moneyShotV2 from '@assets/generated_videos/phone_holographic_cards_with_stats_content.mp4';

const videos = [
  { 
    src: moneyShotV2, 
    title: "💰 MONEY SHOT V2: Cards com Conteúdo", 
    description: "Precisão 94% | Análise | Assertividade 84% | 20 Traders",
    filename: "money_shot_v2_stats.mp4",
    category: "final"
  },
  { 
    src: moneyShot, 
    title: "💰 MONEY SHOT V1: Data Stream", 
    description: "Versão anterior - celular + cards holográficos",
    filename: "money_shot_v1.mp4",
    category: "final"
  },
  { 
    src: warRoom, 
    title: "🏢 WAR ROOM: Equipe Billions Style", 
    description: "Sala de operações com 20 analistas e telas verdes",
    filename: "war_room_billions.mp4",
    category: "final"
  },
  { 
    src: matrixGlitch, 
    title: "👁️ GANCHO A: Olho de Deus Matrix", 
    description: "Estádio virando wireframe digital - scroll stopper",
    filename: "gancho_matrix_glitch.mp4",
    category: "final"
  },
  { 
    src: stressedEye, 
    title: "😤 GANCHO B: Frustração do Amador", 
    description: "Olho estressado refletindo tela vermelha de perdas",
    filename: "gancho_frustracão_red.mp4",
    category: "final"
  },
  { 
    src: luxuryNotif, 
    title: "💎 GANCHO C: Dopamina do Luxo", 
    description: "Celular premium + mão de terno pegando notificação",
    filename: "gancho_dopamina_luxo.mp4",
    category: "final"
  },
  { 
    src: serverDoor, 
    title: "🚪 URGÊNCIA: Porta do Cofre Fechando", 
    description: "Sala de servidores com acesso restrito",
    filename: "urgencia_porta_cofre.mp4",
    category: "final"
  },
  { 
    src: dronePossession, 
    title: "🚁 DRONE TEIA: Posse de Bola Tática", 
    description: "Vista aérea com linhas verdes conectando jogadores",
    filename: "drone_teia_posse.mp4",
    category: "final"
  },
  { 
    src: droneStriker, 
    title: "🚁 DRONE VELOCIDADE: Atacante + HUD", 
    description: "Tracking shot com velocímetro e métricas",
    filename: "drone_velocidade_hud.mp4",
    category: "final"
  },
  { 
    src: droneHeatmap, 
    title: "🚁 DRONE PRESSÃO: Mapa de Calor", 
    description: "Escanteio com zona de pressão crítica",
    filename: "drone_pressao_heatmap.mp4",
    category: "final"
  },
  { 
    src: stadiumPOV, 
    title: "📱 ESTÁDIO POV: Celular na Mão", 
    description: "Vista do estádio com tela do celular visível - pronto pra overlay",
    filename: "estadio_pov_celular.mp4",
    category: "final"
  },
  { 
    src: matchMatrix, 
    title: "⚽ JOGO AO VIVO: Algoritmo Matrix", 
    description: "Partida com análise de pressão e posse em tempo real",
    filename: "jogo_algoritmo_matrix.mp4",
    category: "final"
  },
  { 
    src: playerData, 
    title: "🏃 JOGADOR: Performance Matrix", 
    description: "Atleta correndo com dados de velocidade e métricas",
    filename: "jogador_performance_matrix.mp4",
    category: "final"
  },
  { 
    src: fanStadium, 
    title: "🏟️ TORCEDOR: Estádio + Celular", 
    description: "Fã na arquibancada vendo resultado - pronto pra overlay",
    filename: "torcedor_estadio_celular.mp4",
    category: "final"
  },
  { 
    src: pushNotif, 
    title: "📱 PUSH: Notificação no Celular", 
    description: "Smartphone recebendo alerta verde",
    filename: "push_notification_celular.mp4",
    category: "final"
  },
  { 
    src: floatingCard, 
    title: "🔔 CARD: Notificação Flutuante", 
    description: "Pessoa com card holográfico ao lado do rosto",
    filename: "card_notificacao_flutuante.mp4",
    category: "final"
  },
  { 
    src: redFrustration, 
    title: "😤 DOR/RED: Frustração Hollywood", 
    description: "Momento de derrota elegante - Contraste pro GREEN",
    filename: "red_frustration_hollywood.mp4",
    category: "final"
  },
  { 
    src: greenMatrix, 
    title: "🎬 GREEN MATRIX: Celebração Hollywood", 
    description: "Vitória elegante estilo Matrix - Meta Ads Ready",
    filename: "green_matrix_hollywood.mp4",
    category: "final"
  },
  { 
    src: socialProof, 
    title: "📊 PROVA SOCIAL: 87% Assertividade", 
    description: "Estatísticas premium estilo Bloomberg/Matrix",
    filename: "prova_social_stats.mp4",
    category: "final"
  },
  { 
    src: urgencyTimer, 
    title: "⏰ URGÊNCIA: Últimas Vagas", 
    description: "Countdown elegante com escassez",
    filename: "urgencia_countdown.mp4",
    category: "final"
  },
  { 
    src: logoBillion, 
    title: "🏆 LOGO BILLION: Estilo Premium", 
    description: "Escudo + pulso + texto elegante sem sombras",
    filename: "logo_billion_premium.mp4",
    category: "final"
  },
  { 
    src: logoFinal, 
    title: "LOGO V2: Com sombra verde", 
    description: "Versão com efeito glow no texto",
    filename: "logo_v2_glow.mp4",
    category: "final"
  },
  { 
    src: logoOriginal, 
    title: "LOGO V1: ESCUDO + PULSO", 
    description: "Versão anterior sem texto estilizado",
    filename: "logo_v1_escudo_pulso.mp4",
    category: "final"
  },
  { 
    src: logoReveal, 
    title: "ABERTURA: LOGO ANIMADA", 
    description: "Logo TRUE SIGNAL surgindo com efeito neon",
    filename: "abertura_logo.mp4",
    category: "final"
  },
  { 
    src: greenProfit, 
    title: "CLÍMAX: GREEN +R$ 1.250", 
    description: "Notificação de lucro com confete",
    filename: "climax_green_lucro.mp4",
    category: "final"
  },
  { 
    src: manWinning, 
    title: "REAÇÃO: CELEBRAÇÃO REAL", 
    description: "Cliente comemorando vitória autêntica",
    filename: "reacao_celebracao.mp4",
    category: "final"
  },
  { 
    src: ctaFinal, 
    title: "CTA: 5 DIAS GRÁTIS", 
    description: "Encerramento com chamada para ação",
    filename: "cta_5_dias_gratis.mp4",
    category: "final"
  },
  { 
    src: take1, 
    title: "TAKE 1: CAMPO + DADOS", 
    description: "Campo de futebol com HUD e dados TRUE SIGNAL",
    filename: "take1_campo_dados.mp4",
    category: "roteiro"
  },
  { 
    src: take2, 
    title: "TAKE 2: WAR ROOM", 
    description: "Central de operações com analistas e telas",
    filename: "take2_war_room.mp4",
    category: "roteiro"
  },
  { 
    src: take3, 
    title: "TAKE 3: CELULAR HERO", 
    description: "Celular com app TRUE SIGNAL em destaque",
    filename: "take3_celular_hero.mp4",
    category: "roteiro"
  },
  { 
    src: take4, 
    title: "TAKE 4: NOTIFICAÇÃO", 
    description: "Push notification TRUE SIGNAL chegando",
    filename: "take4_notificacao.mp4",
    category: "roteiro"
  },
  { 
    src: take5, 
    title: "TAKE 5: COPIAR BILHETE", 
    description: "Dedo pressionando botão COPIAR",
    filename: "take5_copiar_bilhete.mp4",
    category: "roteiro"
  },
  { 
    src: videoMockup1, 
    title: "MOCKUP: MÃOS + CELULAR", 
    description: "Celular para adicionar tela depois",
    filename: "mockup_maos_celular.mp4",
    category: "mockup"
  },
  { 
    src: videoMockup2, 
    title: "MOCKUP: SOFÁ + CELULAR", 
    description: "Pessoa no sofá com celular para edição",
    filename: "mockup_sofa_celular.mp4",
    category: "mockup"
  },
  { 
    src: videoManCelebrate, 
    title: "CELEBRAÇÃO: CAFÉ", 
    description: "Homem comemorando no café",
    filename: "celebracao_cafe.mp4",
    category: "mockup"
  },
  { 
    src: videoStats3D, 
    title: "STATS: GRÁFICOS 3D", 
    description: "Estatísticas flutuantes 3D com TRUE SIGNAL",
    filename: "stats_graficos_3d.mp4",
    category: "stats"
  },
  { 
    src: videoStatsMatch, 
    title: "STATS: ANÁLISE JOGO", 
    description: "Visualização de estatísticas de partida",
    filename: "stats_analise_jogo.mp4",
    category: "stats"
  },
  { 
    src: videoDrone1, 
    title: "DRONE: VISÃO AÉREA", 
    description: "Vista aérea do campo com tracking",
    filename: "drone_visao_aerea.mp4",
    category: "drone"
  },
  { 
    src: videoDrone2, 
    title: "DRONE: ANÁLISE TÁTICA", 
    description: "Visão de cima com overlay de dados",
    filename: "drone_analise_tatica.mp4",
    category: "drone"
  },
  { 
    src: videoDrone3, 
    title: "DRONE: JOGO NOTURNO", 
    description: "Partida noturna com IA captando dados",
    filename: "drone_jogo_noturno.mp4",
    category: "drone"
  },
  { 
    src: videoTeam, 
    title: "EQUIPE TRABALHANDO", 
    description: "Time no escritório com camisetas verdes",
    filename: "equipe_trabalhando.mp4",
    category: "realista"
  },
  { 
    src: videoAnalyst, 
    title: "ANALISTA NO PC", 
    description: "Close-up do dashboard na tela",
    filename: "analista_pc.mp4",
    category: "realista"
  },
  { 
    src: videoManPhone, 
    title: "USANDO O APP", 
    description: "Homem usando o app no escritório",
    filename: "usando_app_celular.mp4",
    category: "realista"
  },
  { 
    src: videoWalkthrough, 
    title: "TOUR ESCRITÓRIO", 
    description: "Walkthrough pelo escritório moderno",
    filename: "tour_escritorio.mp4",
    category: "realista"
  },
  { 
    src: videoWoman, 
    title: "CELEBRANDO VITÓRIA", 
    description: "Mulher comemorando resultado",
    filename: "celebrando_vitoria.mp4",
    category: "realista"
  },
  { 
    src: video1, 
    title: "CENA 1: O Gancho", 
    description: "Chute em slow-motion com dados",
    filename: "cena1_gancho.mp4",
    category: "cinematico"
  },
  { 
    src: video2, 
    title: "CENA 2: War Room", 
    description: "Centro de operações",
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
    description: "Gol e celebração",
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

const categoryLabels: Record<string, { label: string; color: string }> = {
  final: { label: '⭐ ESSENCIAL', color: 'bg-green-500/30 text-green-300' },
  roteiro: { label: 'ROTEIRO ADS', color: 'bg-yellow-500/30 text-yellow-300' },
  mockup: { label: 'MOCKUP', color: 'bg-pink-500/30 text-pink-300' },
  stats: { label: 'ESTATÍSTICAS', color: 'bg-orange-500/30 text-orange-300' },
  drone: { label: 'DRONE FX', color: 'bg-cyan-500/30 text-cyan-300' },
  realista: { label: 'EQUIPE REAL', color: 'bg-blue-500/30 text-blue-300' },
  cinematico: { label: 'CINEMATOGRÁFICO', color: 'bg-purple-500/30 text-purple-300' },
};

export default function VideoPromoPage() {
  const [, setLocation] = useLocation();
  const [selectedVideo, setSelectedVideo] = useState(0);
  const [filter, setFilter] = useState<string>('todos');

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
  const currentCategory = currentVideo ? categoryLabels[currentVideo.category] : null;

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
            Baixar ({filteredVideos.length})
          </Button>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Vídeos Promocionais</h1>
          <p className="text-gray-400">TRUE SIGNAL - {videos.length} vídeos para sua campanha</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <Button
            onClick={() => { setFilter('todos'); setSelectedVideo(0); }}
            variant={filter === 'todos' ? 'default' : 'outline'}
            className={filter === 'todos' ? 'bg-primary text-black' : 'border-white/20 text-white'}
            size="sm"
          >
            Todos ({videos.length})
          </Button>
          <Button
            onClick={() => { setFilter('final'); setSelectedVideo(0); }}
            variant={filter === 'final' ? 'default' : 'outline'}
            className={filter === 'final' ? 'bg-green-500 text-black' : 'border-white/20 text-white'}
            size="sm"
          >
            ⭐ Essencial (27)
          </Button>
          <Button
            onClick={() => { setFilter('roteiro'); setSelectedVideo(0); }}
            variant={filter === 'roteiro' ? 'default' : 'outline'}
            className={filter === 'roteiro' ? 'bg-yellow-500 text-black' : 'border-white/20 text-white'}
            size="sm"
          >
            Roteiro (5)
          </Button>
          <Button
            onClick={() => { setFilter('mockup'); setSelectedVideo(0); }}
            variant={filter === 'mockup' ? 'default' : 'outline'}
            className={filter === 'mockup' ? 'bg-pink-500 text-black' : 'border-white/20 text-white'}
            size="sm"
          >
            Mockup (3)
          </Button>
          <Button
            onClick={() => { setFilter('stats'); setSelectedVideo(0); }}
            variant={filter === 'stats' ? 'default' : 'outline'}
            className={filter === 'stats' ? 'bg-orange-500 text-black' : 'border-white/20 text-white'}
            size="sm"
          >
            Stats (2)
          </Button>
          <Button
            onClick={() => { setFilter('drone'); setSelectedVideo(0); }}
            variant={filter === 'drone' ? 'default' : 'outline'}
            className={filter === 'drone' ? 'bg-cyan-500 text-black' : 'border-white/20 text-white'}
            size="sm"
          >
            Drone (3)
          </Button>
          <Button
            onClick={() => { setFilter('realista'); setSelectedVideo(0); }}
            variant={filter === 'realista' ? 'default' : 'outline'}
            className={filter === 'realista' ? 'bg-blue-500 text-black' : 'border-white/20 text-white'}
            size="sm"
          >
            Equipe (5)
          </Button>
          <Button
            onClick={() => { setFilter('cinematico'); setSelectedVideo(0); }}
            variant={filter === 'cinematico' ? 'default' : 'outline'}
            className={filter === 'cinematico' ? 'bg-purple-500 text-black' : 'border-white/20 text-white'}
            size="sm"
          >
            Cine (6)
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
              {currentCategory && (
                <span className={`text-xs px-2 py-0.5 rounded ${currentCategory.color}`}>
                  {currentCategory.label}
                </span>
              )}
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

        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
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
                className="w-full h-16 object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Play className="w-5 h-5 text-white/80" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-1">
                <p className="text-white text-[8px] font-semibold truncate">{video.title}</p>
              </div>
              {selectedVideo === index && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </div>

        <div className="bg-white/5 rounded-xl p-4 text-center">
          <p className="text-gray-400 text-sm">
            <span className="text-primary font-semibold">{videos.length} vídeos</span> • MP4 • 8 segundos • 9:16
          </p>
          <p className="text-gray-500 text-xs mt-2">
            5 Roteiro ADS + 3 Mockup + 2 Stats + 3 Drone + 5 Equipe + 6 Cinematográfico
          </p>
        </div>
      </div>
    </div>
  );
}
