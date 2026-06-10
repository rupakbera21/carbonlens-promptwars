/** Category labels for display */
export const CATEGORY_LABELS: Record<string, string> = {
  transport: "Transport",
  energy: "Energy",
  food: "Food",
  shopping: "Shopping",
} as const;

/** Sub-category labels for display */
export const SUB_CATEGORY_LABELS: Record<string, Record<string, string>> = {
  transport: {
    car_petrol: "Petrol Car",
    car_diesel: "Diesel Car",
    car_electric: "Electric Car",
    bus: "Bus",
    train: "Train",
    flight_short: "Short Flight",
    flight_long: "Long Flight",
    bicycle: "Bicycle",
    walking: "Walking",
  },
  energy: {
    electricity: "Electricity",
    natural_gas: "Natural Gas",
    solar: "Solar",
  },
  food: {
    beef: "Beef",
    poultry: "Poultry",
    fish: "Fish",
    dairy: "Dairy",
    vegetables: "Vegetables",
    fruits: "Fruits",
    grains: "Grains",
  },
  shopping: {
    clothing: "Clothing",
    electronics: "Electronics",
    furniture: "Furniture",
    secondhand: "Second-hand",
  },
} as const;

/** Category colors for charts — CSS variable references */
export const CATEGORY_COLORS: Record<string, string> = {
  transport: "hsl(210, 100%, 56%)",
  energy: "hsl(45, 100%, 50%)",
  food: "hsl(142, 71%, 45%)",
  shopping: "hsl(280, 67%, 55%)",
} as const;

/** Category icons (Lucide icon names) */
export const CATEGORY_ICONS: Record<string, string> = {
  transport: "car",
  energy: "zap",
  food: "utensils",
  shopping: "shopping-bag",
} as const;
