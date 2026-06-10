"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/presentation/components/ui/card";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { cn } from "@/shared/utils/cn";
import { CATEGORY_LABELS, SUB_CATEGORY_LABELS } from "@/shared/constants/categories";
import type { ActivityCategory } from "@/domain/entities/activity";
import { ACTIVITY_CATEGORIES } from "@/domain/entities/activity";
import { Car, Zap, Utensils, ShoppingBag, Plus, Loader2 } from "lucide-react";

const CATEGORY_ICON_MAP = {
  transport: Car,
  energy: Zap,
  food: Utensils,
  shopping: ShoppingBag,
} as const;

interface EmissionFactorOption {
  id: string;
  subCategory: string;
  name: string;
  unit: string;
}

interface QuickLogProps {
  emissionFactors: EmissionFactorOption[];
  onSubmit: (data: {
    category: ActivityCategory;
    subCategory: string;
    quantity: number;
    unit: string;
    emissionFactorId: string;
    activityDate: string;
  }) => Promise<void>;
  className?: string;
}

/**
 * QuickLog — compact form for rapidly logging activities.
 * Three-step flow: Category → Sub-category → Quantity.
 */
export function QuickLog({ emissionFactors, onSubmit, className }: QuickLogProps) {
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | null>(null);
  const [selectedFactor, setSelectedFactor] = useState<EmissionFactorOption | null>(null);
  const [quantity, setQuantity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const subCategories = selectedCategory
    ? emissionFactors.filter((ef) =>
        Object.keys(SUB_CATEGORY_LABELS[selectedCategory] ?? {}).includes(ef.subCategory),
      )
    : [];

  const handleSubmit = async () => {
    if (!selectedCategory || !selectedFactor || !quantity) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        category: selectedCategory,
        subCategory: selectedFactor.subCategory,
        quantity: parseFloat(quantity),
        unit: selectedFactor.unit,
        emissionFactorId: selectedFactor.id,
        activityDate: new Date().toISOString().split("T")[0],
      });
      setSuccess(true);
      setSelectedCategory(null);
      setSelectedFactor(null);
      setQuantity("");
      setTimeout(() => setSuccess(false), 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Plus className="h-5 w-5" />
          Quick Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        {success && (
          <div
            className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-950 dark:text-green-200"
            role="status"
            aria-live="polite"
          >
            ✓ Activity logged successfully!
          </div>
        )}

        {/* Step 1: Category selection */}
        <div className="mb-4">
          <Label className="mb-2 block text-xs text-muted-foreground">Category</Label>
          <div
            className="grid grid-cols-2 gap-2"
            role="radiogroup"
            aria-label="Select activity category"
          >
            {ACTIVITY_CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICON_MAP[cat];
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSelectedFactor(null);
                    setQuantity("");
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border p-3 text-sm transition-colors",
                    "hover:border-primary hover:bg-accent",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    selectedCategory === cat && "border-primary bg-primary/5 font-medium",
                  )}
                  role="radio"
                  aria-checked={selectedCategory === cat}
                >
                  <Icon className="h-4 w-4" />
                  {CATEGORY_LABELS[cat]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Sub-category selection */}
        {selectedCategory && subCategories.length > 0 && (
          <div className="mb-4">
            <Label className="mb-2 block text-xs text-muted-foreground">Type</Label>
            <div className="flex flex-wrap gap-2">
              {subCategories.map((ef) => (
                <button
                  key={ef.id}
                  onClick={() => setSelectedFactor(ef)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs transition-colors",
                    "hover:border-primary hover:bg-accent",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    selectedFactor?.id === ef.id &&
                      "border-primary bg-primary/10 font-medium",
                  )}
                >
                  {ef.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Quantity input */}
        {selectedFactor && (
          <div className="mb-4">
            <Label
              htmlFor="quick-log-quantity"
              className="mb-2 block text-xs text-muted-foreground"
            >
              Quantity ({selectedFactor.unit})
            </Label>
            <div className="flex gap-2">
              <Input
                id="quick-log-quantity"
                type="number"
                min="0"
                step="0.1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder={`e.g. 10 ${selectedFactor.unit}`}
                className="flex-1"
                aria-describedby="quantity-hint"
              />
              <Button
                onClick={handleSubmit}
                disabled={!quantity || isSubmitting}
                size="default"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log"}
              </Button>
            </div>
            <p id="quantity-hint" className="mt-1 text-xs text-muted-foreground">
              Enter the amount in {selectedFactor.unit}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
