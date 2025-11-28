import { Link } from 'wouter';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsPage() {
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
          <div className="w-16 h-16 rounded-full bg-[#33b864]/10 border-2 border-[#33b864]/30 flex items-center justify-center">
            <FileText className="w-8 h-8 text-[#33b864]" />
          </div>
          <h1 className="text-xl font-black" style={{ fontFamily: 'Sora, sans-serif' }}>
            Termos e Condições de Uso
          </h1>
        </div>

        {/* Content */}
        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e usar a plataforma <span className="text-[#33b864] font-semibold">VANTAGE</span>, você concorda com estes Termos e Condições de Uso. Se você não concordar, não utilize nossos serviços.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Descrição do Serviço</h2>
            <p>
              A VANTAGE fornece <strong className="text-white">análises esportivas estatísticas</strong> baseadas em inteligência artificial através de um dashboard online. Nossos serviços incluem:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4 ml-4">
              <li>Bilhetes de apostas esportivas com análises probabilísticas;</li>
              <li>Scanner de oportunidades em tempo real;</li>
              <li>Dashboard de gestão de banca e ROI;</li>
              <li>Acesso à comunidade VIP de operadores;</li>
              <li>Suporte técnico prioritário.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Período de Teste (Trial)</h2>
            <p>
              Novos usuários têm direito a <strong className="text-white">15 dias de acesso limitado gratuito</strong> a partir do cadastro. Durante o período de teste:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4 ml-4">
              <li>Acesso limitado a <strong className="text-white">1 bilhete por dia</strong> (bilhetes adicionais ficam bloqueados);</li>
              <li>Dashboard completo com métricas e estatísticas;</li>
              <li>Sem solicitação de cartão de crédito para ativação;</li>
              <li>Cancelamento automático ao final do período sem cobrança.</li>
            </ul>
            <div className="bg-[#33b864]/10 border border-[#33b864]/30 rounded-xl p-6 mt-4">
              <p className="text-[#33b864] font-semibold">
                Após os 15 dias, o acesso total requer assinatura do plano True Signal Pro (R$ 2,00/mês).
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Assinatura e Pagamento</h2>
            <p>
              A assinatura <strong className="text-white">True Signal Pro</strong> oferece acesso ilimitado a todos os bilhetes e recursos premium. Condições:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4 ml-4">
              <li>Cobrança mensal recorrente de <strong className="text-white">R$ 2,00</strong>;</li>
              <li>Renovação automática até cancelamento;</li>
              <li>Garantia de reembolso de 15 dias (primeira assinatura);</li>
              <li>Pagamento processado via gateway seguro (PCI DSS).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Cancelamento e Reembolso</h2>
            <p>
              O usuário pode <strong className="text-white">cancelar a assinatura a qualquer momento</strong> através do painel de configurações. Após o cancelamento:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4 ml-4">
              <li>O acesso permanece ativo até o fim do ciclo pago;</li>
              <li>Não haverá cobrança no próximo ciclo;</li>
              <li>Reembolso disponível apenas nos <strong className="text-white">primeiros 15 dias</strong> da primeira assinatura;</li>
              <li>Cancelamentos após 15 dias não geram reembolso proporcional.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Proibições e Uso Adequado</h2>
            <p>
              É <strong className="text-red-400">estritamente proibido</strong>:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4 ml-4">
              <li>Revender, redistribuir ou compartilhar bilhetes em grupos de terceiros (Telegram, WhatsApp, etc.);</li>
              <li>Utilizar múltiplas contas para acessar o período de teste repetidamente;</li>
              <li>Realizar engenharia reversa ou tentar acessar o código-fonte da IA;</li>
              <li>Usar bots, scripts ou automações não autorizadas na plataforma;</li>
              <li>Criar contas falsas ou fornecer informações fraudulentas.</li>
            </ul>
            <div className="bg-red-950/20 border border-red-500/30 rounded-xl p-6 mt-4">
              <p className="text-red-300 font-semibold">
                ⚠️ Violações podem resultar em bloqueio permanente da conta sem direito a reembolso.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Limitação de Responsabilidade</h2>
            <p>
              A VANTAGE fornece informações estatísticas, mas <strong className="text-white">não garante lucros</strong>. Não nos responsabilizamos por:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4 ml-4">
              <li>Perdas financeiras decorrentes de apostas;</li>
              <li>Interrupções temporárias do serviço por manutenção;</li>
              <li>Alterações nas odds ou jogos cancelados pelas casas de apostas;</li>
              <li>Incompatibilidade com navegadores ou dispositivos desatualizados.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Propriedade Intelectual</h2>
            <p>
              Todos os algoritmos, design, marca e conteúdo da VANTAGE são <strong className="text-white">propriedade exclusiva</strong> da empresa. É proibida qualquer reprodução sem autorização prévia.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Modificações dos Termos</h2>
            <p>
              Reservamo-nos o direito de modificar estes Termos a qualquer momento. Alterações significativas serão comunicadas por e-mail com <strong className="text-white">7 dias de antecedência</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Lei Aplicável</h2>
            <p>
              Estes Termos são regidos pelas leis da República Federativa do Brasil. Quaisquer disputas serão resolvidas no foro da comarca de <strong className="text-white">São Paulo/SP</strong>.
            </p>
          </section>

          <section className="border-t border-gray-800 pt-8">
            <p className="text-sm text-gray-500 italic">
              Última atualização: 26 de novembro de 2024
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Ao usar a VANTAGE, você declara ter lido e aceito integralmente estes Termos e Condições.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
