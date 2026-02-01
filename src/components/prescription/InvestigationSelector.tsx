import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useInvestigations, Investigation } from "@/hooks/useInvestigations";
import { Search, X, FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectedInvestigation {
  id: string;
  name: string;
  name_bn?: string;
}

interface InvestigationSelectorProps {
  selected: SelectedInvestigation[];
  onSelect: (investigations: SelectedInvestigation[]) => void;
  language?: "english" | "bangla";
}

export const InvestigationSelector = ({
  selected,
  onSelect,
  language = "english",
}: InvestigationSelectorProps) => {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { investigations, searchInvestigations, getInvestigationsByCategory } = useInvestigations();

  const searchResults = search.length >= 2 ? searchInvestigations(search) : [];
  const groupedInvestigations = getInvestigationsByCategory();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addInvestigation = (inv: Investigation) => {
    if (!selected.find((s) => s.id === inv.id)) {
      onSelect([
        ...selected,
        {
          id: inv.id,
          name: inv.name,
          name_bn: inv.name_bn || undefined,
        },
      ]);
    }
    setSearch("");
  };

  const removeInvestigation = (id: string) => {
    onSelect(selected.filter((s) => s.id !== id));
  };

  const isSelected = (id: string) => selected.some((s) => s.id === id);

  return (
    <div ref={containerRef} className="space-y-2">
      <Label className="flex items-center gap-2">
        <FlaskConical className="h-4 w-4" />
        Investigations
      </Label>
      
      {/* Selected Investigations */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map((inv) => (
            <Badge
              key={inv.id}
              variant="secondary"
              className="pl-2 pr-1 py-1 flex items-center gap-1"
            >
              <span className="text-xs">
                {language === "bangla" && inv.name_bn ? inv.name_bn : inv.name}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 hover:bg-destructive/20"
                onClick={() => removeInvestigation(inv.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search investigations (CBC, X-Ray, ECG...)"
          className="pl-10"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="border rounded-md bg-popover shadow-md">
          <ScrollArea className="max-h-64">
            {search.length >= 2 ? (
              // Search Results
              searchResults.length > 0 ? (
                <div className="p-1">
                  {searchResults.map((inv) => (
                    <button
                      key={inv.id}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-sm hover:bg-accent flex justify-between items-center text-sm",
                        isSelected(inv.id) && "bg-accent/50"
                      )}
                      onClick={() => addInvestigation(inv)}
                      disabled={isSelected(inv.id)}
                    >
                      <div>
                        <span className="font-medium">{inv.name}</span>
                        {language === "bangla" && inv.name_bn && (
                          <span className="text-muted-foreground ml-2">
                            ({inv.name_bn})
                          </span>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {inv.category}
                      </Badge>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="p-4 text-sm text-muted-foreground text-center">
                  No investigations found
                </p>
              )
            ) : (
              // Category View
              <div className="p-2">
                {Object.entries(groupedInvestigations).map(([category, invs]) => (
                  <div key={category} className="mb-3">
                    <p className="text-xs font-semibold text-muted-foreground px-2 mb-1">
                      {category}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {invs.slice(0, 8).map((inv) => (
                        <Badge
                          key={inv.id}
                          variant={isSelected(inv.id) ? "default" : "outline"}
                          className={cn(
                            "cursor-pointer text-xs",
                            isSelected(inv.id) && "opacity-50 cursor-not-allowed"
                          )}
                          onClick={() => !isSelected(inv.id) && addInvestigation(inv)}
                        >
                          {inv.name.length > 20 ? inv.name.slice(0, 20) + "..." : inv.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
};
