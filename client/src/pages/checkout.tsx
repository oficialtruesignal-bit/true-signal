import { Layout } from "@/components/layout";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { CreditCard, Check, Sparkles, Shield, Zap, TrendingUp, Clock, Gift, Lock, Users, Star, CheckCircle2, AlertCircle, User, Mail, Phone, FileText, QrCode, Copy, Loader2, RefreshCw } from "lucide-react";
import { useAccessControl } from "@/hooks/use-access-control";
import { toast } from "sonner";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react';

type PaymentMethod = 'card' | 'pix';
type CardPaymentStatus = 'idle' | 'processing' | 'success' | 'error';

const checkoutSchema = z.object({
  fullName: z.string().min(3, "Nome completo é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone inválido (mínimo 10 dígitos)"),
  document: z.string().min(11, "CPF/CNPJ inválido (mínimo 11 dígitos)"),
  acceptTerms: z.boolean().refine(val => val === true, "Você deve aceitar os termos"),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface PixPaymentData {
  qrCode: string;
  qrCodeBase64: string;
  paymentId: string;
  expirationDate?: string;
}

export default function CheckoutPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { daysRemaining, isPremium } = useAccessControl();
  const [isLoading, setIsLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(127);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [pixData, setPixData] = useState<PixPaymentData | null>(null);
  const [pixStatus, setPixStatus] = useState<'pending' | 'approved' | 'expired'>('pending');
  const [copied, setCopied] = useState(false);
  const [mpReady, setMpReady] = useState(false);
  const [cardPaymentStatus, setCardPaymentStatus] = useState<CardPaymentStatus>('idle');
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [showCardForm, setShowCardForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: user?.firstName || "",
      email: user?.email || "",
      phone: "",
      document: "",
      acceptTerms: false,
    },
  });

  // Initialize Mercado Pago SDK
  useEffect(() => {
    const initMP = async () => {
      try {
        const response = await axios.get('/api/mercadopago/config');
        if (response.data.configured && response.data.publicKey) {
          setPublicKey(response.data.publicKey);
          initMercadoPago(response.data.publicKey, { locale: 'pt-BR' });
          setMpReady(true);
        }
      } catch (error) {
        console.error('Error initializing Mercado Pago:', error);
      }
    };
    initMP();
  }, []);

  // Simular contador de usuários online (varia entre 120-150)
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineUsers(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const newValue = prev + change;
        return Math.max(120, Math.min(150, newValue));
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Check PIX payment status periodically
  useEffect(() => {
    if (!pixData?.paymentId || !user?.id) return;

    const checkStatus = async () => {
      try {
        const response = await axios.post('/api/mercadopago/payment-status', {
          paymentId: pixData.paymentId,
          userId: user.id,
        });
        const status = response.data.status;
        
        if (status === 'approved') {
          setPixStatus('approved');
          toast.success("Pagamento confirmado! Redirecionando...");
          setTimeout(() => {
            window.location.href = '/obrigado';
          }, 2000);
        } else if (status === 'cancelled' || status === 'rejected') {
          setPixStatus('expired');
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
      }
    };

    // Check immediately, then every 5 seconds
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [pixData?.paymentId, user?.id]);

  const copyPixCode = () => {
    if (pixData?.qrCode) {
      navigator.clipboard.writeText(pixData.qrCode);
      setCopied(true);
      toast.success("Código PIX copiado!");
      setTimeout(() => setCopied(false), 3000);
    }
  };

  // Handle card payment submission from Mercado Pago SDK
  const onCardPaymentSubmit = useCallback(async (formData: any) => {
    if (!user) {
      toast.error("Você precisa estar logado para assinar");
      return;
    }

    setCardPaymentStatus('processing');
    
    try {
      const response = await axios.post('/api/mercadopago/card-payment', {
        token: formData.token,
        issuerId: formData.issuer_id,
        paymentMethodId: formData.payment_method_id,
        transactionAmount: 47.90,
        installments: formData.installments || 1,
        userId: user.id,
        userEmail: user.email,
        payer: {
          email: user.email,
          identification: {
            type: formData.payer?.identification?.type || 'CPF',
            number: formData.payer?.identification?.number || '',
          }
        }
      });

      if (response.data.success && response.data.status === 'approved') {
        setCardPaymentStatus('success');
        toast.success("Pagamento aprovado! Redirecionando...");
        setTimeout(() => {
          window.location.href = '/obrigado';
        }, 2000);
      } else if (response.data.status === 'in_process' || response.data.status === 'pending') {
        toast.info("Pagamento em análise. Você será notificado quando aprovado.");
        setCardPaymentStatus('idle');
      } else {
        setCardPaymentStatus('error');
        toast.error(response.data.statusDetail || "Pagamento recusado. Tente outro cartão.");
      }
    } catch (error: any) {
      console.error('Card payment error:', error);
      setCardPaymentStatus('error');
      toast.error(error.response?.data?.error || "Erro ao processar pagamento");
    }
  }, [user]);

  const onCardPaymentError = useCallback((error: any) => {
    console.error('Card payment form error:', error);
    toast.error("Erro no formulário de pagamento");
  }, []);

  const onCardPaymentReady = useCallback(() => {
    console.log('Card payment form ready');
  }, []);

  const onSubmit = async (data: CheckoutFormData) => {
    if (!user) {
      toast.error("Você precisa estar logado para assinar");
      return;
    }

    setIsLoading(true);
    try {
      if (paymentMethod === 'pix') {
        // Create PIX payment directly (transparent checkout)
        const response = await axios.post("/api/mercadopago/pix", {
          userId: user.id,
          userEmail: data.email,
          amount: 47.90,
          firstName: data.fullName.split(' ')[0],
          lastName: data.fullName.split(' ').slice(1).join(' ') || 'Usuario',
          document: data.document.replace(/\D/g, ''),
        });

        if (response.data.success) {
          setPixData({
            qrCode: response.data.qrCode,
            qrCodeBase64: response.data.qrCodeBase64,
            paymentId: response.data.payment.id,
          });
          setPixStatus('pending');
          toast.success("QR Code PIX gerado! Escaneie para pagar.");
        } else {
          toast.error("Erro ao gerar PIX. Tente novamente.");
        }
      } else {
        // Show card payment form (transparent checkout)
        if (mpReady) {
          setShowCardForm(true);
          toast.info("Preencha os dados do cartão abaixo");
        } else {
          toast.error("Sistema de pagamento não está disponível. Tente novamente.");
        }
      }
    } catch (error: any) {
      console.error("Erro ao criar pagamento:", error);
      toast.error(error.response?.data?.error || "Erro ao processar pagamento");
    } finally {
      setIsLoading(false);
    }
  };

  if (isPremium) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="w-20 h-20 bg-[#33b864]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-[#33b864]" />
          </div>
          <h1 className="text-3xl font-sora font-bold text-white mb-4">
            Você já é True Signal Pro!
          </h1>
          <p className="text-gray-300 mb-8">
            Aproveite todos os benefícios da sua assinatura premium.
          </p>
        </div>
      </Layout>
    );
  }

  // Show Card Payment Form when card is selected
  if (showCardForm && mpReady) {
    return (
      <Layout>
        <div className="max-w-md mx-auto py-10">
          <div className="bg-card border border-white/10 rounded-xl p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#33b864]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                {cardPaymentStatus === 'success' ? (
                  <Check className="w-8 h-8 text-[#33b864]" />
                ) : cardPaymentStatus === 'processing' ? (
                  <Loader2 className="w-8 h-8 text-[#33b864] animate-spin" />
                ) : (
                  <CreditCard className="w-8 h-8 text-[#33b864]" />
                )}
              </div>
              <h2 className="text-2xl font-sora font-bold text-white mb-2">
                {cardPaymentStatus === 'success' 
                  ? 'Pagamento Aprovado!' 
                  : cardPaymentStatus === 'processing'
                  ? 'Processando...'
                  : 'Pagamento com Cartão'}
              </h2>
              <p className="text-gray-400">
                {cardPaymentStatus === 'success'
                  ? 'Redirecionando para sua conta...'
                  : cardPaymentStatus === 'processing'
                  ? 'Aguarde, estamos processando seu pagamento'
                  : 'Preencha os dados do cartão abaixo'}
              </p>
            </div>

            {cardPaymentStatus !== 'success' && cardPaymentStatus !== 'processing' && (
              <>
                {/* Mercado Pago Card Payment Brick */}
                <div className="mb-6">
                  <CardPayment
                    initialization={{ amount: 47.90 }}
                    onSubmit={onCardPaymentSubmit}
                    onReady={onCardPaymentReady}
                    onError={onCardPaymentError}
                    customization={{
                      paymentMethods: {
                        maxInstallments: 1,
                      },
                      visual: {
                        style: {
                          theme: 'dark',
                        },
                      },
                    }}
                  />
                </div>

                {/* Back Button */}
                <button
                  onClick={() => setShowCardForm(false)}
                  className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  Voltar
                </button>
              </>
            )}

            {/* Value */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Valor:</span>
                <span className="text-2xl font-bold text-[#33b864]">R$ 47,90</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Acesso por 30 dias ao True Signal Pro
              </p>
            </div>

            {/* Security Badge */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
              <Shield className="w-4 h-4" />
              <span>Pagamento seguro via Mercado Pago</span>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Show PIX QR Code screen when PIX payment is generated
  if (pixData) {
    return (
      <Layout>
        <div className="max-w-md mx-auto py-10">
          <div className="bg-card border border-white/10 rounded-xl p-8 text-center">
            {/* Header */}
            <div className="mb-6">
              <div className="w-16 h-16 bg-[#33b864]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                {pixStatus === 'approved' ? (
                  <Check className="w-8 h-8 text-[#33b864]" />
                ) : pixStatus === 'expired' ? (
                  <AlertCircle className="w-8 h-8 text-red-500" />
                ) : (
                  <QrCode className="w-8 h-8 text-[#33b864]" />
                )}
              </div>
              <h2 className="text-2xl font-sora font-bold text-white mb-2">
                {pixStatus === 'approved' 
                  ? 'Pagamento Confirmado!' 
                  : pixStatus === 'expired'
                  ? 'PIX Expirado'
                  : 'Pague com PIX'}
              </h2>
              <p className="text-gray-400">
                {pixStatus === 'approved'
                  ? 'Sua assinatura foi ativada com sucesso!'
                  : pixStatus === 'expired'
                  ? 'O código PIX expirou. Gere um novo.'
                  : 'Escaneie o QR Code ou copie o código'}
              </p>
            </div>

            {pixStatus === 'pending' && (
              <>
                {/* QR Code */}
                <div className="bg-white p-4 rounded-xl mb-6 inline-block">
                  <img 
                    src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                    alt="QR Code PIX"
                    className="w-48 h-48"
                    data-testid="img-pix-qrcode"
                  />
                </div>

                {/* Timer */}
                <div className="flex items-center justify-center gap-2 text-gray-400 mb-6">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Aguardando pagamento...</span>
                </div>

                {/* Copy Code Button */}
                <div className="space-y-3">
                  <button
                    onClick={copyPixCode}
                    className="w-full py-3 px-4 bg-[#33b864] hover:bg-[#2da055] text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                    data-testid="button-copy-pix"
                  >
                    {copied ? (
                      <>
                        <Check className="w-5 h-5" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        Copiar código PIX
                      </>
                    )}
                  </button>

                  {/* PIX Code Display */}
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Código Copia e Cola:</p>
                    <p className="text-xs text-gray-300 break-all font-mono max-h-20 overflow-y-auto">
                      {pixData.qrCode}
                    </p>
                  </div>
                </div>

                {/* Value */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Valor:</span>
                    <span className="text-2xl font-bold text-[#33b864]">R$ 47,90</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Acesso por 30 dias ao True Signal Pro
                  </p>
                </div>
              </>
            )}

            {pixStatus === 'expired' && (
              <button
                onClick={() => {
                  setPixData(null);
                  setPixStatus('pending');
                }}
                className="w-full py-3 px-4 bg-[#33b864] hover:bg-[#2da055] text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Gerar novo PIX
              </button>
            )}

            {/* Security Badge */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
              <Shield className="w-4 h-4" />
              <span>Pagamento processado pelo Mercado Pago</span>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#33b864]/10 rounded-full border border-[#33b864]/20 mb-4">
            <Sparkles className="w-4 h-4 text-[#33b864]" />
            <span className="text-sm font-bold text-[#33b864]">CHECKOUT SEGURO</span>
          </div>
          <h1 className="text-3xl font-sora font-bold text-white mb-4">
            Finalize sua assinatura True Signal Pro
          </h1>
          <p className="text-xl text-gray-300">
            {daysRemaining > 0 
              ? `Restam ${daysRemaining} dias de teste. Complete o pagamento para garantir acesso ilimitado!`
              : "Complete o pagamento para voltar a acessar todos os sinais premium!"
            }
          </p>
        </div>

        <div className="max-w-md mx-auto">
          {/* Checkout Form */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="bg-card border border-white/10 rounded-xl p-8 space-y-6">
              <h3 className="font-sora font-bold text-white mb-4">Escolha a forma de pagamento</h3>
              
              {/* Payment Method Selection */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                    paymentMethod === 'card'
                      ? 'border-[#33b864] bg-[#33b864]/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                  data-testid="button-payment-card"
                >
                  <CreditCard className={`w-6 h-6 ${paymentMethod === 'card' ? 'text-[#33b864]' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${paymentMethod === 'card' ? 'text-[#33b864]' : 'text-gray-300'}`}>
                    Cartão
                  </span>
                  <span className="text-xs text-gray-500">Recorrente</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pix')}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                    paymentMethod === 'pix'
                      ? 'border-[#33b864] bg-[#33b864]/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                  data-testid="button-payment-pix"
                >
                  <QrCode className={`w-6 h-6 ${paymentMethod === 'pix' ? 'text-[#33b864]' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${paymentMethod === 'pix' ? 'text-[#33b864]' : 'text-gray-300'}`}>
                    PIX
                  </span>
                  <span className="text-xs text-gray-500">Pagamento único</span>
                </button>
              </div>

              {/* Payment Method Info */}
              <div className={`p-3 rounded-lg text-sm ${paymentMethod === 'card' ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-green-500/10 border border-green-500/20'}`}>
                {paymentMethod === 'card' ? (
                  <p className="text-blue-300">
                    <CreditCard className="w-4 h-4 inline mr-2" />
                    Cobrança automática mensal de R$ 47,90. Cancele quando quiser.
                  </p>
                ) : (
                  <p className="text-green-300">
                    <QrCode className="w-4 h-4 inline mr-2" />
                    Pagamento único de R$ 47,90 via PIX. Acesso por 30 dias.
                  </p>
                )}
              </div>

              <h3 className="font-sora font-bold text-white pt-4">Complete seus dados</h3>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome completo *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    {...register("fullName")}
                    placeholder="Seu nome completo"
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:border-[#33b864] focus:ring-1 focus:ring-[#33b864] transition-all"
                    data-testid="input-fullname"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    {...register("email")}
                    placeholder="seu@email.com"
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:border-[#33b864] focus:ring-1 focus:ring-[#33b864] transition-all"
                    data-testid="input-email"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Telefone/WhatsApp *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="tel"
                    {...register("phone")}
                    placeholder="(00) 00000-0000"
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:border-[#33b864] focus:ring-1 focus:ring-[#33b864] transition-all"
                    data-testid="input-phone"
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Document (CPF/CNPJ) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  CPF/CNPJ *
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    {...register("document")}
                    placeholder="000.000.000-00"
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:border-[#33b864] focus:ring-1 focus:ring-[#33b864] transition-all"
                    data-testid="input-document"
                  />
                </div>
                {errors.document && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.document.message}
                  </p>
                )}
              </div>

              {/* Order Summary */}
              <div className="pt-6 border-t border-white/10">
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">True Signal Pro (mensal)</span>
                    <div className="text-right">
                      <span className="text-gray-500 line-through text-xs mr-2">R$ 99,87</span>
                      <span className="text-[#33b864]">R$ 47,90</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Taxa de processamento</span>
                    <span className="text-[#33b864]">R$ 0,00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Black Friday</span>
                    <span className="text-red-400 font-bold">-52% OFF</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-white/10">
                    <span className="font-bold text-white">Total</span>
                    <span className="font-bold text-xl text-[#33b864]">R$ 47,90</span>
                  </div>
                </div>
              </div>

              {/* Accept Terms */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  {...register("acceptTerms")}
                  id="acceptTerms"
                  className="mt-1 w-4 h-4 rounded border-white/10 bg-white/5 text-[#33b864] focus:ring-[#33b864]"
                  data-testid="checkbox-accept-terms"
                />
                <label htmlFor="acceptTerms" className="text-xs text-gray-400 leading-relaxed cursor-pointer">
                  Eu aceito os <a href="/terms" target="_blank" className="text-[#33b864] hover:underline">termos de uso</a>, <a href="/privacy" target="_blank" className="text-[#33b864] hover:underline">política de privacidade</a> e <a href="/risk-disclaimer" target="_blank" className="text-[#33b864] hover:underline">aviso de risco</a>
                </label>
              </div>
              {errors.acceptTerms && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.acceptTerms.message}
                </p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-[#33b864] hover:bg-[#2da055] text-black font-bold text-lg rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg shadow-[#33b864]/30 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="button-checkout-submit"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                    Processando...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Finalizar Pagamento Seguro
                  </>
                )}
              </button>

              {/* Security Badges */}
              <div className="space-y-2 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-[#33b864]" />
                  <span>Criptografia SSL de 256 bits</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-[#33b864]" />
                  <span>Dados protegidos pela LGPD</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-[#33b864]" />
                  <span>Cancele a qualquer momento</span>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Trust Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 mt-12">
          <div className="bg-card border border-white/10 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-[#33b864]/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-[#33b864]" />
            </div>
            <h3 className="font-bold text-white mb-2">Pagamento seguro</h3>
            <p className="text-sm text-gray-400">Seus dados protegidos via Mercado Pago</p>
          </div>
          <div className="bg-card border border-white/10 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-[#33b864]/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-[#33b864]" />
            </div>
            <h3 className="font-bold text-white mb-2">87% de Assertividade</h3>
            <p className="text-sm text-gray-400">Taxa comprovada pelos nossos usuários</p>
          </div>
          <div className="bg-card border border-white/10 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-[#33b864]/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-[#33b864]" />
            </div>
            <h3 className="font-bold text-white mb-2">+2.500 Assinantes</h3>
            <p className="text-sm text-gray-400">Confiam na TRUE SIGNAL</p>
          </div>
        </div>

        {/* Testimonials */}
        <div className="bg-card border border-white/10 rounded-xl p-8 mb-12">
          <h3 className="font-sora font-bold text-white text-center mb-8">O que dizem nossos assinantes</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/5 rounded-lg p-6">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#33b864] text-[#33b864]" />
                ))}
              </div>
              <p className="text-sm text-gray-300 mb-4">
                "Incrível! Consegui dobrar minha banca em 2 meses seguindo os sinais. Plataforma muito profissional."
              </p>
              <p className="text-xs text-gray-500">— Carlos M., São Paulo</p>
            </div>
            <div className="bg-white/5 rounded-lg p-6">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#33b864] text-[#33b864]" />
                ))}
              </div>
              <p className="text-sm text-gray-300 mb-4">
                "A assertividade dos sinais impressiona. Não fico mais perdido procurando apostas. Vale cada centavo."
              </p>
              <p className="text-xs text-gray-500">— Fernanda L., Rio de Janeiro</p>
            </div>
            <div className="bg-white/5 rounded-lg p-6">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#33b864] text-[#33b864]" />
                ))}
              </div>
              <p className="text-sm text-gray-300 mb-4">
                "Suporte rápido, sinais certeiros e uma plataforma linda. Melhor investimento que fiz."
              </p>
              <p className="text-xs text-gray-500">— Ricardo S., Curitiba</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-card border border-white/10 rounded-xl p-8">
          <h3 className="font-sora font-bold text-white text-center mb-8">Perguntas frequentes</h3>
          <div className="space-y-4 max-w-3xl mx-auto">
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#33b864]" />
                Meus dados estão seguros?
              </h4>
              <p className="text-sm text-gray-400">
                Sim! Utilizamos criptografia SSL de 256 bits e estamos em conformidade com a LGPD. Seus dados são processados pelo Mercado Pago, uma das plataformas de pagamento mais seguras do Brasil.
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#33b864]" />
                Posso cancelar quando quiser?
              </h4>
              <p className="text-sm text-gray-400">
                Sim! Não há período mínimo de contrato. Você pode cancelar sua assinatura a qualquer momento, sem multas ou taxas adicionais. Se cancelar nos primeiros 7 dias, devolvemos 100% do valor.
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#33b864]" />
                Como funciona a cobrança?
              </h4>
              <p className="text-sm text-gray-400">
                A cobrança é mensal e recorrente de R$ 47,90 (preço Black Friday, de R$ 99,87). Você será notificado antes de cada renovação e pode cancelar a qualquer momento.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Legal Info */}
        <div className="text-center mt-12 pt-8 border-t border-white/10">
          <p className="text-xs text-gray-500 mb-2">
            TRUE SIGNAL - CNPJ: 00.000.000/0001-00
          </p>
          <p className="text-xs text-gray-500">
            Ao finalizar o pagamento, você concorda com nossos{" "}
            <a href="/terms" className="text-[#33b864] hover:underline">Termos de Uso</a> e{" "}
            <a href="/privacy" className="text-[#33b864] hover:underline">Política de Privacidade</a>
          </p>
        </div>
      </div>
    </Layout>
  );
}
