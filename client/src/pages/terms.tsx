import { Link } from 'wouter';
import { ArrowLeft, Shield } from 'lucide-react';

export default function TermsPage() {
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
            <div className="w-12 h-12 bg-[#33b864]/10 border border-[#33b864]/30 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-[#33b864]" />
            </div>
            <h1 className="text-4xl font-black text-white">Termos e Condições de Uso</h1>
          </div>
          
          <p className="text-gray-400">Última atualização: Novembro de 2024</p>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Sobre o Serviço</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              O <span className="text-[#33b864] font-semibold">Ocean Signal</span> é uma plataforma de <strong>análise estatística e inteligência de dados</strong> aplicada ao mercado de apostas esportivas. Fornecemos bilhetes prontos (sugestões de apostas) com base em análises de probabilidade, estatísticas históricas e curadoria humana especializada.
            </p>
            <p className="text-gray-300 leading-relaxed">
              <strong className="text-white">IMPORTANTE:</strong> NÃO somos uma casa de apostas. NÃO recebemos depósitos, NÃO custodiamos valores financeiros e NÃO pagamos prêmios. Somos uma ferramenta de informação e análise.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Modelo de Assinatura e Período de Teste</h2>
            <div className="bg-[#121212] border border-[#33b864]/20 rounded-xl p-6 mb-4">
              <h3 className="text-lg font-bold text-[#33b864] mb-3">Plano Gratuito (Trial - 15 Dias)</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Acesso limitado: <strong>1 bilhete selecionado por dia</strong></li>
                <li>• Visualização do painel de análises</li>
                <li>• Sem exigência de cartão de crédito</li>
                <li>• Cancelamento automático após 15 dias</li>
              </ul>
            </div>
            
            <div className="bg-[#121212] border border-[#33b864]/20 rounded-xl p-6">
              <h3 className="text-lg font-bold text-[#33b864] mb-3">Ocean Prime (Assinatura Mensal)</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Bilhetes ilimitados por dia</li>
                <li>• Acesso às melhores odds identificadas</li>
                <li>• Análises ao vivo durante partidas</li>
                <li>• Suporte prioritário via WhatsApp</li>
                <li>• Cobrança mensal recorrente de <strong>R$ 99,87</strong></li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Cancelamento e Reembolso</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              O usuário pode <strong>cancelar a assinatura a qualquer momento</strong> através do painel de configurações. O cancelamento:
            </p>
            <ul className="space-y-2 text-gray-300 ml-6">
              <li>• Interrompe cobranças futuras</li>
              <li>• Mantém o acesso até o fim do período já pago</li>
              <li>• Não gera reembolso proporcional do ciclo atual</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              <strong className="text-white">Política de Reembolso:</strong> Não oferecemos reembolsos após a confirmação da assinatura, salvo casos excepcionais de erro técnico comprovado da plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Proibições e Uso Indevido</h2>
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
              <p className="text-red-400 font-semibold mb-3">É ESTRITAMENTE PROIBIDO:</p>
              <ul className="space-y-2 text-gray-300">
                <li>• Revender, redistribuir ou comercializar os bilhetes do Ocean Signal</li>
                <li>• Compartilhar seu acesso em grupos de terceiros (Telegram, WhatsApp, Discord)</li>
                <li>• Realizar engenharia reversa do algoritmo ou copiar nossa metodologia</li>
                <li>• Usar bots, scrapers ou ferramentas automatizadas sem autorização</li>
                <li>• Criar múltiplas contas para abusar do período de teste</li>
              </ul>
            </div>
            <p className="text-gray-300 leading-relaxed mt-4">
              <strong>Penalidade:</strong> O descumprimento das regras acima resultará no <strong className="text-red-400">banimento imediato</strong> da conta sem direito a reembolso.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Responsabilidades do Usuário</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Ao utilizar o Ocean Signal, você reconhece e concorda que:
            </p>
            <ul className="space-y-3 text-gray-300 ml-6">
              <li>• Você é <strong className="text-white">maior de 18 anos</strong> e possui capacidade legal para realizar apostas esportivas</li>
              <li>• Apostas envolvem <strong className="text-white">risco financeiro real</strong> e você pode perder todo o capital apostado</li>
              <li>• Nossas análises são probabilísticas e <strong className="text-white">não garantem lucro</strong></li>
              <li>• Você é o único responsável por suas decisões financeiras e apostas realizadas</li>
              <li>• Você cumprirá as leis de apostas vigentes no seu país/estado</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Limitação de Responsabilidade</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              O Ocean Signal <strong className="text-white">NÃO se responsabiliza</strong> por:
            </p>
            <ul className="space-y-2 text-gray-300 ml-6">
              <li>• Perdas financeiras decorrentes de apostas realizadas com base em nossos bilhetes</li>
              <li>• Indisponibilidade temporária da plataforma por manutenção ou falhas técnicas</li>
              <li>• Mudanças nas odds oferecidas pelas casas de apostas</li>
              <li>• Alterações regulatórias no mercado de apostas esportivas</li>
              <li>• Decisões arbitrárias das casas de apostas (limitação de conta, cancelamento de apostas, etc.)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Modificações nos Termos</h2>
            <p className="text-gray-300 leading-relaxed">
              O Ocean Signal reserva-se o direito de modificar estes Termos a qualquer momento. Mudanças significativas serão comunicadas por e-mail com <strong>7 dias de antecedência</strong>. O uso continuado da plataforma após as alterações constitui aceitação dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Lei Aplicável e Foro</h2>
            <p className="text-gray-300 leading-relaxed">
              Estes Termos são regidos pelas leis da República Federativa do Brasil. Qualquer disputa será resolvida no foro da comarca de <strong className="text-white">[Sua Cidade/Estado]</strong>, com exclusão de qualquer outro, por mais privilegiado que seja.
            </p>
          </section>

          <section className="bg-[#33b864]/10 border border-[#33b864]/30 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-[#33b864] mb-4">Contato</h2>
            <p className="text-gray-300 leading-relaxed">
              Dúvidas sobre estes Termos? Entre em contato:<br />
              <strong className="text-white">E-mail:</strong> legal@oceansignal.com.br<br />
              <strong className="text-white">WhatsApp:</strong> +55 (11) 9 9999-9999
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
