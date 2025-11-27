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
import { MarketSelector } from "@/components/admin/market-selector";
import { imageUploadService } from "@/lib/image-upload-service";
import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";

const formSchema = z.object({
  league: z.string().min(1),
  homeTeam: z.string().min(1),
  awayTeam: z.string().min(1),
  homeTeamLogo: z.string().optional().nullable(),
  awayTeamLogo: z.string().optional().nullable(),
  fixtureId: z.string().optional().nullable(),
  market: z.string().min(1),
  odd: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Odd obrigatória",
  }),
  betLink: z.string().url().optional().or(z.literal('')),
  imageUrl: z.string().optional().nullable(),
});

const imageFormSchema = z.object({
  odd: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Odd obrigatória",
  }),
  betLink: z.string().url().optional().or(z.literal('')),
  imageUrl: z.string().min(1, "Imagem obrigatória"),
});

interface SignalFormProps {
  onAdd: (signal: any) => void;
  initialData?: Partial<Signal>;
}

export function SignalForm({ onAdd, initialData }: SignalFormProps) {
  const [isImageMode, setIsImageMode] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(isImageMode ? imageFormSchema : formSchema),
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

    setIsUploading(true);
    const result = await imageUploadService.uploadTipImage(file);
    setIsUploading(false);

    if (result.success && result.url) {
      setUploadedImageUrl(result.url);
      form.setValue('imageUrl', result.url);
      toast({ title: "Imagem enviada com sucesso!", className: "bg-primary/10 border-primary/20 text-primary" });
    } else {
      toast({ title: result.error || "Erro no upload", variant: "destructive" });
    }
  };

  const removeImage = () => {
    setUploadedImageUrl(null);
    form.setValue('imageUrl', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (isImageMode) {
      const newSignal = {
        league: "Bilhete Pronto",
        homeTeam: "Via Imagem",
        awayTeam: "Via Imagem",
        market: "Ver Print",
        odd: parseFloat(values.odd),
        betLink: values.betLink || undefined,
        imageUrl: uploadedImageUrl,
        status: "pending" as const,
        isLive: false,
      };
      
      onAdd(newSignal);
    } else {
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
        status: "pending" as const,
        isLive: false,
      };
      
      onAdd(newSignal);
    }
    
    form.reset({
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
    });
    
    setUploadedImageUrl(null);
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
        
        <div className="flex gap-2 p-1 bg-black/40 rounded-xl border border-primary/10">
          <button
            type="button"
            onClick={() => { setIsImageMode(false); removeImage(); }}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              !isImageMode 
                ? 'bg-primary text-black' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Digitar Bilhete
          </button>
          <button
            type="button"
            onClick={() => setIsImageMode(true)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              isImageMode 
                ? 'bg-primary text-black' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Subir Print
          </button>
        </div>

        {isImageMode ? (
          <>
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {uploadedImageUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-primary/30">
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
                  <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded text-xs text-primary">
                    Imagem pronta
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full h-40 border-2 border-dashed border-primary/30 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      <span className="text-sm text-gray-400">Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-primary" />
                      <span className="text-sm text-gray-400">Clique para enviar o print do bilhete</span>
                      <span className="text-xs text-gray-500">PNG, JPG até 5MB</span>
                    </>
                  )}
                </button>
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="odd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Odd Total *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="1.90" 
                          {...field} 
                          className="bg-black/40 border-primary/20 text-white focus-visible:ring-primary" 
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
                      <FormLabel className="text-white">Link Bet</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://..." 
                          {...field} 
                          className="bg-black/40 border-primary/20 text-white focus-visible:ring-primary" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="league"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Competição</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly className="bg-black/20 border-primary/10 text-muted-foreground" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="odd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Odd</FormLabel>
                    <FormControl>
                      <Input placeholder="1.90" {...field} className="bg-black/40 border-primary/20 text-white focus-visible:ring-primary" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="homeTeam"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Casa</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly className="bg-black/20 border-primary/10 text-muted-foreground" />
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
                    <FormLabel className="text-white">Fora</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly className="bg-black/20 border-primary/10 text-muted-foreground" />
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
                  <FormLabel className="text-white">Mercado (Entrada)</FormLabel>
                  <FormControl>
                    <MarketSelector value={field.value} onChange={field.onChange} />
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
                  <FormLabel className="text-white">Link da Bet (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} className="bg-black/40 border-primary/20 text-white focus-visible:ring-primary" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <Button 
          type="submit" 
          disabled={isImageMode && !uploadedImageUrl}
          className="w-full bg-primary hover:bg-primary-dark text-black font-bold shadow-glow disabled:opacity-50"
        >
          {isImageMode ? 'Publicar Print' : 'Confirmar Sinal'}
        </Button>
      </form>
    </Form>
  );
}
