import { Layout } from "@/components/layout";
import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
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
import { analytics, fbPixel, ga4 } from "@/lib/analytics";
import { Logo } from "@/components/logo";
import { PaymentMethods } from "@/components/PaymentMethods";

// Isolated CardPayment component using refs to prevent re-renders
const CardPaymentWrapper = memo(function CardPaymentWrapper({
  onPaymentSubmit,
  onPaymentError,
}: {
  onPaymentSubmit: (formData: any) => Promise<void>;
  onPaymentError: (error: any) => void;
}) {
  const [isMounted, setIsMounted] = React.useState(false);
  const readyRef = React.useRef(false);
  const submitRef = React.useRef(onPaymentSubmit);
  const errorRef = React.useRef(onPaymentError);
  
  // Delay mounting to ensure DOM is ready
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  
  // Update refs on prop changes without causing re-render
  React.useEffect(() => {
    submitRef.current = onPaymentSubmit;
    errorRef.current = onPaymentError;
  }, [onPaymentSubmit, onPaymentError]);

  const handleReady = React.useCallback(() => {
    if (!readyRef.current) {
      console.log('Card payment form ready');
      readyRef.current = true;
    }
  }, []);

  const handleSubmit = React.useCallback(async (formData: any) => {
    return submitRef.current(formData);
  }, []);

  const handleError = React.useCallback((error: any) => {
    console.error('Card payment form error:', error);
    // Only report critical errors, not setup issues
    if (error?.type !== 'critical') {
      errorRef.current(error);
    }
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Carregando formulário...</span>
        </div>
      </div>
    );
  }

  return (
    <CardPayment
      initialization={{ amount: 47.90 }}
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
      onSubmit={handleSubmit}
      onReady={handleReady}
      onError={handleError}
    />
  );
}, () => true); // Always return true to prevent re-renders

