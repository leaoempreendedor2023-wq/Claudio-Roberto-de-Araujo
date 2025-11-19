export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  imageUrl?: string;
  
  // Costs
  unitPurchasePrice: number; 
  totalShippingCost: number;
  
  // Materials & Logistics
  materialCosts: {
    packagingId: string; // ID of the selected material
    packagingCost: number;
    tapeCost: number;
    bubbleWrapCost: number;
    printingCost: number;
  };
  dimensions: {
    weight: number; // kg
    length: number; // cm
    width: number; // cm
    height: number; // cm
  };
  totalMaterialCost: number;

  // Fiscal (New)
  taxRate: number; // Percentage
  taxAmount: number; // Calculated value

  // Pricing
  markupPercentage: number;
  createdAt: number;
  
  // Computed properties
  unitShippingCost: number;
  totalUnitCost: number;
  sellingPrice: number;
  marginAmount: number; // Net Profit (after tax)
  marginPercentage: number;
}

export interface PackagingMaterial {
  id: string;
  name: string;
  pricePerSqMeter: number;
}

export interface AIAnalysisResult {
  marketingCopy: string;
  financialAdvice: string;
  competitivenessScore: number;
}

export enum Currency {
  BRL = 'BRL'
}