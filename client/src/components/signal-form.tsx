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

const formSchema = z.object({
  league: z.string().min(2),
  homeTeam: z.string().min(2),
  awayTeam: z.string().min(2),
  market: z.string().min(2),
  odd: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Must be a number",
  }),
});

export function SignalForm({ onAdd }: { onAdd: (signal: Signal) => void }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      league: "",
      homeTeam: "",
      awayTeam: "",
      market: "",
      odd: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newSignal: Signal = {
      id: Math.random().toString(36).substr(2, 9),
      ...values,
      odd: Number(values.odd),
      status: "pending",
      timestamp: new Date().toISOString(),
    };
    
    onAdd(newSignal);
    form.reset();
    toast({
      title: "Signal Created",
      className: "bg-green-900 border-green-800 text-white",
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 bg-card p-6 rounded-xl border border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="league"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">League</FormLabel>
                <FormControl>
                  <Input placeholder="Premier League" {...field} className="bg-background border-white/10 text-white focus-visible:ring-primary" />
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
                  <Input placeholder="1.90" {...field} className="bg-background border-white/10 text-white focus-visible:ring-primary" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="homeTeam"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Home Team</FormLabel>
                <FormControl>
                  <Input placeholder="Arsenal" {...field} className="bg-background border-white/10 text-white focus-visible:ring-primary" />
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
                <FormLabel className="text-white">Away Team</FormLabel>
                <FormControl>
                  <Input placeholder="Liverpool" {...field} className="bg-background border-white/10 text-white focus-visible:ring-primary" />
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
              <FormLabel className="text-white">Market</FormLabel>
              <FormControl>
                <Input placeholder="Over 2.5 Goals" {...field} className="bg-background border-white/10 text-white focus-visible:ring-primary" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white">Create Signal</Button>
      </form>
    </Form>
  );
}
