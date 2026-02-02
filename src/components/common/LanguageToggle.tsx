import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LanguageToggleProps {
  variant?: "default" | "ghost" | "outline";
  showLabel?: boolean;
  className?: string;
}

export const LanguageToggle = ({ 
  variant = "ghost", 
  showLabel = false,
  className = "" 
}: LanguageToggleProps) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={showLabel ? "default" : "icon"} className={className}>
          <Languages className="h-4 w-4" />
          {showLabel && (
            <span className="ml-2">{language === 'en' ? 'EN' : 'বাং'}</span>
          )}
          <span className="sr-only">{t.common.switchLanguage}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => setLanguage('en')}
          className={language === 'en' ? 'bg-accent' : ''}
        >
          <span className="mr-2">🇺🇸</span>
          English
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setLanguage('bn')}
          className={language === 'bn' ? 'bg-accent' : ''}
        >
          <span className="mr-2">🇧🇩</span>
          বাংলা
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
