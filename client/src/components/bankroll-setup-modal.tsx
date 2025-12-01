import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Scale, Rocket, ArrowRight, ArrowLeft, Check, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface BankrollSetupModalProps {
  isOpen: boolean;
  onComplete: (data: { bankrollInitial: number; riskProfile: string; unitValue: number }) => void;
}

const riskProfiles = [
  {
    id: "conservador",
    name: "Conservador",
    icon: Shield,
    divisor: 100,
    percentage: "1%",
    description: "Divide seu capital em 100 partes. Blindagem máxima contra sequências ruins.",
    color: "from-blue-500/20 to-blue-600/10",
    borderColor: "border-blue-500/50",
    iconColor: "text-blue-400",
  },
  {
    id: "moderado",
    name: "Moderado",
    icon: Scale,
    divisor: 50,
    percentage: "2%",
    description: "Divide em 50 partes. O equilíbrio ideal entre crescimento e segurança para nossa assertividade de 83%.",
    recommended: true,
    color: "from-[#33b864]/20 to-[#33b864]/10",
    borderColor: "border-[#33b864]/50",
    iconColor: "text-[#33b864]",
  },
  {
    id: "agressivo",
    name: "Agressivo",
    icon: Rocket,
    divisor: 30,
    percentage: "3.3%",
    description: "Divide em 30 partes. Crescimento acelerado, mas com maior volatilidade.",
    color: "from-orange-500/20 to-orange-600/10",
    borderColor: "border-orange-500/50",
    iconColor: "text-orange-400",
  },
];

