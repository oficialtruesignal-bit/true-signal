import { Link } from 'wouter';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

export default function RiskDisclaimerPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link href="/">
            <button className="flex items-center gap-2 text-gray-400 hover:text-[#33b864] transition-colors mb-6" data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4" />
              Voltar para Home
            </button>
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <h1 className="text-4xl font-black text-white">Isenção de Responsabilidade e Riscos</h1>
          </div>
          
          <p className="text-gray-400">Leia atentamente antes de utilizar o Ocean Signal</p>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none space-y-8">
          <section className="bg-red-500/10 border-2 border-red-500/30 rounded-xl p-8">
            <h2 className="text-3xl font-black text-red-400 mb-4">⚠️ AVISO CRÍTICO</h2>
            <p className="text-white text-lg leading-relaxed mb-4">
              O <strong>Ocean Signal NÃO é uma casa de apostas</strong>. Somos uma plataforma de <strong>análise estatística e inteligência de dados</strong> aplicada ao mercado esportivo.
            </p>
            <div className="space-y-3 text-gray-300">
              <p>✅ <strong className="text-white">O que FAZEMOS:</strong> Fornecemos bilhetes prontos com análises probabilísticas</p>
              <p>❌ <strong className="text-white">O que NÃO FAZEMOS:</strong> NÃO recebemos depósitos, NÃO custodiamos valores, NÃO pagamos prêmios</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Natureza do Serviço</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              O Ocean Signal é uma <strong className="text-white">ferramenta estritamente informativa</strong>. Atuamos como:
            </p>
            <ul className="space-y-2 text-gray-300 ml-6">
              <li>• <strong className="text-white">Provedor de informação:</strong> Análises, estatísticas e sugestões de apostas</li>
              <li>• <strong className="text-white">Consultoria especializada:</strong> Curadoria de oportunidades por traders profissionais</li>
              <li>• <strong className="text-white">Tecnologia de suporte:</strong> IA para processar milhares de dados em segundos</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              <strong className="text-white">IMPORTANTE:</strong> A decisão final de apostar e o valor apostado são de <strong className="text-red-400">sua exclusiva responsabilidade</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Riscos Financeiros</h2>
            <div className="bg-[#121212] border border-red-500/30 rounded-xl p-6 mb-4">
              <h3 className="text-xl font-bold text-red-400 mb-4">Apostas Envolvem Alto Risco</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                Apostas esportivas são uma forma de <strong className="text-white">entretenimento de alto risco financeiro</strong>. Você pode:
              </p>
              <ul className="space-y-2 text-gray-300 ml-6">
                <li>• <strong className="text-red-400">Perder 100% do capital apostado</strong></li>
                <li>• Não recuperar o investimento mesmo seguindo todas as nossas análises</li>
                <li>• Sofrer perdas consecutivas (Red Sequences)</li>
                <li>• Enfrentar limitações de conta impostas pelas casas de apostas</li>
              </ul>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
              <h3 className="text-xl font-bold text-yellow-400 mb-3">⚠️ Desempenho Passado ≠ Resultados Futuros</h3>
              <p className="text-gray-300 leading-relaxed">
                Mesmo que nossos bilhetes históricos apresentem <strong className="text-white">87% de assertividade</strong>, isso <strong className="text-red-400">NÃO garante</strong> que bilhetes futuros terão o mesmo desempenho. Estatísticas passadas são referenciais, não promessas.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Isenção de Responsabilidade Legal</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Ao utilizar o Ocean Signal, você <strong className="text-white">reconhece e concorda expressamente</strong> que:
            </p>

            <div className="space-y-4">
              <div className="bg-[#121212] border-l-4 border-red-500 p-5">
                <h4 className="text-white font-bold mb-2">🚫 Perdas Financeiras</h4>
                <p className="text-sm text-gray-300">
                  O Ocean Signal <strong>NÃO se responsabiliza</strong> por quaisquer perdas financeiras decorrentes de apostas realizadas com base em nossos bilhetes, análises ou sugestões.
                </p>
              </div>

              <div className="bg-[#121212] border-l-4 border-red-500 p-5">
                <h4 className="text-white font-bold mb-2">🚫 Garantia de Lucro</h4>
                <p className="text-sm text-gray-300">
                  <strong>NÃO garantimos</strong> lucros, resultados positivos ou retorno sobre investimento. Nossas análises são probabilísticas, baseadas em dados históricos e variáveis imprevisíveis.
                </p>
              </div>

              <div className="bg-[#121212] border-l-4 border-red-500 p-5">
                <h4 className="text-white font-bold mb-2">🚫 Decisões de Terceiros</h4>
                <p className="text-sm text-gray-300">
                  Não controlamos as decisões das casas de apostas (odds, limitações de conta, cancelamentos) nem os resultados das partidas esportivas.
                </p>
              </div>

              <div className="bg-[#121212] border-l-4 border-red-500 p-5">
                <h4 className="text-white font-bold mb-2">🚫 Indisponibilidade Técnica</h4>
                <p className="text-sm text-gray-300">
                  Embora busquemos 99.9% de uptime, não nos responsabilizamos por falhas temporárias, manutenções ou indisponibilidade que impeçam acesso aos bilhetes.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Sua Responsabilidade Individual</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Você é o <strong className="text-white">único e exclusivo responsável</strong> por:
            </p>
            <ul className="space-y-3 text-gray-300 ml-6">
              <li>• <strong className="text-white">Verificar a legalidade</strong> das apostas esportivas no seu país/estado antes de utilizar o serviço</li>
              <li>• <strong className="text-white">Gerenciar seu bankroll</strong> (capital de apostas) de forma prudente e responsável</li>
              <li>• <strong className="text-white">Controlar impulsos</strong> e não apostar valores além da sua capacidade financeira</li>
              <li>• <strong className="text-white">Reconhecer sinais de vício</strong> em jogos de azar e buscar ajuda profissional se necessário</li>
              <li>• <strong className="text-white">Pagar impostos</strong> sobre eventuais ganhos conforme legislação tributária vigente</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Limitações do Algoritmo e Curadoria</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Apesar da tecnologia avançada e dos 20 traders especializados, nosso sistema <strong className="text-white">possui limitações inerentes</strong>:
            </p>
            <div className="bg-[#121212] border border-[#33b864]/20 rounded-xl p-6">
              <ul className="space-y-3 text-gray-300">
                <li>• <strong className="text-white">Eventos Imprevisíveis:</strong> Lesões de última hora, expulsões, decisões arbitrárias de árbitros</li>
                <li>• <strong className="text-white">Fatores Externos:</strong> Condições climáticas, motivação de times, manipulação de resultados</li>
                <li>• <strong className="text-white">Volatilidade das Odds:</strong> As cotações mudam constantemente e podem variar entre casas</li>
                <li>• <strong className="text-white">Limitação Humana:</strong> Nossos traders são especialistas, mas não infalíveis</li>
                <li>• <strong className="text-white">Dados Incompletos:</strong> Nem sempre temos acesso a 100% das estatísticas relevantes</li>
              </ul>
            </div>
          </section>

          <section className="bg-gradient-to-r from-red-500/10 to-yellow-500/10 border border-red-500/30 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">6. Jogo Responsável (+18)</h2>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 bg-red-500/20 border-2 border-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-3xl font-black text-red-400">+18</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Proibido para Menores</h3>
                <p className="text-gray-300 leading-relaxed">
                  Apostas são <strong className="text-white">exclusivas para maiores de 18 anos</strong>. O Ocean Signal verifica a idade durante o cadastro. Contas de menores serão canceladas imediatamente.
                </p>
              </div>
            </div>

            <div className="bg-black/50 rounded-lg p-5 mt-6">
              <h4 className="text-[#33b864] font-bold mb-3">🆘 Sinais de Vício em Apostas:</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Apostar valores além da sua capacidade financeira</li>
                <li>• Mentir para familiares sobre quanto você aposta</li>
                <li>• Tentar recuperar perdas com apostas cada vez maiores (tilting)</li>
                <li>• Negligenciar trabalho, estudos ou relacionamentos por causa das apostas</li>
                <li>• Sentir ansiedade ou irritação quando não está apostando</li>
              </ul>
              <p className="text-white font-semibold mt-4">
                Se você reconhece esses sinais, procure ajuda:<br />
                <span className="text-[#33b864]">CVV (Centro de Valorização da Vida): 188</span><br />
                <span className="text-[#33b864]">Jogadores Anônimos: www.jogadoresanonimos.com.br</span>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Mudanças Regulatórias</h2>
            <p className="text-gray-300 leading-relaxed">
              O mercado de apostas esportivas está em <strong className="text-white">constante evolução regulatória</strong> no Brasil. Mudanças nas leis podem afetar a disponibilidade ou funcionamento do Ocean Signal. Nos reservamos o direito de ajustar o serviço para cumprir novas exigências legais.
            </p>
          </section>

          <section className="bg-[#33b864]/10 border border-[#33b864]/30 rounded-xl p-8">
            <h2 className="text-3xl font-black text-[#33b864] mb-4">Declaração Final</h2>
            <p className="text-white text-lg leading-relaxed mb-4">
              Ao se cadastrar e utilizar o Ocean Signal, você declara que:
            </p>
            <ul className="space-y-2 text-gray-300 text-lg">
              <li>✅ Leu e compreendeu todos os riscos descritos nesta página</li>
              <li>✅ É maior de 18 anos e possui capacidade legal para apostar</li>
              <li>✅ Assume total responsabilidade por suas decisões financeiras</li>
              <li>✅ Reconhece que apostas envolvem risco de perda total do capital</li>
              <li>✅ Não responsabilizará o Ocean Signal por perdas financeiras</li>
            </ul>
          </section>

          <section className="text-center bg-[#121212] rounded-xl p-8">
            <p className="text-gray-400 text-sm">
              Dúvidas sobre riscos e responsabilidades?<br />
              <strong className="text-white">E-mail:</strong> <span className="text-[#33b864]">legal@oceansignal.com.br</span>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
