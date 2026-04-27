import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export function QuantityStepper({ 
  value, 
  onChange, 
  min = 1, 
  max = 99, 
  disabled = false 
}: QuantityStepperProps) {
  
  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div className="flex items-center border border-border rounded-full p-1 bg-background">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full hover:bg-muted text-muted-foreground"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
      >
        <Minus className="w-4 h-4" />
        <span className="sr-only">Decrease</span>
      </Button>
      
      <span className="w-10 text-center font-medium text-sm">
        {value}
      </span>
      
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full hover:bg-muted text-muted-foreground"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
      >
        <Plus className="w-4 h-4" />
        <span className="sr-only">Increase</span>
      </Button>
    </div>
  );
}
