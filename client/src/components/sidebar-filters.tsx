import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Search } from "lucide-react";
import type { Filters, Stats } from "@/lib/types";

interface SidebarFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  stats?: Stats;
}

const categories = [
  "Goal Misgeneralization",
  "Reward Hacking", 
  "Distribution Shift",
  "Mesa-Optimization",
  "Deceptive Alignment"
];

export default function SidebarFilters({ filters, onFiltersChange, stats }: SidebarFiltersProps) {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked 
      ? [...filters.categories, category]
      : filters.categories.filter(c => c !== category);
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handleSeverityChange = (severity: string) => {
    onFiltersChange({ ...filters, severity });
  };

  return (
    <div className="bg-card rounded border-2 border-foreground/20 p-6 sticky top-32 shadow-lg">
      <h3 className="text-xl font-bold text-foreground mb-4 border-b border-foreground/20 pb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
        Investigation Filters
      </h3>
      
      <div className="mb-6">
        <Label className="block text-sm font-semibold text-foreground mb-2">
          Search Incidents
        </Label>
        <div className="relative">
          <Input
            type="text"
            placeholder="Search reports..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 border-foreground/30 focus:border-primary"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="mb-6">
        <Label className="text-sm font-semibold text-foreground mb-3 block">
          Incident Classifications
        </Label>
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category} className="flex items-center justify-between border-b border-foreground/10 pb-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={category}
                  checked={filters.categories.includes(category)}
                  onCheckedChange={(checked) => 
                    handleCategoryChange(category, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={category}
                  className="text-sm text-foreground cursor-pointer font-medium"
                >
                  {category}
                </Label>
              </div>
              <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded font-semibold">
                {stats?.categoryCounts[category] || 0}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-sm font-semibold text-foreground mb-3 block">
          Threat Assessment
        </Label>
        <RadioGroup 
          value={filters.severity} 
          onValueChange={handleSeverityChange}
          className="space-y-3"
        >
          <div className="flex items-center space-x-2 border-b border-foreground/10 pb-2">
            <RadioGroupItem value="all" id="all" />
            <Label htmlFor="all" className="text-sm text-foreground font-medium">
              All Classifications
            </Label>
          </div>
          <div className="flex items-center space-x-2 border-b border-foreground/10 pb-2">
            <RadioGroupItem value="concerning" id="concerning" />
            <Label htmlFor="concerning" className="text-sm text-foreground font-medium">
              ⚠️ Under Investigation
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="critical" id="critical" />
            <Label htmlFor="critical" className="text-sm text-foreground font-medium">
              🚨 Breaking News
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}