// Testimonials data - International users from around the world
const testimonials = [
  // Brazil
  { name: "Carlos Mendes", age: 34, city: "São Paulo, Brasil 🇧🇷", text: "Incrível! Consegui dobrar minha banca em 2 meses seguindo os sinais. Plataforma muito profissional.", initials: "CM" },
  { name: "Fernanda Lima", age: 28, city: "Rio de Janeiro, Brasil 🇧🇷", text: "A assertividade dos sinais impressiona. Não fico mais perdida procurando apostas. Vale cada centavo.", initials: "FL" },
  // Portugal
  { name: "João Rodrigues", age: 41, city: "Lisboa, Portugal 🇵🇹", text: "Fantástico! Uso há 4 meses e os resultados são consistentes. Muito bom para futebol europeu.", initials: "JR" },
  { name: "Sofia Ferreira", age: 29, city: "Porto, Portugal 🇵🇹", text: "Excelente plataforma! Os sinais chegam sempre a tempo e a taxa de acerto é impressionante.", initials: "SF" },
  // Spain
  { name: "Alejandro García", age: 32, city: "Madrid, España 🇪🇸", text: "¡Increíble plataforma! Los señales son muy precisos y el soporte responde rápido. Muy recomendable.", initials: "AG" },
  { name: "María Rodríguez", age: 26, city: "Barcelona, España 🇪🇸", text: "Llevo 3 meses usando True Signal y mis ganancias han sido constantes. ¡Gracias!", initials: "MR" },
  // USA
  { name: "Michael Johnson", age: 35, city: "New York, USA 🇺🇸", text: "Best betting signals I've ever used. The accuracy is incredible and the platform is very professional.", initials: "MJ" },
  { name: "Sarah Williams", age: 28, city: "Los Angeles, USA 🇺🇸", text: "Amazing platform! I was skeptical at first but the results speak for themselves. Highly recommend!", initials: "SW" },
  // UK
  { name: "James Wilson", age: 38, city: "London, UK 🇬🇧", text: "Brilliant service! The signals are spot on and the bankroll management feature is fantastic.", initials: "JW" },
  { name: "Emma Thompson", age: 31, city: "Manchester, UK 🇬🇧", text: "Been using True Signal for 2 months now. Consistent profits and excellent customer support.", initials: "ET" },
  // Germany
  { name: "Maximilian Müller", age: 33, city: "Berlin, Deutschland 🇩🇪", text: "Ausgezeichnete Plattform! Die Signale sind sehr genau und der Support ist erstklassig.", initials: "MM" },
  { name: "Hannah Schmidt", age: 27, city: "München, Deutschland 🇩🇪", text: "Sehr zufrieden mit True Signal. Die Trefferquote ist beeindruckend!", initials: "HS" },
  // France
  { name: "Lucas Dubois", age: 30, city: "Paris, France 🇫🇷", text: "Excellente plateforme! Les signaux sont très précis et j'ai doublé ma bankroll en 2 mois.", initials: "LD" },
  { name: "Camille Martin", age: 25, city: "Lyon, France 🇫🇷", text: "Je recommande vivement True Signal. Service professionnel et résultats constants.", initials: "CM" },
  // Italy
  { name: "Marco Rossi", age: 36, city: "Milano, Italia 🇮🇹", text: "Piattaforma eccellente! I segnali sono molto precisi e il supporto è velocissimo.", initials: "MR" },
  { name: "Giulia Bianchi", age: 29, city: "Roma, Italia 🇮🇹", text: "Uso True Signal da 3 mesi e sono molto soddisfatta. Risultati costanti!", initials: "GB" },
  // Argentina
  { name: "Martín González", age: 34, city: "Buenos Aires, Argentina 🇦🇷", text: "¡Excelente! Las señales son muy precisas y el equipo de traders sabe lo que hace.", initials: "MG" },
  // Mexico
  { name: "Diego Hernández", age: 31, city: "Ciudad de México, México 🇲🇽", text: "¡Increíble plataforma! He tenido ganancias consistentes desde que me suscribí.", initials: "DH" },
  // Japan
  { name: "Takeshi Yamamoto", age: 28, city: "Tokyo, Japan 🇯🇵", text: "素晴らしいプラットフォーム！シグナルは非常に正確で、サポートも迅速です。", initials: "TY" },
  // Australia
  { name: "Liam Mitchell", age: 32, city: "Sydney, Australia 🇦🇺", text: "Top-notch signals and excellent platform. My betting game has completely changed!", initials: "LM" },
];

