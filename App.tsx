import React, { useState, useEffect } from 'react';
import { DashboardStats } from './components/DashboardStats';
import { ProductForm } from './components/ProductForm';
import { ProductList } from './components/ProductList';
import { Product } from './types';
import { Sparkles, Bell, Package } from 'lucide-react';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('precifica_products');
    return saved ? JSON.parse(saved) : [];
  });

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    localStorage.setItem('precifica_products', JSON.stringify(products));
  }, [products]);

  const handleSaveProduct = (product: Product) => {
    if (editingProduct) {
      // Update existing
      setProducts(prev => prev.map(p => p.id === product.id ? product : p));
      setEditingProduct(null);
    } else {
      // Add new
      setProducts(prev => [product, ...prev]);
    }
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
      if (editingProduct?.id === id) setEditingProduct(null);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Top Header */}
      <header className="bg-white h-16 border-b border-slate-200 sticky top-0 z-50 shadow-sm px-4 md:px-8 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Package size={24} className="text-white" />
          </div>
          <div className="hidden md:block">
            <h1 className="font-bold text-lg text-slate-800 leading-none">Precifica<span className="text-blue-600">Smart</span></h1>
          </div>
        </div>

        {/* Center: Title */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <h2 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight">Sistema de Precificação</h2>
        </div>

        {/* Right: Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors relative"
          >
            <Bell size={22} />
            <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border border-slate-100 p-4 animate-in fade-in slide-in-from-top-2 z-50">
              <h3 className="font-bold text-slate-700 mb-2 text-sm">Notificações</h3>
              <div className="space-y-2">
                <div className="p-3 bg-blue-50 rounded-lg text-xs text-slate-600 border border-blue-100">
                  <span className="font-bold text-blue-700 block mb-1">Bem-vindo!</span>
                  Sistema atualizado com novos campos de insumos e logística.
                </div>
                <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-500 border border-slate-100">
                  <span className="font-bold text-slate-700 block mb-1">Dica de Margem</span>
                  Revise o markup dos produtos com margem abaixo de 20%.
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content - Widened for Full Screen */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 w-full max-w-[1920px] mx-auto space-y-8">
        
        <DashboardStats products={products} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-10">
          {/* Form Section */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
              <ProductForm 
                onSave={handleSaveProduct} 
                initialData={editingProduct}
                onCancel={handleCancelEdit}
              />
              
              {!editingProduct && (
                <div className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
                  <div className="absolute -right-8 -top-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
                  <div className="flex items-center gap-2 mb-2 relative z-10">
                    <Sparkles className="text-yellow-300" size={18} />
                    <h3 className="font-bold text-lg">Gemini AI Integrado</h3>
                  </div>
                  <p className="text-indigo-100 text-sm relative z-10 leading-relaxed">
                    Utilize nossa inteligência artificial para gerar copys de venda e analisar a saúde financeira dos seus preços automaticamente na lista ao lado.
                  </p>
                </div>
              )}
          </div>

          {/* List Section */}
          <div className="lg:col-span-7 xl:col-span-8">
              <ProductList 
                products={products} 
                onDelete={handleDeleteProduct}
                onEdit={handleEditProduct}
              />
          </div>
        </div>

      </main>
    </div>
  );
};

export default App;