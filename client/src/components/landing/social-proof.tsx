import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { TrendingUp, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback } from 'react';

export function SocialProof() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
  
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);
  
  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);
  
  const results = [
    {
      name: 'Rafael S.',
      image: 'RS',
      sequence: '12 Greens',
      profit: '+R$ 3.247',
      period: 'Últimos 15 dias',
    },
    {
      name: 'Mariana L.',
      image: 'ML',
      sequence: '8 Greens',
      profit: '+R$ 1.890',
      period: 'Última semana',
    },
    {
      name: 'Carlos M.',
      image: 'CM',
      sequence: '15 Greens',
      profit: '+R$ 4.523',
      period: 'Último mês',
    },
    {
      name: 'Juliana F.',
      image: 'JF',
      sequence: '10 Greens',
      profit: '+R$ 2.156',
      period: 'Últimos 12 dias',
    },
    {
      name: 'Pedro H.',
      image: 'PH',
      sequence: '9 Greens',
      profit: '+R$ 2.780',
      period: 'Última quinzena',
    },
    {
      name: 'Ana C.',
      image: 'AC',
      sequence: '14 Greens',
      profit: '+R$ 5.120',
      period: 'Último mês',
    },
  ];
  
  return (
    <section ref={ref} className="relative py-20 px-4 bg-gradient-to-b from-black via-[#0a0a0a] to-[#121212]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-3xl lg:text-4xl font-black text-white mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
            Quem Usa a IA Não Volta para o{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">
              "Achômetro"
            </span>
          </h2>
          <p className="text-xl text-gray-400">
            Resultados reais de operadores reais
          </p>
        </motion.div>
        
        {/* Results Carousel */}
        <div className="relative mb-12">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6">
              {results.map((result, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 50 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="relative flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0"
                  data-testid={`card-result-${i}`}
                >
                  <div className="relative group mr-6">
                    <div className="absolute inset-0 bg-[#33b864]/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="relative bg-gradient-to-br from-white/5 to-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-[#33b864]/30 transition-all h-full">
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#33b864] to-[#2ea558] flex items-center justify-center text-lg font-black">
                          {result.image}
                        </div>
                        <div>
                          <div className="font-semibold text-white" data-testid={`text-name-${i}`}>{result.name}</div>
                          <div className="text-xs text-gray-500">{result.period}</div>
                        </div>
                      </div>
                      
                      {/* Stats */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-[#33b864]/10 border border-[#33b864]/20 rounded-xl">
                          <span className="text-sm text-gray-300">Sequência</span>
                          <span className="text-sm font-bold text-[#33b864]" data-testid={`text-sequence-${i}`}>{result.sequence}</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#33b864]/20 to-[#33b864]/10 border border-[#33b864]/30 rounded-xl">
                          <TrendingUp className="w-5 h-5 text-[#33b864]" />
                          <span className="text-lg font-black text-[#33b864] font-mono" data-testid={`text-profit-${i}`}>{result.profit}</span>
                        </div>
                      </div>
                      
                      {/* Check badge */}
                      <div className="absolute top-4 right-4">
                        <div className="w-6 h-6 rounded-full bg-[#33b864] flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-black" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Navigation buttons */}
          <button
            onClick={scrollPrev}
            data-testid="button-social-proof-prev"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 rounded-full bg-[#33b864] text-black hover:bg-[#2ea558] transition-colors shadow-xl shadow-[#33b864]/50 flex items-center justify-center z-10"
            aria-label="Previous result"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={scrollNext}
            data-testid="button-social-proof-next"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 rounded-full bg-[#33b864] text-black hover:bg-[#2ea558] transition-colors shadow-xl shadow-[#33b864]/50 flex items-center justify-center z-10"
            aria-label="Next result"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
        
        {/* Testimonial quote */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.2 }}
          className="mt-16 max-w-3xl mx-auto text-center"
        >
          <div className="relative p-8 bg-gradient-to-br from-white/5 to-black/50 backdrop-blur-xl border border-[#33b864]/20 rounded-3xl">
            <div className="text-6xl text-[#33b864]/20 font-serif mb-4">"</div>
            <p className="text-lg md:text-xl text-gray-300 italic mb-6 leading-relaxed">
              Gastei anos tentando análises manuais. Em 3 semanas com o Ocean Signal já recuperei tudo que perdi e estou lucrando consistentemente. A IA não erra.
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#33b864] to-[#2ea558]" />
              <div className="text-left">
                <div className="font-semibold text-white">Pedro R.</div>
                <div className="text-sm text-gray-500">Operador há 2 anos</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