export function BankrollSetupModal({ isOpen, onComplete }: BankrollSetupModalProps) {
  const [step, setStep] = useState(1);
  const [bankrollAmount, setBankrollAmount] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    const amount = parseInt(numbers || "0") / 100;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setBankrollAmount(value);
  };

  const getNumericAmount = () => {
    return parseInt(bankrollAmount || "0") / 100;
  };

  const calculateUnitValue = () => {
    if (!selectedProfile) return 0;
    const profile = riskProfiles.find((p) => p.id === selectedProfile);
    if (!profile) return 0;
    return getNumericAmount() / profile.divisor;
  };

  const handleNext = () => {
    if (step === 1 && getNumericAmount() >= 50) {
      setStep(2);
    } else if (step === 2 && selectedProfile) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleConfirm = async () => {
    if (!selectedProfile) return;
    
    setIsSubmitting(true);
    const unitValue = calculateUnitValue();
    
    await onComplete({
      bankrollInitial: getNumericAmount(),
      riskProfile: selectedProfile,
      unitValue: unitValue,
    });
    
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
      <div className="w-full h-full max-w-lg mx-auto flex flex-col p-4 md:p-6 overflow-y-auto">
        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                "h-1 flex-1 rounded-full transition-all duration-300",
                s <= step ? "bg-[#33b864]" : "bg-white/10"
              )}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Capital */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="flex-1">
                <div className="w-16 h-16 rounded-2xl bg-[#33b864]/20 flex items-center justify-center mb-6">
                  <Wallet className="w-8 h-8 text-[#33b864]" />
                </div>
                
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2" style={{ fontFamily: "Sora, sans-serif" }}>
                  Definição de Capital Operacional
                </h1>
                <p className="text-gray-400 mb-8">
                  Qual o valor total disponível para suas operações hoje?
                </p>

                <div className="mb-4">
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={bankrollAmount ? formatCurrency(bankrollAmount) : ""}
                    onChange={handleAmountChange}
                    placeholder="R$ 0,00"
                    className="h-16 text-2xl md:text-3xl font-bold text-center bg-white/5 border-white/10 text-white placeholder:text-gray-600"
                    data-testid="input-bankroll-amount"
                  />
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                  <p className="text-yellow-400 text-sm">
                    <strong>Atenção:</strong> Não use dinheiro destinado a contas essenciais. 
                    Operamos com capital de risco.
                  </p>
                </div>
              </div>

              <Button
                onClick={handleNext}
                disabled={getNumericAmount() < 50}
                className="w-full h-14 bg-[#33b864] hover:bg-[#289a54] text-black font-bold text-lg mt-8"
                data-testid="button-next-step1"
              >
                Continuar
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* Step 2: Risk Profile */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2" style={{ fontFamily: "Sora, sans-serif" }}>
                  Escolha sua Exposição ao Risco
                </h1>
                <p className="text-gray-400 mb-6">
                  Cada perfil divide seu capital de forma diferente para proteger sua banca.
                </p>

                <div className="space-y-4">
                  {riskProfiles.map((profile) => (
                    <button
                      key={profile.id}
                      onClick={() => setSelectedProfile(profile.id)}
                      className={cn(
                        "w-full p-4 rounded-2xl border-2 text-left transition-all",
                        `bg-gradient-to-br ${profile.color}`,
                        selectedProfile === profile.id
                          ? `${profile.borderColor} scale-[1.02]`
                          : "border-white/10 hover:border-white/20"
                      )}
                      data-testid={`button-profile-${profile.id}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={cn("p-3 rounded-xl bg-black/30", profile.iconColor)}>
                          <profile.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-white">{profile.name}</span>
                            <span className="text-xs text-gray-400">({profile.percentage})</span>
                            {profile.recommended && (
                              <span className="px-2 py-0.5 bg-[#33b864] text-black text-[10px] font-bold rounded-full">
                                RECOMENDADO
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400">{profile.description}</p>
                          {selectedProfile === profile.id && (
                            <div className="mt-3 pt-3 border-t border-white/10">
                              <p className="text-sm text-white">
                                Sua unidade será:{" "}
                                <span className="font-bold text-[#33b864]">
                                  {new Intl.NumberFormat("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                  }).format(getNumericAmount() / profile.divisor)}
                                </span>
                              </p>
                            </div>
                          )}
                        </div>
                        {selectedProfile === profile.id && (
                          <div className="p-1 rounded-full bg-[#33b864]">
                            <Check className="w-4 h-4 text-black" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1 h-14 border-white/20 text-white hover:bg-white/5"
                  data-testid="button-back-step2"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Voltar
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!selectedProfile}
                  className="flex-1 h-14 bg-[#33b864] hover:bg-[#289a54] text-black font-bold"
                  data-testid="button-next-step2"
                >
                  Continuar
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="flex-1">
                <div className="w-16 h-16 rounded-full bg-[#33b864]/20 flex items-center justify-center mb-6 mx-auto">
                  <Check className="w-8 h-8 text-[#33b864]" />
                </div>
                
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 text-center" style={{ fontFamily: "Sora, sans-serif" }}>
                  Confirmação da Estratégia
                </h1>
                <p className="text-gray-400 mb-8 text-center">
                  Revise sua configuração antes de confirmar
                </p>

                <div className="bg-white/5 rounded-2xl p-6 space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Capital Inicial</span>
                    <span className="font-bold text-white">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(getNumericAmount())}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Perfil de Risco</span>
                    <span className="font-bold text-white capitalize">{selectedProfile}</span>
                  </div>
                  <div className="h-px bg-white/10" />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Sua Unidade Padrão</span>
                    <span className="font-bold text-2xl text-[#33b864]">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(calculateUnitValue())}
                    </span>
                  </div>
                </div>

                <div className="bg-[#33b864]/10 border border-[#33b864]/30 rounded-xl p-4">
                  <p className="text-[#33b864] text-sm text-center">
                    Em cada bilhete, você verá o valor exato a apostar baseado nesta configuração.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1 h-14 border-white/20 text-white hover:bg-white/5"
                  data-testid="button-back-step3"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Voltar
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                  className="flex-1 h-14 bg-[#33b864] hover:bg-[#289a54] text-black font-bold"
                  data-testid="button-confirm-strategy"
                >
                  {isSubmitting ? "Salvando..." : "CONFIRMAR ESTRATÉGIA"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
