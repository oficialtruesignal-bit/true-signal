import { Link } from 'wouter';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPage() {
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
          <div className="w-16 h-16 rounded-full bg-blue-500/10 border-2 border-blue-500/30 flex items-center justify-center">
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-xl font-black" style={{ fontFamily: 'Sora, sans-serif' }}>
            Política de Privacidade
          </h1>
        </div>

        {/* LGPD Badge */}
        <div className="bg-blue-950/20 border border-blue-500/30 rounded-xl p-6 mb-8">
          <p className="text-blue-300 font-semibold text-center">
            🔒 Comprometimento com a Lei Geral de Proteção de Dados (Lei 13.709/2018 - LGPD)
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Introdução</h2>
            <p>
              O <span className="text-[#33b864] font-semibold">Ocean Signal</span> valoriza e respeita a privacidade de seus usuários. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos seus dados pessoais, em conformidade com a <strong className="text-white">LGPD</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Dados Coletados</h2>
            <p>
              Coletamos apenas os dados <strong className="text-white">estritamente necessários</strong> para o funcionamento do serviço:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4 ml-4">
              <li><strong className="text-white">Nome completo:</strong> Para personalização da experiência;</li>
              <li><strong className="text-white">E-mail:</strong> Para acesso à plataforma, comunicação e recuperação de senha;</li>
              <li><strong className="text-white">Telefone (opcional):</strong> Para notificações via WhatsApp (apenas se autorizado);</li>
              <li><strong className="text-white">Dados de navegação:</strong> IP, navegador, dispositivo (para segurança e analytics);</li>
              <li><strong className="text-white">Dados de pagamento:</strong> Processados por gateways terceiros (não armazenamos dados de cartão).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Finalidade do Uso dos Dados</h2>
            <p>
              Utilizamos seus dados pessoais exclusivamente para:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4 ml-4">
              <li>Gestão de acesso e autenticação na plataforma;</li>
              <li>Envio de bilhetes esportivos e notificações de sinais;</li>
              <li>Processamento de pagamentos e gestão de assinaturas;</li>
              <li>Comunicação sobre atualizações do serviço;</li>
              <li>Análise de performance e melhorias na plataforma;</li>
              <li>Cumprimento de obrigações legais e fiscais.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Compartilhamento de Dados</h2>
            <p>
              <strong className="text-white">Não vendemos seus dados para terceiros.</strong> Seus dados podem ser compartilhados apenas com:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4 ml-4">
              <li><strong className="text-white">Provedores de infraestrutura:</strong> Supabase (banco de dados), AWS (hospedagem);</li>
              <li><strong className="text-white">Processadores de pagamento:</strong> Stripe, Mercado Pago (conforme escolha do usuário);</li>
              <li><strong className="text-white">Autoridades legais:</strong> Quando exigido por lei ou ordem judicial.</li>
            </ul>
            <div className="bg-[#33b864]/10 border border-[#33b864]/30 rounded-xl p-6 mt-4">
              <p className="text-[#33b864] font-semibold">
                Todos os parceiros assinam Acordo de Processamento de Dados (DPA) e seguem padrões de segurança internacionais.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Segurança dos Dados</h2>
            <p>
              Adotamos medidas técnicas e organizacionais para proteger seus dados:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4 ml-4">
              <li><strong className="text-white">Criptografia SSL/TLS:</strong> Todas as transmissões são criptografadas;</li>
              <li><strong className="text-white">Armazenamento seguro:</strong> Servidores certificados com backup diário;</li>
              <li><strong className="text-white">Controle de acesso:</strong> Apenas funcionários autorizados têm acesso aos dados;</li>
              <li><strong className="text-white">Autenticação forte:</strong> Senhas hasheadas com bcrypt (não reversível);</li>
              <li><strong className="text-white">Monitoramento 24/7:</strong> Detecção de atividades suspeitas e ataques.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Cookies e Tecnologias Similares</h2>
            <p>
              Utilizamos <strong className="text-white">cookies essenciais</strong> para:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4 ml-4">
              <li>Manter sua sessão de login ativa;</li>
              <li>Lembrar suas preferências de idioma e configurações;</li>
              <li>Análise de tráfego e performance (Google Analytics - anonimizado).</li>
            </ul>
            <p className="mt-4">
              Você pode desabilitar cookies nas configurações do navegador, mas isso pode afetar a funcionalidade da plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Seus Direitos (LGPD)</h2>
            <p>
              Você possui os seguintes <strong className="text-white">direitos sobre seus dados</strong>:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4 ml-4">
              <li><strong className="text-white">Acesso:</strong> Solicitar cópia dos dados que possuímos sobre você;</li>
              <li><strong className="text-white">Correção:</strong> Atualizar dados incorretos ou incompletos;</li>
              <li><strong className="text-white">Exclusão:</strong> Solicitar a remoção de seus dados (sujeito a obrigações legais);</li>
              <li><strong className="text-white">Portabilidade:</strong> Exportar seus dados em formato estruturado;</li>
              <li><strong className="text-white">Revogação de consentimento:</strong> Retirar permissão para uso de dados opcionais;</li>
              <li><strong className="text-white">Oposição:</strong> Contestar o uso de dados para determinadas finalidades.</li>
            </ul>
            <div className="bg-blue-950/20 border border-blue-500/30 rounded-xl p-6 mt-4">
              <p className="text-blue-300 font-semibold mb-2">Para exercer seus direitos, entre em contato:</p>
              <p className="text-gray-300">E-mail: <a href="mailto:privacidade@oceansignal.com" className="text-[#33b864] underline hover:text-[#2ea558]">privacidade@oceansignal.com</a></p>
              <p className="text-gray-300">Prazo de resposta: <strong className="text-white">15 dias úteis</strong></p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Retenção de Dados</h2>
            <p>
              Mantemos seus dados pessoais pelo tempo necessário para:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4 ml-4">
              <li>Prestar os serviços contratados;</li>
              <li>Cumprir obrigações legais (contábeis, fiscais) - <strong className="text-white">5 anos</strong>;</li>
              <li>Dados de usuários inativos por mais de <strong className="text-white">2 anos</strong> são excluídos automaticamente.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Transferência Internacional de Dados</h2>
            <p>
              Alguns dados podem ser armazenados em servidores localizados fora do Brasil (AWS US-East, Supabase). Garantimos que:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4 ml-4">
              <li>Todos os provedores atendem padrões internacionais de segurança (SOC 2, ISO 27001);</li>
              <li>Transferências seguem cláusulas contratuais padrão aprovadas pela LGPD;</li>
              <li>Você pode solicitar armazenamento exclusivo em servidores brasileiros (plano Enterprise).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Menores de Idade</h2>
            <p>
              O Ocean Signal não é destinado a menores de <strong className="text-white">18 anos</strong>. Não coletamos intencionalmente dados de menores. Se identificarmos uso por menores, a conta será bloqueada imediatamente.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Alterações nesta Política</h2>
            <p>
              Podemos atualizar esta Política periodicamente. Alterações significativas serão comunicadas por e-mail com <strong className="text-white">30 dias de antecedência</strong>. Recomendamos revisar esta página regularmente.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">12. Encarregado de Dados (DPO)</h2>
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <p className="text-gray-300 mb-2"><strong className="text-white">Encarregado:</strong> [Nome do DPO]</p>
              <p className="text-gray-300 mb-2"><strong className="text-white">E-mail:</strong> <a href="mailto:dpo@oceansignal.com" className="text-[#33b864] underline">dpo@oceansignal.com</a></p>
              <p className="text-gray-300"><strong className="text-white">Telefone:</strong> +55 (11) 0000-0000</p>
            </div>
          </section>

          <section className="border-t border-gray-800 pt-8">
            <p className="text-sm text-gray-500 italic">
              Última atualização: 26 de novembro de 2024
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Ao usar o Ocean Signal, você declara ter lido e aceito esta Política de Privacidade.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
