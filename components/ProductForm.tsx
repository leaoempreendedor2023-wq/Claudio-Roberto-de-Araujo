import React, { useState, useEffect, useRef } from 'react';
import { Product, PackagingMaterial } from '../types';
import { Plus, Save, Calculator, Tag, Box, Ruler, Upload, X, Settings, Percent, Check } from 'lucide-react';

interface ProductFormProps {
  onSave: (product: Product) => void;
  initialData?: Product | null;
  onCancel?: () => void;
}

const DEFAULT_PACKAGING: PackagingMaterial[] = [
  { id: 'none', name: 'Nenhuma / Própria', pricePerSqMeter: 0 },
  { id: 'kraft', name: 'Papel Kraft', pricePerSqMeter: 1.50 }, // R$ 1.50 per m2
  { id: 'cardboard', name: 'Papelão Corrugado', pricePerSqMeter: 3.20 },
  { id: 'plastic', name: 'Plástico Coextrusado', pricePerSqMeter: 0.90 },
];

const DEFAULT_CATEGORIES = ['Geral', 'Vestuário', 'Eletrônicos', 'Casa & Decoração', 'Beleza', 'Acessórios'];

export const ProductForm: React.FC<ProductFormProps> = ({ onSave, initialData, onCancel }) => {
  // Identity & Basic
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  // Categories Management
  const [categoriesList, setCategoriesList] = useState<string[]>(() => {
    const saved = localStorage.getItem('precifica_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Quantities & Base Costs
  const [quantity, setQuantity] = useState<number | ''>('');
  const [unitPurchasePrice, setUnitPurchasePrice] = useState<number | ''>('');
  const [totalShippingCost, setTotalShippingCost] = useState<number | ''>('');
  
  // Materials Management
  const [packagingList, setPackagingList] = useState<PackagingMaterial[]>(() => {
    const saved = localStorage.getItem('packaging_materials');
    return saved ? JSON.parse(saved) : DEFAULT_PACKAGING;
  });
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [newMatName, setNewMatName] = useState('');
  const [newMatPrice, setNewMatPrice] = useState<number | ''>('');

  // Selected Material
  const [packagingId, setPackagingId] = useState(DEFAULT_PACKAGING[0].id);
  
  // Other Costs
  const [tapeCost, setTapeCost] = useState<number | ''>(0.20);
  const [bubbleWrapCost, setBubbleWrapCost] = useState<number | ''>(0.50);
  const [printingCost, setPrintingCost] = useState<number | ''>(0.10);
  
  // Dimensions
  const [weight, setWeight] = useState<number | ''>('');
  const [length, setLength] = useState<number | ''>('');
  const [width, setWidth] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');

  // Fiscal
  const [showFiscal, setShowFiscal] = useState(false);
  const [taxRate, setTaxRate] = useState<number | ''>(0);

  // Pricing
  const [markupPercentage, setMarkupPercentage] = useState<number | ''>(50);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Save Data to LocalStorage
  useEffect(() => {
    localStorage.setItem('packaging_materials', JSON.stringify(packagingList));
  }, [packagingList]);

  useEffect(() => {
    localStorage.setItem('precifica_categories', JSON.stringify(categoriesList));
  }, [categoriesList]);

  // Populate form on Edit
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setSku(initialData.sku);
      setCategory(initialData.category || categoriesList[0]);
      setImageUrl(initialData.imageUrl || '');
      setQuantity(initialData.quantity);
      setUnitPurchasePrice(initialData.unitPurchasePrice);
      setTotalShippingCost(initialData.totalShippingCost);
      
      setPackagingId(initialData.materialCosts.packagingId);
      setTapeCost(initialData.materialCosts.tapeCost);
      setBubbleWrapCost(initialData.materialCosts.bubbleWrapCost);
      setPrintingCost(initialData.materialCosts.printingCost);
      
      setWeight(initialData.dimensions.weight);
      setLength(initialData.dimensions.length);
      setWidth(initialData.dimensions.width);
      setHeight(initialData.dimensions.height);
      
      setTaxRate(initialData.taxRate || 0);
      if(initialData.taxRate > 0) setShowFiscal(true);

      setMarkupPercentage(initialData.markupPercentage);
    } else {
      resetForm();
    }
  }, [initialData]);

  const resetForm = () => {
    setName('');
    setSku('');
    setCategory(categoriesList[0]);
    setImageUrl('');
    setQuantity('');
    setUnitPurchasePrice('');
    setTotalShippingCost('');
    setPackagingId(packagingList[0].id);
    setTapeCost(0.20);
    setBubbleWrapCost(0.50);
    setPrintingCost(0.10);
    setWeight('');
    setLength('');
    setWidth('');
    setHeight('');
    setTaxRate(0);
    setShowFiscal(false);
    // Keep markup
  };

  const handleAddMaterial = () => {
    if (newMatName && newMatPrice) {
      const newMat: PackagingMaterial = {
        id: crypto.randomUUID(),
        name: newMatName,
        pricePerSqMeter: Number(newMatPrice)
      };
      setPackagingList([...packagingList, newMat]);
      setPackagingId(newMat.id);
      setNewMatName('');
      setNewMatPrice('');
      setShowAddMaterial(false);
    }
  };

  const handleAddCategory = () => {
    if (newCategoryName && !categoriesList.includes(newCategoryName)) {
      const updatedList = [...categoriesList, newCategoryName];
      setCategoriesList(updatedList);
      setCategory(newCategoryName);
      setNewCategoryName('');
      setShowAddCategory(false);
    }
  };

  // Calculations
  const qty = Number(quantity) || 1;
  const shipping = Number(totalShippingCost) || 0;
  const purchase = Number(unitPurchasePrice) || 0;
  const markup = Number(markupPercentage) || 0;
  const taxPercent = Number(taxRate) || 0;

  // Dimensions Logic
  const l = Number(length) || 0;
  const w = Number(width) || 0;
  const h = Number(height) || 0;

  // Calculate Surface Area in m2
  // Area of a box = 2(lw + lh + wh)
  // Convert cm2 to m2 by dividing by 10000
  const surfaceAreaCm2 = 2 * ((l * w) + (l * h) + (w * h));
  const surfaceAreaM2 = surfaceAreaCm2 / 10000;

  const selectedPkg = packagingList.find(p => p.id === packagingId);
  const packagingCost = selectedPkg ? (surfaceAreaM2 * selectedPkg.pricePerSqMeter) : 0;

  // Material totals
  const matTape = Number(tapeCost) || 0;
  const matBubble = Number(bubbleWrapCost) || 0;
  const matPrint = Number(printingCost) || 0;
  const totalMaterialCost = packagingCost + matTape + matBubble + matPrint;

  const unitShipping = shipping / (qty > 0 ? qty : 1);
  
  // Cost Logic
  const totalUnitCost = purchase + unitShipping + totalMaterialCost;
  
  // Price Logic
  // Price = Cost * (1 + Markup)
  const sellingPrice = totalUnitCost * (1 + markup / 100);
  
  // Tax Logic (Tax is usually a cut of the selling price)
  const taxAmount = sellingPrice * (taxPercent / 100);
  
  // Net Profit = Selling Price - Total Cost - Tax
  const profit = sellingPrice - totalUnitCost - taxAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const product: Product = {
      id: initialData ? initialData.id : crypto.randomUUID(),
      name,
      sku,
      category: category || categoriesList[0],
      quantity: Number(quantity),
      imageUrl,
      unitPurchasePrice: Number(unitPurchasePrice),
      totalShippingCost: Number(totalShippingCost),
      
      materialCosts: {
        packagingId,
        packagingCost,
        tapeCost: matTape,
        bubbleWrapCost: matBubble,
        printingCost: matPrint
      },
      dimensions: {
        weight: Number(weight),
        length: Number(length),
        width: Number(width),
        height: Number(height)
      },
      totalMaterialCost,
      
      taxRate: taxPercent,
      taxAmount,

      markupPercentage: Number(markupPercentage),
      createdAt: initialData ? initialData.createdAt : Date.now(),
      
      // Computed
      unitShippingCost: unitShipping,
      totalUnitCost,
      sellingPrice,
      marginAmount: profit,
      marginPercentage: sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0
    };

    onSave(product);
    if (!initialData) resetForm();
  };

  // STYLES
  // High contrast input style: Dark bg, Light Yellow text
  const inputClass = "w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-yellow-400 text-yellow-100 placeholder-slate-500 outline-none transition-all";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1";

  return (
    <div className={`bg-white rounded-xl shadow-sm border ${initialData ? 'border-blue-300 ring-2 ring-blue-100' : 'border-slate-100'} overflow-hidden`}>
      <div className={`p-4 flex items-center justify-between ${initialData ? 'bg-blue-600' : 'bg-slate-800'}`}>
        <div className="flex items-center gap-2">
          <Calculator className="text-yellow-300" size={20} />
          <h2 className="text-white font-semibold">
            {initialData ? 'Editando Produto' : 'Nova Precificação'}
          </h2>
        </div>
        {initialData && onCancel && (
          <button onClick={onCancel} className="text-white/80 hover:text-white">
            <X size={20} />
          </button>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 gap-6">
        
        {/* Identity & Image */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Produto & Foto</h3>
          <div className="flex gap-4 items-start">
             <div className="flex-1 min-w-0 space-y-3">
                <div>
                  <label className={labelClass}>Nome do Produto</label>
                  <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Ex: Camiseta Algodão" />
                </div>
                
                <div className="grid grid-cols-12 gap-3">
                   {/* SKU - 3/12 */}
                   <div className="col-span-4 sm:col-span-3">
                      <label className={labelClass}>SKU</label>
                      <input required type="text" value={sku} onChange={(e) => setSku(e.target.value)} className={inputClass} placeholder="SKU-01" />
                   </div>
                   
                   {/* Category - 5/12 */}
                   <div className="col-span-8 sm:col-span-6 relative">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-sm font-medium text-slate-700">Categoria</label>
                        <button 
                            type="button" 
                            onClick={() => setShowAddCategory(!showAddCategory)}
                            className="text-[10px] text-blue-600 hover:text-blue-800 font-bold flex items-center"
                            title="Adicionar Nova Categoria"
                        >
                            <Plus size={10} /> Add
                        </button>
                      </div>
                      
                      {showAddCategory ? (
                         <div className="flex gap-1 animate-in fade-in slide-in-from-top-1 absolute top-8 left-0 right-0 z-20 bg-white p-1 rounded shadow-lg border border-slate-200">
                             <input 
                                type="text" 
                                autoFocus
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="Nova..." 
                                className={`${inputClass} text-xs py-1 px-2 h-8`}
                             />
                             <button 
                                type="button" 
                                onClick={handleAddCategory}
                                className="bg-blue-600 text-white rounded-lg px-2 hover:bg-blue-700"
                             >
                                <Check size={14} />
                             </button>
                             <button 
                                type="button" 
                                onClick={() => setShowAddCategory(false)}
                                className="bg-slate-200 text-slate-500 rounded-lg px-2 hover:bg-slate-300"
                             >
                                <X size={14} />
                             </button>
                         </div>
                      ) : (
                        <select 
                            value={category} 
                            onChange={(e) => setCategory(e.target.value)} 
                            className={`${inputClass} appearance-none truncate pr-6`}
                        >
                            {categoriesList.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                      )}
                   </div>

                   {/* Qty - 4/12 */}
                   <div className="col-span-12 sm:col-span-3">
                      <label className={labelClass}>Qtd Lote</label>
                      <input required type="number" min="1" value={quantity} onChange={(e) => setQuantity(parseFloat(e.target.value))} className={inputClass} placeholder="1" />
                   </div>
                </div>
             </div>
             
             {/* Image Upload - Fixed Width, No Shrink */}
             <div className="w-28 sm:w-32 flex-shrink-0">
               <label className="block text-sm font-medium text-slate-700 mb-1 text-center">Foto</label>
               <div 
                 className="aspect-square border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-colors relative overflow-hidden bg-slate-50"
                 onClick={() => fileInputRef.current?.click()}
               >
                 {imageUrl ? (
                   <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                 ) : (
                   <>
                     <Upload size={20} className="text-slate-400 mb-1" />
                     <span className="text-[10px] text-slate-400">Upload</span>
                   </>
                 )}
                 <input type="file" ref={fileInputRef} onChange={(e) => {
                    const file = e.target.files?.[0];
                    if(file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setImageUrl(reader.result as string);
                        reader.readAsDataURL(file);
                    }
                 }} accept="image/*" className="hidden" />
               </div>
               {imageUrl && (
                 <button type="button" onClick={() => setImageUrl('')} className="text-[10px] text-red-500 w-full text-center mt-1 hover:underline">Remover</button>
               )}
             </div>
          </div>
        </div>

        {/* Base Costs */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
             <Tag size={14} /> Custos Base
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Compra Unit.</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-yellow-100/50 text-xs z-10">R$</span>
                <input required type="number" step="0.01" min="0" value={unitPurchasePrice} onChange={(e) => setUnitPurchasePrice(parseFloat(e.target.value))} className={`${inputClass} pl-8`} placeholder="0.00" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Frete Lote</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-yellow-100/50 text-xs z-10">R$</span>
                <input required type="number" step="0.01" min="0" value={totalShippingCost} onChange={(e) => setTotalShippingCost(parseFloat(e.target.value))} className={`${inputClass} pl-8`} placeholder="0.00" />
              </div>
            </div>
          </div>
        </div>

        {/* Dimensions (Calculates Area for Packaging) */}
        <div className="space-y-2">
             <div className="flex items-center gap-2 mb-2 text-slate-400">
               <Ruler size={12} />
               <span className="text-[10px] font-bold uppercase">Dimensões & Peso (Calcula Embalagem)</span>
             </div>
             <div className="grid grid-cols-4 gap-2">
               <div>
                   <label className="text-[10px] text-slate-500 block mb-1">Peso (kg)</label>
                   <input type="number" step="0.01" value={weight} onChange={(e) => setWeight(parseFloat(e.target.value))} className={inputClass} />
               </div>
               <div>
                   <label className="text-[10px] text-slate-500 block mb-1">Comp. (cm)</label>
                   <input type="number" value={length} onChange={(e) => setLength(parseFloat(e.target.value))} className={inputClass} />
               </div>
               <div>
                   <label className="text-[10px] text-slate-500 block mb-1">Larg. (cm)</label>
                   <input type="number" value={width} onChange={(e) => setWidth(parseFloat(e.target.value))} className={inputClass} />
               </div>
               <div>
                   <label className="text-[10px] text-slate-500 block mb-1">Alt. (cm)</label>
                   <input type="number" value={height} onChange={(e) => setHeight(parseFloat(e.target.value))} className={inputClass} />
               </div>
             </div>
             {surfaceAreaM2 > 0 && (
                 <div className="text-right text-[10px] text-slate-500">
                    Área da Caixa: {surfaceAreaM2.toFixed(4)} m²
                 </div>
             )}
        </div>

        {/* Materials & Logistics */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
           <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Box size={14} /> Materiais e Insumos
                </h3>
                <button type="button" onClick={() => setShowAddMaterial(!showAddMaterial)} className="text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-1">
                    <Settings size={12} /> Gerenciar
                </button>
           </div>

           {/* Add Material Mode */}
           {showAddMaterial && (
             <div className="bg-white p-3 rounded border border-blue-100 mb-2 animate-in fade-in slide-in-from-top-1">
                <p className="text-xs font-bold text-slate-700 mb-2">Adicionar Novo Material de Embalagem</p>
                <div className="grid grid-cols-3 gap-2 mb-2">
                    <input type="text" placeholder="Nome (ex: Papelão)" value={newMatName} onChange={e => setNewMatName(e.target.value)} className="col-span-2 px-2 py-1 border rounded text-xs" />
                    <input type="number" placeholder="Preço/m²" value={newMatPrice} onChange={e => setNewMatPrice(parseFloat(e.target.value))} className="px-2 py-1 border rounded text-xs" />
                </div>
                <button type="button" onClick={handleAddMaterial} className="w-full bg-blue-600 text-white text-xs py-1 rounded hover:bg-blue-700">Adicionar</button>
             </div>
           )}
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="md:col-span-2">
               <label className="block text-sm font-medium text-slate-700 mb-1">Material Embalagem (Custo por m²)</label>
               <select 
                 value={packagingId} 
                 onChange={(e) => setPackagingId(e.target.value)}
                 className="w-full px-3 py-2 border border-slate-300 bg-white rounded-lg outline-none text-sm text-slate-700 focus:ring-2 focus:ring-blue-500"
               >
                 {packagingList.map(pkg => (
                   <option key={pkg.id} value={pkg.id}>
                     {pkg.name} - R$ {pkg.pricePerSqMeter.toFixed(2)}/m²
                   </option>
                 ))}
               </select>
               {packagingCost > 0 && (
                  <div className="text-xs text-slate-500 mt-1">
                      Custo Calculado: {surfaceAreaM2.toFixed(4)}m² x R${selectedPkg?.pricePerSqMeter.toFixed(2)} = <b>R${packagingCost.toFixed(2)}</b>
                  </div>
               )}
             </div>
             
             <div>
               <label className="block text-xs font-medium text-slate-600 mb-1">Fita Adesiva (R$)</label>
               <input type="number" step="0.01" value={tapeCost} onChange={(e) => setTapeCost(parseFloat(e.target.value))} className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white text-sm" />
             </div>
             <div>
               <label className="block text-xs font-medium text-slate-600 mb-1">Plástico Bolha (R$)</label>
               <input type="number" step="0.01" value={bubbleWrapCost} onChange={(e) => setBubbleWrapCost(parseFloat(e.target.value))} className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white text-sm" />
             </div>
             <div>
               <label className="block text-xs font-medium text-slate-600 mb-1">Impressão (R$)</label>
               <input type="number" step="0.01" value={printingCost} onChange={(e) => setPrintingCost(parseFloat(e.target.value))} className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white text-sm" />
             </div>
             <div className="bg-white px-3 py-1 rounded border border-slate-200 flex flex-col justify-center items-end">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Total Materiais</span>
                <span className="font-bold text-slate-700">R$ {totalMaterialCost.toFixed(2)}</span>
             </div>
           </div>
        </div>

        {/* Fiscal Section (Optional) */}
        <div className="border-t border-slate-200 pt-4">
             <div className="flex items-center gap-2 mb-3">
                <button type="button" onClick={() => setShowFiscal(!showFiscal)} className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${showFiscal ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-400'}`}>
                        {showFiscal && <span className="text-[10px]">✓</span>}
                    </div>
                    Cálculos Fiscais (Impostos)
                </button>
             </div>

             {showFiscal && (
                 <div className="grid grid-cols-2 gap-4 animate-in fade-in bg-slate-50 p-3 rounded-lg border border-slate-100">
                     <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Alíquota Imposto (%)</label>
                        <div className="relative">
                            <Percent size={12} className="absolute left-2 top-2.5 text-slate-400" />
                            <input type="number" step="0.1" value={taxRate} onChange={(e) => setTaxRate(parseFloat(e.target.value))} className="w-full pl-7 px-2 py-1.5 border border-slate-300 rounded bg-white text-sm" placeholder="Ex: 4.5" />
                        </div>
                     </div>
                     <div className="flex flex-col justify-center">
                        <span className="text-[10px] text-slate-500">Valor do Imposto (aprox.)</span>
                        <span className="text-sm font-bold text-red-500">R$ {taxAmount.toFixed(2)}</span>
                     </div>
                 </div>
             )}
        </div>

        {/* Pricing Logic */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resultado Final</h3>
          
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 shadow-inner">
            <div className="flex justify-between mb-1 text-sm">
               <span className="text-slate-500">Custo Mercadoria + Frete:</span>
               <span>R$ {(purchase + unitShipping).toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2 text-sm border-b border-slate-200 pb-2">
               <span className="text-slate-500">Custo Materiais:</span>
               <span>R$ {totalMaterialCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-3">
              <span className="text-sm font-bold text-slate-700">Custo Operacional Total:</span>
              <span className="font-bold text-slate-800 bg-yellow-100 px-2 rounded">
                R$ {totalUnitCost.toFixed(2)}
              </span>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Markup Desejado (%)</label>
              <input
                required
                type="number"
                step="1"
                value={markupPercentage}
                onChange={(e) => setMarkupPercentage(parseFloat(e.target.value))}
                className="w-full px-4 py-2 border border-blue-200 bg-blue-50 text-blue-900 font-bold rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-lg"
              />
            </div>

            <div className="pt-4 border-t border-slate-200">
              <div className="flex justify-between items-end mb-1">
                <span className="text-sm font-medium text-slate-600">Preço de Venda:</span>
                <span className="text-4xl font-bold text-emerald-600 tracking-tight">
                   {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sellingPrice)}
                </span>
              </div>
              
              {taxAmount > 0 && (
                   <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Impostos descontados:</span>
                    <span className="text-red-400">- R$ {taxAmount.toFixed(2)}</span>
                  </div>
              )}

              <div className="flex justify-between text-xs mt-2 pt-2 border-t border-dashed border-slate-200">
                <span className="text-slate-600 font-bold uppercase">Lucro Líquido:</span>
                <span className="text-emerald-600 font-bold text-sm bg-emerald-50 px-2 py-0.5 rounded">
                  + {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(profit)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            className={`w-full font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg ${initialData ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'}`}
          >
            {initialData ? <Save size={20} /> : <Plus size={20} />}
            {initialData ? 'Salvar Alterações' : 'Adicionar à Lista'}
          </button>
        </div>
      </form>
    </div>
  );
};