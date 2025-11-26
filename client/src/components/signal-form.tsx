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

const formSchema = z.object({
  league: z.string().min(2),
  homeTeam: z.string().min(2),
  awayTeam: z.string().min(2),
  homeTeamLogo: z.string().optional().nullable(),
  awayTeamLogo: z.string().optional().nullable(),
  fixtureId: z.string().optional().nullable(),
  market: z.string().min(2),
  odd: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Must be a number",
  }),
  betLink: z.string().url().optional().or(z.literal('')),
});

interface SignalFormProps {
  onAdd: (signal: any) => void;
  initialData?: Partial<Signal>;
}

export function SignalForm({ onAdd, initialData }: SignalFormProps) {
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
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newSignal = {
      league: values.league,
      homeTeam: values.homeTeam,
      awayTeam: values.awayTeam,
      homeTeamLogo: values.homeTeamLogo || undefined,
      awayTeamLogo: values.awayTeamLogo || undefined,
      fixtureId: values.fixtureId || undefined,
      market: values.market,
      odd: parseFloat(values.odd), // Convert to number for Signal interface
      betLink: values.betLink || undefined,
      status: "pending" as const,
      isLive: false,
    };
    
    onAdd(newSignal);
    
    // Reset preserving match context (logos and fixtureId)
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
    });
    
    toast({
      title: "Sinal Criado com Sucesso",
      className: "bg-primary/10 border-primary/20 text-primary",
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
           {/* Read-only fields mostly since they come from API */}
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

        <Button type="submit" className="w-full bg-primary hover:bg-primary-dark text-black font-bold shadow-glow">
          Confirmar Sinal
        </Button>
      </form>
    </Form>
  );
}
