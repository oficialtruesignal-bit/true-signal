import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Signal } from "@/lib/mock-data";
import { imageUploadService } from "@/lib/image-upload-service";
import { useState, useRef } from "react";
import { X, ScanLine, Loader2, Sparkles, Check } from "lucide-react";
import axios from "axios";

const formSchema = z.object({
  league: z.string().optional(),
  homeTeam: z.string().min(1, "Time casa obrigatório"),
  awayTeam: z.string().min(1, "Time fora obrigatório"),
  homeTeamLogo: z.string().optional().nullable(),
  awayTeamLogo: z.string().optional().nullable(),
  fixtureId: z.string().optional().nullable(),
  market: z.string().min(1, "Mercado obrigatório"),
  odd: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Odd obrigatória",
  }),
  betLink: z.string().url().optional().or(z.literal('')),
  imageUrl: z.string().optional().nullable(),
});

interface SignalFormProps {
  onAdd: (signal: any) => void;
  initialData?: Partial<Signal>;
}

interface ScannedBet {
  home_team: string;
  away_team: string;
  market: string;
  odd: number;
  league: string;
}

interface ScanResult {
  bets: ScannedBet[];
  total_odd: number;
  is_multiple: boolean;
}

export function SignalForm({ onAdd, initialData }: SignalFormProps) {
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      league: initialData?.league || "",
      homeTeam: initialData?.homeTeam || "",
      awayTeam: initialData?.awayTeam || "",
      homeTeamLogo: initialData?.homeTeamLogo || "",
      awayTeamLogo: initialData?.awayTeamLogo || "",
      fixtureId: initialData?.fixtureId?.toString() || "",
      market: "",
      odd: "",
      betLink: "",
      imageUrl: "",
    },
  });

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: "Selecione uma imagem válida", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Imagem muito grande (máx 5MB)", variant: "destructive" });
      return;
    }

    setScanError(null);
    setScanResult(null);

    const base64 = await convertToBase64(file);
    setUploadedImageUrl(base64);

    imageUploadService.uploadTipImage(file).then((uploadResult) => {
      if (uploadResult.success && uploadResult.url) {
        setUploadedImageUrl(uploadResult.url);
        form.setValue('imageUrl', uploadResult.url);
      }
    }).catch(() => {
      console.log('Upload falhou, usando apenas scan');
    });

    setIsScanning(true);
    toast({ 
      title: "🤖 IA está lendo seu bilhete...", 
      className: "bg-primary/10 border-primary/20 text-primary" 
    });

    try {
      const response = await axios.post('/api/scan-ticket', { 
        imageBase64: base64 
      });

      if (response.data.success && response.data.data) {
        const data = response.data.data as ScanResult;
        setScanResult(data);

        if (data.bets && data.bets.length > 0) {
          const firstBet = data.bets[0];
          
          form.setValue('league', firstBet.league || 'Liga Detectada');
          form.setValue('homeTeam', firstBet.home_team || '');
          form.setValue('awayTeam', firstBet.away_team || '');
          form.setValue('market', firstBet.market || '');
          form.setValue('odd', data.total_odd?.toString() || firstBet.odd?.toString() || '');

          toast({ 
            title: "✨ Bilhete lido com sucesso!", 
            description: data.is_multiple 
              ? `${data.bets.length} apostas detectadas - Odd Total: ${data.total_odd}`
              : `${firstBet.home_team} x ${firstBet.away_team}`,
            className: "bg-primary/10 border-primary/20 text-primary" 
          });
        }
      }
    } catch (error: any) {
      console.error('Scan error:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao escanear. Preencha manualmente.';
      setScanError(errorMessage);
      toast({ 
        title: "IA não conseguiu ler", 
        description: errorMessage,
        variant: "destructive" 
      });
    } finally {
      setIsScanning(false);
    }
  };

  const removeImage = () => {
    setUploadedImageUrl(null);
    setScanResult(null);
    setScanError(null);
    form.reset({
      league: "",
      homeTeam: "",
      awayTeam: "",
      homeTeamLogo: "",
      awayTeamLogo: "",
      fixtureId: "",
      market: "",
      odd: "",
      betLink: "",
      imageUrl: "",
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newSignal = {
      league: values.league,
      homeTeam: values.homeTeam,
      awayTeam: values.awayTeam,
      homeTeamLogo: values.homeTeamLogo || undefined,
      awayTeamLogo: values.awayTeamLogo || undefined,
      fixtureId: values.fixtureId || undefined,
      market: values.market,
      odd: parseFloat(values.odd),
      betLink: values.betLink || undefined,
      imageUrl: uploadedImageUrl?.startsWith('http') ? uploadedImageUrl : undefined,
      status: "pending" as const,
      isLive: false,
    };
    
    onAdd(newSignal);
    
    form.reset();
    setUploadedImageUrl(null);
    setScanResult(null);
    setScanError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    toast({
      title: "Sinal Criado com Sucesso",
      className: "bg-primary/10 border-primary/20 text-primary",
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
        {/* DROPZONE - Scanner de Bilhete */}
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {uploadedImageUrl ? (
            <div className="relative rounded-xl overflow-hidden border-2 border-primary/50 bg-primary/5">
              <img 
                src={uploadedImageUrl} 
                alt="Preview" 
                className="w-full h-48 object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3">
                {isScanning ? (
                  <div className="flex items-center gap-2 text-primary">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-medium">IA está lendo o bilhete...</span>
                  </div>
                ) : scanResult ? (
                  <div className="flex items-center gap-2 text-primary">
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {scanResult.is_multiple 
                        ? `${scanResult.bets.length} apostas • Odd ${scanResult.total_odd}`
                        : 'Bilhete lido com sucesso!'
                      }
                    </span>
                  </div>
                ) : scanError ? (
                  <div className="flex items-center gap-2 text-yellow-500">
                    <span className="text-sm">⚠️ Preencha os campos manualmente</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-400">
                    <span className="text-sm">Imagem carregada</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isScanning}
              className="w-full h-40 border-2 border-dashed border-primary/40 bg-primary/5 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-primary/70 hover:bg-primary/10 transition-all cursor-pointer group"
            >
              <div className="relative">
                <ScanLine className="w-12 h-12 text-primary group-hover:scale-110 transition-transform" />
                <Sparkles className="w-5 h-5 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div className="text-center">
                <span className="text-base text-gray-300 font-medium block">
                  Clique para subir o Print
                </span>
                <span className="text-sm text-primary mt-1 block">
                  🪄 A IA preenche tudo automaticamente
                </span>
              </div>
            </button>
          )}
        </div>

        {/* Campos preenchidos pela IA (editáveis) */}
        {(uploadedImageUrl || scanResult) && (
          <div className="space-y-4 pt-2 border-t border-primary/10">
            <p className="text-xs text-muted-foreground">Confira e corrija se necessário:</p>
            
            <FormField
              control={form.control}
              name="odd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white text-xs">Odd Total</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="1.90" 
                      {...field} 
                      className="bg-black/40 border-primary/20 text-white focus-visible:ring-primary h-9 text-sm" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="homeTeam"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white text-xs">Time Casa</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Arsenal" 
                        {...field} 
                        className="bg-black/40 border-primary/20 text-white focus-visible:ring-primary h-9 text-sm" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="awayTeam"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white text-xs">Time Fora</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Chelsea" 
                        {...field} 
                        className="bg-black/40 border-primary/20 text-white focus-visible:ring-primary h-9 text-sm" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="market"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white text-xs">Mercado</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Over 2.5 Gols, Ambas Marcam" 
                      {...field} 
                      className="bg-black/40 border-primary/20 text-white focus-visible:ring-primary h-9 text-sm" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="betLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white text-xs">Link da Bet (Opcional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://bet365.com/..." 
                      {...field} 
                      className="bg-black/40 border-primary/20 text-white focus-visible:ring-primary h-9 text-sm" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              disabled={isScanning}
              className="w-full bg-primary hover:bg-primary/90 text-black font-bold shadow-glow disabled:opacity-50"
            >
              {isScanning ? 'Aguarde a IA...' : 'Publicar Sinal'}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
