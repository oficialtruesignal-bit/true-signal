import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Radar, FileCheck, BarChart3, Users, Headphones, Shield, Repeat, CheckCircle2 } from 'lucide-react';

export function OfferPack() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  const arsenal = [
    {
      icon: Radar,
      title: 'Scanner de Oportunidades Ao Vivo 24/7',
      description: 'Sistema autônomo que nunca dorme. Monitora 1.400+ ligas simultaneamente.',
    },
    {
      icon: FileCheck,
      title: 'Bilhetes Prontos Pré-Jogo Validado por IA',
      description: 'Receba sinais com +90% de assertividade direto no app. Zero trabalho manual.',
    },
    {
      icon: BarChart3,
      title: 'Dashboard de Gestão de Banca Automático',
      description: 'Acompanhe seu crescimento, ROI e sequências em tempo real. Analytics profissional.',
    },
    {
      icon: Users,
      title: 'Acesso à Comunidade VIP (Networking)',
      description: 'Conecte-se com outros operadores de alto nível. Troca de estratégias e insights.',
    },
    {
      icon: Headphones,
      title: 'Suporte Prioritário 24/7',
      description: 'Time dedicado para resolver qualquer dúvida ou problema em minutos.',
    },
    {
      icon: Shield,
      title: 'Protocolo de Segurança de Banca',
      description: 'Sistema de proteção contra drawdowns severos. Preservação de capital.',
    },
    {
      icon: Repeat,
      title: 'Atualizações Constantes do Algoritmo',
      description: 'Nossa IA evolui continuamente. Você sempre terá a versão mais avançada.',
    },
    {
      icon: CheckCircle2,
      title: 'Garantia de Reembolso Automático',
      description: '15 dias para testar sem risco. Não lucrou? Devolvemos tudo.',
    },
  ];
  
  return (
    <section ref={ref} className="relative py-20 px-4 bg-gradient-to-b from-[#0a0a0a] via-[#121212] to-black">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #33b864 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#33b864]/10 border border-[#33b864]/30 rounded-full mb-6">
            <div className="w-2 h-2 rounded-full bg-[#33b864] animate-pulse" />
            <span className="text-sm text-[#33b864] font-semibold">Tudo Incluído</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
            O Arsenal Completo do{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#33b864] to-[#2ea558]">
              Operador Moderno
            </span>
          </h2>
          <p className="text-xl text-gray-400">
            Tudo que você precisa para operar como um profissional
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {arsenal.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#33b864]/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
              
              <div className="relative flex items-start gap-4 p-6 bg-gradient-to-br from-white/5 to-black/50 backdrop-blur-xl border border-white/10 rounded-2xl hover:border-[#33b864]/30 transition-all duration-300">
                <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-[#33b864]/10 border border-[#33b864]/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <item.icon className="w-6 h-6 text-[#33b864]" />
                </div>
                
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                
                <div className="absolute top-4 right-4">
                  <CheckCircle2 className="w-5 h-5 text-[#33b864] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <div className="inline-block px-6 py-3 bg-gradient-to-r from-[#33b864]/20 to-[#2ea558]/20 border border-[#33b864]/30 rounded-2xl">
            <p className="text-sm text-gray-400 mb-1">Valor Total do Pacote:</p>
            <p className="text-3xl font-black text-[#33b864]">R$ 2.847/mês</p>
            <p className="text-xs text-gray-500 mt-1">se contratado separadamente</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
