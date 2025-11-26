import { Link } from 'wouter';
import { ArrowLeft, Lock } from 'lucide-react';

export default function PrivacyPage() {
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
              <Lock className="w-6 h-6 text-[#33b864]" />
            </div>
            <h1 className="text-4xl font-black text-white">Política de Privacidade</h1>
          </div>
          
          <p className="text-gray-400">Compliance com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018)</p>
          <p className="text-gray-400 text-sm mt-1">Última atualização: Novembro de 2024</p>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none space-y-8">
          <section className="bg-[#33b864]/10 border border-[#33b864]/30 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-[#33b864] mb-4">Nosso Compromisso</h2>
            <p className="text-gray-300 leading-relaxed">
              O Ocean Signal está <strong className="text-white">100% comprometido</strong> com a proteção dos seus dados pessoais. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações, em conformidade com a <strong className="text-white">LGPD (Lei 13.709/2018)</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Dados Coletados</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Coletamos apenas os dados <strong className="text-white">estritamente necessários</strong> para fornecer nosso serviço:
            </p>
            
            <div className="bg-[#121212] border border-[#33b864]/20 rounded-xl p-6 mb-4">
              <h3 className="text-lg font-bold text-[#33b864] mb-3">Dados de Cadastro</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• <strong className="text-white">Nome completo:</strong> Para personalização da experiência</li>
                <li>• <strong className="text-white">E-mail:</strong> Para login, comunicação e recuperação de senha</li>
                <li>• <strong className="text-white">Telefone:</strong> Para suporte prioritário (apenas Ocean Prime)</li>
              </ul>
            </div>

            <div className="bg-[#121212] border border-[#33b864]/20 rounded-xl p-6 mb-4">
              <h3 className="text-lg font-bold text-[#33b864] mb-3">Dados de Pagamento</h3>
              <p className="text-gray-300 mb-3">
                <strong className="text-white">NÃO armazenamos</strong> dados de cartão de crédito. O processamento de pagamentos é realizado por:
              </p>
              <ul className="space-y-2 text-gray-300">
                <li>• <strong className="text-white">Stripe:</strong> Gateway de pagamento certificado PCI-DSS</li>
                <li>• Apenas referências de transação são salvas (não números de cartão)</li>
              </ul>
            </div>

            <div className="bg-[#121212] border border-[#33b864]/20 rounded-xl p-6">
              <h3 className="text-lg font-bold text-[#33b864] mb-3">Dados de Navegação (Cookies)</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• <strong className="text-white">Cookies de Sessão:</strong> Para manter você logado</li>
                <li>• <strong className="text-white">Cookies de Preferências:</strong> Para salvar idioma e tema escuro/claro</li>
                <li>• <strong className="text-white">NÃO usamos</strong> cookies de rastreamento publicitário</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Como Usamos Seus Dados</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Seus dados pessoais são utilizados <strong className="text-white">exclusivamente</strong> para:
            </p>
            <ul className="space-y-3 text-gray-300 ml-6">
              <li>• <strong className="text-white">Gestão de Acesso:</strong> Autenticar seu login e controlar seu plano (Trial/Prime)</li>
              <li>• <strong className="text-white">Comunicação:</strong> Enviar bilhetes, notificações de performance e atualizações da plataforma</li>
              <li>• <strong className="text-white">Suporte Técnico:</strong> Resolver problemas e responder dúvidas</li>
              <li>• <strong className="text-white">Análise Interna:</strong> Melhorar algoritmos e experiência do usuário (dados anonimizados)</li>
              <li>• <strong className="text-white">Cobranças:</strong> Processar pagamentos mensais (apenas Ocean Prime)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Compartilhamento de Dados</h2>
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 mb-4">
              <p className="text-green-400 font-semibold mb-2">GARANTIA ABSOLUTA:</p>
              <p className="text-gray-300 leading-relaxed">
                <strong className="text-white">NÃO vendemos, alugamos ou compartilhamos</strong> seus dados pessoais com terceiros para fins comerciais ou publicitários. Seus dados são seus.
              </p>
            </div>
            
            <p className="text-gray-300 leading-relaxed mb-3">
              <strong className="text-white">Exceções legais:</strong> Podemos compartilhar dados apenas se:
            </p>
            <ul className="space-y-2 text-gray-300 ml-6">
              <li>• Exigido por lei ou ordem judicial</li>
              <li>• Necessário para prevenir fraudes ou atividades ilegais</li>
              <li>• Com provedores técnicos essenciais (Supabase, Stripe) sob contrato de confidencialidade</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Segurança dos Dados</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Implementamos medidas técnicas e organizacionais de <strong className="text-white">nível corporativo</strong>:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-[#121212] border border-[#33b864]/20 rounded-xl p-5">
                <h4 className="text-[#33b864] font-bold mb-2">Criptografia</h4>
                <p className="text-sm text-gray-300">
                  • SSL/TLS em todas as conexões<br />
                  • Senhas protegidas com bcrypt<br />
                  • Banco de dados criptografado (Supabase)
                </p>
              </div>
              
              <div className="bg-[#121212] border border-[#33b864]/20 rounded-xl p-5">
                <h4 className="text-[#33b864] font-bold mb-2">Infraestrutura</h4>
                <p className="text-sm text-gray-300">
                  • Servidores certificados ISO 27001<br />
                  • Backups diários automáticos<br />
                  • Monitoramento 24/7
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Seus Direitos (LGPD)</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              De acordo com a LGPD, você tem os seguintes <strong className="text-white">direitos garantidos</strong>:
            </p>
            
            <div className="space-y-3">
              <div className="bg-[#121212] border-l-4 border-[#33b864] p-4">
                <h4 className="text-white font-bold mb-1">✅ Confirmação e Acesso</h4>
                <p className="text-sm text-gray-300">Saber se processamos seus dados e acessá-los gratuitamente</p>
              </div>
              
              <div className="bg-[#121212] border-l-4 border-[#33b864] p-4">
                <h4 className="text-white font-bold mb-1">✏️ Correção</h4>
                <p className="text-sm text-gray-300">Atualizar dados incompletos ou incorretos</p>
              </div>
              
              <div className="bg-[#121212] border-l-4 border-[#33b864] p-4">
                <h4 className="text-white font-bold mb-1">🗑️ Exclusão</h4>
                <p className="text-sm text-gray-300">Solicitar a eliminação completa dos seus dados (direito ao esquecimento)</p>
              </div>
              
              <div className="bg-[#121212] border-l-4 border-[#33b864] p-4">
                <h4 className="text-white font-bold mb-1">📦 Portabilidade</h4>
                <p className="text-sm text-gray-300">Receber seus dados em formato estruturado (JSON/CSV)</p>
              </div>
              
              <div className="bg-[#121212] border-l-4 border-[#33b864] p-4">
                <h4 className="text-white font-bold mb-1">🚫 Revogação de Consentimento</h4>
                <p className="text-sm text-gray-300">Cancelar autorizações de uso de dados a qualquer momento</p>
              </div>
            </div>
            
            <p className="text-gray-300 leading-relaxed mt-6">
              <strong className="text-white">Como exercer seus direitos:</strong> Envie um e-mail para <strong className="text-[#33b864]">privacidade@oceansignal.com.br</strong> com o assunto "Solicitação LGPD". Responderemos em até <strong className="text-white">5 dias úteis</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Retenção de Dados</h2>
            <p className="text-gray-300 leading-relaxed">
              Mantemos seus dados pessoais apenas pelo tempo <strong className="text-white">necessário</strong>:
            </p>
            <ul className="space-y-2 text-gray-300 ml-6 mt-3">
              <li>• <strong className="text-white">Conta Ativa:</strong> Enquanto você usar o serviço</li>
              <li>• <strong className="text-white">Após Cancelamento:</strong> 90 dias (backup e questões fiscais)</li>
              <li>• <strong className="text-white">Dados Fiscais:</strong> 5 anos (exigência legal brasileira)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Menores de Idade</h2>
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
              <p className="text-red-400 font-semibold mb-2">⚠️ PROIBIDO PARA MENORES</p>
              <p className="text-gray-300 leading-relaxed">
                O Ocean Signal <strong className="text-white">NÃO permite</strong> o cadastro de menores de 18 anos. Ao se cadastrar, você declara ter a maioridade legal. Contas de menores serão <strong className="text-white">imediatamente canceladas</strong> sem reembolso.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Alterações na Política</h2>
            <p className="text-gray-300 leading-relaxed">
              Podemos atualizar esta Política para refletir mudanças na legislação ou em nossos processos. Alterações significativas serão notificadas por <strong className="text-white">e-mail com 15 dias de antecedência</strong>.
            </p>
          </section>

          <section className="bg-[#33b864]/10 border border-[#33b864]/30 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-[#33b864] mb-4">Encarregado de Dados (DPO)</h2>
            <p className="text-gray-300 leading-relaxed">
              Responsável pela proteção de dados no Ocean Signal:<br />
              <strong className="text-white">Nome:</strong> [Nome do DPO]<br />
              <strong className="text-white">E-mail:</strong> dpo@oceansignal.com.br<br />
              <strong className="text-white">Telefone:</strong> +55 (11) 9 9999-9999
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
