import React, { useState } from 'react';
import { Product, AIAnalysisResult } from '../types';
import { analyzeProductPricing } from '../services/geminiService';
import { BrainCircuit, Trash2, Edit, Sparkles, Loader2, FileText, Share2, Mail, Image as ImageIcon } from 'lucide-react';

interface ProductListProps {
  products: Product[];
  onDelete: (id: string) => void;
  onEdit: (product: Product) => void;
}

export const ProductList: React.FC<ProductListProps> = ({ products, onDelete, onEdit }) => {
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<Record<string, AIAnalysisResult>>({});

  const handleAnalyze = async (product: Product) => {
    setAnalyzingId(product.id);
    const result = await analyzeProductPricing(product);
    if (result) {
      setAnalysisResult(prev => ({ ...prev, [product.id]: result }));
    }
    setAnalyzingId(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    if(products.length === 0) {
        alert("Adicione produtos antes de exportar.");
        return;
    }
    const header = "📊 *RELATÓRIO DE PRECIFICAÇÃO*\n\n";
    const body = products.map(p => 
      `📦 *${p.name}* (${p.category})\nSKU: ${p.sku}\n💰 Venda: R$ ${p.sellingPrice.toFixed(2)}\n📉 Custo: R$ ${p.totalUnitCost.toFixed(2)}\n📈 Lucro: R$ ${p.marginAmount.toFixed(2)}\n`
    ).join('\n----------------\n');
    
    const fullText = encodeURIComponent(header + body);
    window.open(`https://wa.me/?text=${fullText}`, '_blank');
  };

  const handleEmail = () => {
    if(products.length === 0) {
        alert("Adicione produtos antes de exportar.");
        return;
    }
    const subject = encodeURIComponent("Relatório de Precificação de Produtos");
    const body = products.map(p => 
      `${p.name} - ${p.category} (SKU: ${p.sku}) - Preço: R$ ${p.sellingPrice.toFixed(2)} - Lucro: R$ ${p.marginAmount.toFixed(2)}`
    ).join('%0D%0A');
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border-2 border-slate-100 border-dashed">
        <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
          <FileText size={32} />
        </div>
        <p className="text-slate-400 font-medium">Nenhum produto precificado ainda.</p>
        <p className="text-slate-300 text-sm">Preencha o formulário para começar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="product-list-container">
      {/* Actions Header - Hidden when printing */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 no-print">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">{products.length}</span>
          Produtos na Lista
        </h2>

        <div className="flex items-center gap-2 flex-wrap justify-end">
           <button onClick={handlePrint} className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-800 text-white border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors shadow-sm cursor-pointer active:scale-95" title="Imprimir / Salvar PDF">
             <FileText size={16} /> Gerar PDF
           </button>
           <button onClick={handleWhatsApp} className="flex items-center gap-2 px-3 py-2 text-sm bg-emerald-600 text-white border border-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer active:scale-95" title="Enviar WhatsApp">
             <Share2 size={16} /> WhatsApp
           </button>
           <button onClick={handleEmail} className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white border border-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm cursor-pointer active:scale-95" title="Enviar Email">
             <Mail size={16} /> Email
           </button>
        </div>
      </div>

      {/* Printable Content Wrapper */}
      <div id="printable-content">
        
        {/* Print-Only Header */}
        <div className="hidden mb-8 border-b-2 border-slate-800 pb-4" style={{ display: 'none' }} id="print-header">
           <h1 className="text-3xl font-bold text-slate-900 mb-2">Relatório de Precificação</h1>
           <div className="flex justify-between text-sm text-slate-600">
              <p>PrecificaSmart AI</p>
              <p>Gerado em: {new Date().toLocaleDateString()} às {new Date().toLocaleTimeString()}</p>
           </div>
           {/* Inline style block to force display in print only via CSS trick in index.html */}
           <style>{`
             @media print {
               #print-header { display: block !important; }
             }
           `}</style>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {products.map((product) => (
            <div key={product.id} className="product-card bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow group">
              {/* Header */}
              <div className="p-4 sm:p-5 flex flex-col md:flex-row gap-5">
                {/* Image Thumbnail */}
                <div className="flex-shrink-0 w-24 h-24 md:w-28 md:h-28 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 relative">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <ImageIcon size={24} />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-4">
                     <div className="flex-1 min-w-0">
                       <div className="flex flex-wrap items-center gap-2 mb-1">
                         <h3 className="font-bold text-lg text-slate-800 truncate">{product.name}</h3>
                         {product.category && (
                             <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 uppercase font-semibold whitespace-nowrap">{product.category}</span>
                         )}
                         <span className="text-[10px] bg-slate-800 text-yellow-300 px-2 py-0.5 rounded font-mono whitespace-nowrap">{product.sku}</span>
                       </div>
                       <p className="text-xs text-slate-500 mt-2 flex flex-wrap gap-x-4 gap-y-1">
                         <span className="whitespace-nowrap">Estoque: <b>{product.quantity}</b></span>
                         <span className="text-slate-300 hidden sm:inline">|</span>
                         <span className="whitespace-nowrap">Custo Base: R${product.unitPurchasePrice.toFixed(2)}</span>
                         <span className="text-slate-300 hidden sm:inline">|</span>
                         <span className="whitespace-nowrap">Materiais: R${product.totalMaterialCost.toFixed(2)}</span>
                       </p>
                       {product.dimensions.weight > 0 && (
                          <p className="text-[10px] text-slate-400 mt-1">
                            Dimensões: {product.dimensions.length}x{product.dimensions.width}x{product.dimensions.height}cm ({product.dimensions.weight}kg)
                          </p>
                       )}
                       {product.taxAmount > 0 && (
                          <p className="text-[10px] text-red-400 mt-0.5">
                            Impostos: R$ {product.taxAmount.toFixed(2)} ({product.taxRate}%)
                          </p>
                       )}
                     </div>
                     
                     <div className="text-right flex-shrink-0 ml-2">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Preço Venda</p>
                        <p className="text-2xl sm:text-3xl font-bold text-blue-600 leading-none mt-1">
                          R$ {product.sellingPrice.toFixed(2)}
                        </p>
                     </div>
                  </div>

                  {/* Actions Bar (Bottom of card content) */}
                  <div className="mt-4 flex flex-wrap justify-between items-center pt-3 border-t border-slate-50 gap-3">
                     <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                        <span className={`${product.marginPercentage > 20 ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'} px-2 py-1 rounded font-medium`}>
                          Margem: {product.marginPercentage.toFixed(1)}%
                        </span>
                        <span className="text-emerald-600 font-bold px-2 py-1 bg-emerald-50 rounded">
                          Lucro Liq: R$ {product.marginAmount.toFixed(2)}
                        </span>
                     </div>

                     <div className="flex gap-2 no-print ml-auto">
                       <button 
                          onClick={() => onEdit(product)}
                          className="flex items-center gap-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors text-xs font-medium"
                       >
                         <Edit size={14} /> Editar
                       </button>
                       <button 
                          onClick={() => onDelete(product.id)}
                          className="flex items-center gap-1 text-slate-400 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors text-xs font-medium"
                       >
                         <Trash2 size={14} /> Excluir
                       </button>
                     </div>
                  </div>
                </div>
              </div>

              {/* AI Section - Hidden on Print via no-print class */}
              <div className="p-3 bg-gradient-to-r from-indigo-50/50 to-blue-50/50 border-t border-indigo-100 no-print">
                {!analysisResult[product.id] ? (
                  <div className="flex justify-between items-center">
                     <div className="flex items-center gap-2 text-indigo-700/70">
                        <Sparkles size={14} />
                        <span className="text-xs font-medium">Análise de Marketing & Finanças</span>
                     </div>
                     <button 
                       onClick={() => handleAnalyze(product)}
                       disabled={analyzingId === product.id}
                       className="bg-white text-indigo-600 text-[10px] font-bold px-3 py-1.5 rounded-full border border-indigo-200 hover:bg-indigo-50 transition-colors flex items-center gap-2 disabled:opacity-70 shadow-sm"
                     >
                       {analyzingId === product.id ? <Loader2 className="animate-spin" size={12}/> : <BrainCircuit size={12} />}
                       {analyzingId === product.id ? 'Pensando...' : 'Gerar com Gemini'}
                     </button>
                  </div>
                ) : (
                  <div className="space-y-2 animate-in fade-in duration-500">
                    <div className="flex justify-between items-start">
                      <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles size={10} /> Análise Gemini
                      </h4>
                      <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-indigo-100 shadow-sm">
                        <span className="text-[10px] text-slate-500">Competitividade:</span>
                        <span className="text-xs font-bold text-indigo-600">{analysisResult[product.id].competitivenessScore}/10</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      <div className="bg-white p-2 rounded border border-indigo-100/50">
                        <span className="font-bold text-slate-500 block mb-1">Copy:</span>
                        <p className="text-slate-700 italic">"{analysisResult[product.id].marketingCopy}"</p>
                      </div>
                      <div className="bg-white p-2 rounded border border-indigo-100/50">
                         <span className="font-bold text-slate-500 block mb-1">Finanças:</span>
                         <p className="text-indigo-800">{analysisResult[product.id].financialAdvice}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
};