// Testimonials Slider Component
const TestimonialsSlider = memo(function TestimonialsSlider() {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isAnimating, setIsAnimating] = React.useState(false);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        setIsAnimating(false);
      }, 300);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const visibleTestimonials = React.useMemo(() => {
    const items = [];
    for (let i = 0; i < 3; i++) {
      items.push(testimonials[(currentIndex + i) % testimonials.length]);
    }
    return items;
  }, [currentIndex]);

  const goToSlide = (index: number) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsAnimating(false);
    }, 300);
  };

  return (
    <div className="bg-card border border-white/10 rounded-xl p-8 mb-12">
      <div className="text-center mb-6">
        <h3 className="font-sora font-bold text-white text-xl mb-2">O que dizem nossos assinantes</h3>
        <p className="text-sm text-gray-400">Mais de 12.000 pessoas do mundo todo confiam na TRUE SIGNAL</p>
      </div>
      
      <div className={`grid md:grid-cols-3 gap-6 transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
        {visibleTestimonials.map((testimonial, i) => (
          <div key={`${currentIndex}-${i}`} className="bg-white/5 rounded-xl p-5 border border-white/10">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#33b864] to-emerald-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {testimonial.initials}
              </div>
              <div>
                <p className="font-medium text-white">{testimonial.name}, {testimonial.age}</p>
                <p className="text-xs text-gray-500">{testimonial.city}</p>
                <div className="flex gap-0.5 mt-1">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-300 italic leading-relaxed">"{testimonial.text}"</p>
          </div>
        ))}
      </div>
      
      {/* Dots Navigation */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {Array.from({ length: Math.ceil(testimonials.length / 3) }).map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i * 3)}
            className={`w-2 h-2 rounded-full transition-all ${
              Math.floor(currentIndex / 3) === i 
                ? 'bg-[#33b864] w-6' 
                : 'bg-white/20 hover:bg-white/40'
            }`}
            data-testid={`testimonial-dot-${i}`}
          />
        ))}
      </div>
      
      {/* Counter */}
      <p className="text-center text-xs text-gray-500 mt-4">
        Mostrando {currentIndex + 1}-{Math.min(currentIndex + 3, testimonials.length)} de {testimonials.length} avaliações
      </p>
    </div>
  );
});

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
        // Track successful purchase
        analytics.trackPurchase(response.data.paymentId || Date.now().toString(), 49.93);
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

    // Track checkout initiation
    analytics.trackCheckoutStart();
    fbPixel.addPaymentInfo({ value: 49.93, currency: 'BRL' });
    ga4.addPaymentInfo(49.93, paymentMethod);

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
            Você já é True Signal Prime!
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
                  <CardPaymentWrapper
                    onPaymentSubmit={onCardPaymentSubmit}
                    onPaymentError={onCardPaymentError}
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
                Acesso por 30 dias ao True Signal Prime
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
                    Acesso por 30 dias ao True Signal Prime
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
      <div className="pt-4 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-2">
              <Logo size="lg" />
            </div>
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="flex items-center gap-1.5 text-[#33b864]">
                <Lock className="w-4 h-4" />
                <span className="text-xs font-semibold">Checkout Seguro</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#33b864]">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-semibold">7 Dias de Garantia</span>
              </div>
            </div>
            
            {/* Urgency Banner - Full Width */}
            <div className="w-full max-w-2xl mx-auto flex items-center justify-between gap-4 px-6 py-3 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-red-500/20 rounded-2xl border border-red-500/40 mb-5">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <div className="text-center">
                  <span className="text-xs font-bold text-yellow-400 block">PROMOÇÃO</span>
                  <span className="text-sm font-bold text-white">DE FIM DE ANO</span>
                </div>
              </div>
              <div className="h-10 w-px bg-white/20"></div>
              <div className="text-center">
                <span className="text-lg font-bold text-red-400 block animate-pulse">52% OFF</span>
                <span className="text-xs font-medium text-gray-300">Até 31/12</span>
              </div>
            </div>
            
            <h1 className="text-xl md:text-2xl lg:text-3xl font-sora font-bold text-white mb-4 text-center whitespace-nowrap">
              Acesse os <span className="text-[#33b864]">Sinais Premium</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-6">
              {daysRemaining > 0 
                ? `Restam apenas ${daysRemaining} dias do seu período de teste. Garanta seu acesso ilimitado!`
                : "Junte-se a mais de 12.000 traders lucrativos do mundo inteiro e receba sinais exclusivos todos os dias"
              }
            </p>
            
            {/* Social Proof Quick Stats */}
            <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-[#33b864] to-emerald-600 border-2 border-black flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  ))}
                </div>
                <span className="text-sm text-gray-400">+12.000 assinantes no mundo</span>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                ))}
                <span className="text-sm text-gray-400 ml-1">4.9/5 (847 avaliações)</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start max-w-6xl mx-auto">
            {/* Left Column - Benefits & Trust */}
            <div className="order-2 lg:order-1 space-y-6">
              
              {/* Price Card */}
              <div className="bg-gradient-to-br from-[#33b864]/20 to-emerald-600/10 border-2 border-[#33b864]/50 rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl">
                  -52% OFF
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-1">De <span className="line-through">R$ 99,87</span>/mês</p>
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className="text-lg text-gray-400">R$</span>
                    <span className="text-5xl font-bold text-white">47</span>
                    <span className="text-2xl font-bold text-white">,90</span>
                    <span className="text-gray-400">/mês</span>
                  </div>
                  <p className="text-[#33b864] text-sm font-medium">Economize R$ 51,97 por mês!</p>
                </div>
              </div>

              {/* What You Get */}
              <div className="bg-card/50 backdrop-blur border border-white/10 rounded-2xl p-6">
                <h3 className="font-sora font-bold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#33b864]" />
                  Tudo que você recebe:
                </h3>
                <div className="space-y-3">
                  {[
                    { icon: TrendingUp, text: "Sinais diários de 20+ traders experts", highlight: true },
                    { icon: Zap, text: "Notificações push instantâneas" },
                    { icon: Shield, text: "Gestão de banca profissional" },
                    { icon: TrendingUp, text: "83% de taxa de assertividade" },
                    { icon: Users, text: "Comunidade exclusiva de traders" },
                    { icon: Gift, text: "Suporte VIP via WhatsApp" },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${item.highlight ? 'bg-[#33b864]/10 border border-[#33b864]/30' : 'bg-white/5'}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.highlight ? 'bg-[#33b864]/20' : 'bg-white/10'}`}>
                        <item.icon className={`w-4 h-4 ${item.highlight ? 'text-[#33b864]' : 'text-gray-400'}`} />
                      </div>
                      <span className={`text-sm ${item.highlight ? 'text-white font-medium' : 'text-gray-300'}`}>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Money Back Guarantee */}
              <div className="bg-gradient-to-r from-emerald-500/10 via-[#33b864]/10 to-emerald-500/10 border border-[#33b864]/40 rounded-2xl p-5">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-[#33b864]/20 rounded-full flex items-center justify-center">
                      <Shield className="w-8 h-8 text-[#33b864]" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#33b864] rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-black" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg">Garantia de 7 Dias</h4>
                    <p className="text-sm text-gray-400">
                      100% do seu dinheiro de volta se não ficar satisfeito. Zero risco!
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-card border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-[#33b864]">83%</div>
                  <div className="text-xs text-gray-500">Assertividade</div>
                </div>
                <div className="bg-card border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-[#33b864]">12K+</div>
                  <div className="text-xs text-gray-500">Assinantes</div>
                </div>
                <div className="bg-card border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-[#33b864]">7+</div>
                  <div className="text-xs text-gray-500">Anos exp.</div>
                </div>
              </div>
            </div>

            {/* Right Column - Payment Form */}
            <div className="order-1 lg:order-2">
              <div className="bg-gradient-to-b from-card to-card/80 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/50">
                {/* Form Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-sora font-bold text-xl text-white">Finalizar Compra</h2>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Lock className="w-4 h-4 text-[#33b864]" />
                    <span>Ambiente Seguro</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {/* Payment Method Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Forma de Pagamento</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${
                          paymentMethod === 'card'
                            ? 'border-[#33b864] bg-[#33b864]/10 shadow-lg shadow-[#33b864]/20'
                            : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                        }`}
                        data-testid="button-payment-card"
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === 'card' ? 'bg-[#33b864]/20' : 'bg-white/10'}`}>
                          <CreditCard className={`w-5 h-5 ${paymentMethod === 'card' ? 'text-[#33b864]' : 'text-gray-400'}`} />
                        </div>
                        <span className={`text-sm font-medium ${paymentMethod === 'card' ? 'text-[#33b864]' : 'text-gray-300'}`}>
                          Cartão de Crédito
                        </span>
                        <span className="text-xs text-gray-500">Cobrança mensal</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('pix')}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${
                          paymentMethod === 'pix'
                            ? 'border-[#33b864] bg-[#33b864]/10 shadow-lg shadow-[#33b864]/20'
                            : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                        }`}
                        data-testid="button-payment-pix"
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === 'pix' ? 'bg-[#33b864]/20' : 'bg-white/10'}`}>
                          <QrCode className={`w-5 h-5 ${paymentMethod === 'pix' ? 'text-[#33b864]' : 'text-gray-400'}`} />
                        </div>
                        <span className={`text-sm font-medium ${paymentMethod === 'pix' ? 'text-[#33b864]' : 'text-gray-300'}`}>
                          PIX
                        </span>
                        <span className="text-xs text-gray-500">Pagamento único</span>
                      </button>
                    </div>
                  </div>

                  {/* Payment Info Badge */}
                  <div className={`p-4 rounded-xl text-sm flex items-center gap-3 ${paymentMethod === 'card' ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-[#33b864]/10 border border-[#33b864]/20'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${paymentMethod === 'card' ? 'bg-blue-500/20' : 'bg-[#33b864]/20'}`}>
                      {paymentMethod === 'card' ? (
                        <CreditCard className="w-5 h-5 text-blue-400" />
                      ) : (
                        <Zap className="w-5 h-5 text-[#33b864]" />
                      )}
                    </div>
                    <div>
                      {paymentMethod === 'card' ? (
                        <>
                          <p className="text-white font-medium">Assinatura Recorrente</p>
                          <p className="text-blue-300 text-xs">R$ 47,90/mês</p>
                          <p className="text-gray-400 text-xs">Cancele quando quiser</p>
                        </>
                      ) : (
                        <>
                          <p className="text-white font-medium">Pagamento Instantâneo</p>
                          <p className="text-[#33b864] text-xs">R$ 47,90 - Acesso por 30 dias</p>
                        </>
                      )}
                    </div>
                  </div>

              {/* Card Payment Form - Mercado Pago */}
              {paymentMethod === 'card' && mpReady && (
                <div className="pt-4">
                  <h3 className="font-sora font-bold text-white mb-4">Dados do Cartão</h3>
                  <div className="min-h-[300px] [&_.mp-sdk-container]:!max-w-full [&_form]:!max-w-full [&_.mp-card-payment-container]:!max-w-full [&_input]:!w-full [&_select]:!w-full [&_.mp-form-input]:!w-full">
                    <CardPaymentWrapper
                      onPaymentSubmit={onCardPaymentSubmit}
                      onPaymentError={onCardPaymentError}
                    />
                  </div>
                  {cardPaymentStatus === 'processing' && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-[#33b864]">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processando pagamento...</span>
                    </div>
                  )}
                  {cardPaymentStatus === 'success' && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-green-500">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Pagamento aprovado!</span>
                    </div>
                  )}
                  {cardPaymentStatus === 'error' && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-red-500">
                      <AlertCircle className="w-5 h-5" />
                      <span>Erro no pagamento. Tente novamente.</span>
                    </div>
                  )}
                </div>
              )}

              {paymentMethod === 'card' && !mpReady && (
                <div className="pt-4 flex items-center justify-center gap-2 text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Carregando formulário de pagamento...</span>
                </div>
              )}

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
                    <span className="text-gray-400">True Signal Prime (mensal)</span>
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
                    <span className="text-gray-400">Promoção Fim de Ano</span>
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

              {/* Payment Methods Footer */}
              <PaymentMethods />
            </form>
          </div>
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
            <h3 className="font-bold text-white mb-2">83% de Assertividade</h3>
            <p className="text-sm text-gray-400">Taxa comprovada pelos nossos usuários</p>
          </div>
          <div className="bg-card border border-white/10 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-[#33b864]/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-[#33b864]" />
            </div>
            <h3 className="font-bold text-white mb-2">+12.000 Assinantes</h3>
            <p className="text-sm text-gray-400">Do mundo todo confiam na TRUE SIGNAL</p>
          </div>
        </div>

        {/* Testimonials Slider */}
        <TestimonialsSlider />

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
                A cobrança é mensal e recorrente de R$ 47,90 (promoção válida até 31/12, de R$ 99,87). Você será notificado antes de cada renovação e pode cancelar a qualquer momento.
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
      </div>
    </Layout>
  );
}
