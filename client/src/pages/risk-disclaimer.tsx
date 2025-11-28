import { Link } from 'wouter';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

export default function RiskDisclaimerPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sora">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <Link href="/">
          <button className="flex items-center gap-2 text-gray-400 hover:text-[#33b864] transition-colors mb-8" data-testid="button-back-home">
            <ArrowLeft className="w-5 h-5" />
            Voltar para Home
          </button>
        </Link>

        {/* Title */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-black" style={{ fontFamily: 'Sora, sans-serif' }}>
            Isenção de Responsabilidade e Riscos
          </h1>
        </div>

        {/* Content */}
        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Natureza do Serviço</h2>
            <p>
              A <span className="text-[#33b864] font-semibold">TRUE SIGNAL</span> é uma plataforma estritamente <strong className="text-white">informativa e estatística</strong>. NÃO somos uma casa de apostas. Não recebemos depósitos, não custodiamos valores financeiros e não pagamos prêmios.
            </p>
            <p className="mt-4">
              Nossa função é fornecer análises esportivas baseadas em inteligência artificial e estatísticas avançadas para fins educacionais e informativos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Risco Financeiro</h2>
            <p>
              <strong className="text-red-400">ATENÇÃO:</strong> Apostas esportivas envolvem <strong className="text-white">alto risco de perda de capital</strong>. O desempenho passado dos nossos bilhetes ("Greens") <strong className="text-white">não garante resultados futuros</strong>.
            </p>
            <p className="mt-4">
              Nossas análises são baseadas em probabilidades estatísticas e algoritmos preditivos, não em certezas. Mesmo com alta assertividade histórica, <strong className="text-white">perdas podem e vão ocorrer</strong>.
            </p>
            <div className="bg-red-950/20 border border-red-500/30 rounded-xl p-6 mt-4">
              <p className="text-red-300 font-semibold">
                ⚠️ Nunca aposte dinheiro que você não pode perder. Apostas esportivas não são uma fonte de renda garantida.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Isenção de Responsabilidade</h2>
            <p>
              O usuário é <strong className="text-white">totalmente responsável</strong> por suas decisões financeiras. A TRUE SIGNAL não se responsabiliza por:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4 ml-4">
              <li>Perdas financeiras decorrentes do uso de nossas informações;</li>
              <li>Decisões de apostas tomadas com base em nossos bilhetes;</li>
              <li>Alterações inesperadas em odds, jogos cancelados ou adiados;</li>
              <li>Problemas técnicos com casas de apostas de terceiros;</li>
              <li>Vícios ou comportamentos compulsivos relacionados a apostas.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Jogo Responsável</h2>
            <p>
              Apoiamos o <strong className="text-white">Jogo Responsável</strong>. Se você ou alguém que conhece tem problemas com jogos de azar, procure ajuda profissional:
            </p>
            <div className="bg-[#33b864]/10 border border-[#33b864]/30 rounded-xl p-6 mt-4">
              <p className="text-[#33b864] font-semibold mb-2">Centro de Valorização da Vida (CVV)</p>
              <p className="text-gray-300">Telefone: 188 (disponível 24h)</p>
              <p className="text-gray-300">Site: <a href="https://www.cvv.org.br" className="underline hover:text-[#33b864]" target="_blank" rel="noopener noreferrer">www.cvv.org.br</a></p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Proibição para Menores de Idade</h2>
            <p>
              A TRUE SIGNAL é destinada exclusivamente a <strong className="text-white">maiores de 18 anos</strong>. Apostas esportivas por menores de idade são ilegais e estritamente proibidas.
            </p>
            <div className="flex items-center gap-4 mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <div className="text-6xl">🔞</div>
              <p className="text-yellow-200 font-semibold">Proibido para menores de 18 anos</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Conformidade Legal</h2>
            <p>
              É responsabilidade do usuário verificar se as apostas esportivas são legais em sua jurisdição. A TRUE SIGNAL não encoraja atividades ilegais e não se responsabiliza pelo uso indevido da plataforma.
            </p>
          </section>

          <section className="border-t border-gray-800 pt-8">
            <p className="text-sm text-gray-500 italic">
              Última atualização: 26 de novembro de 2024
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Ao usar a TRUE SIGNAL, você declara ter lido, compreendido e aceito todos os riscos descritos neste documento.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
