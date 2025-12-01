import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export function PageHeader({ title, subtitle, icon }: PageHeaderProps) {
  const [, navigate] = useLocation();

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate("/app");
    }
  };

  return (
    <div className="mb-6">
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 group"
        data-testid="button-back"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm">Voltar</span>
      </button>
      
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-[#33b864]/10 border border-[#33b864]/20 flex items-center justify-center">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-display font-bold text-white">{title}</h1>
          {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
