import React from 'react';
import { Product } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Package, DollarSign } from 'lucide-react';

interface DashboardStatsProps {
  products: Product[];
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ products }) => {
  const totalInventoryValue = products.reduce((acc, p) => acc + (p.totalUnitCost * p.quantity), 0);
  const potentialRevenue = products.reduce((acc, p) => acc + (p.sellingPrice * p.quantity), 0);
  const potentialProfit = potentialRevenue - totalInventoryValue;

  const chartData = products.map(p => ({
    name: p.sku,
    Custo: p.totalUnitCost,
    Lucro: p.marginAmount,
  })).slice(0, 10); // Show top 10 for chart clarity

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Stat Cards */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
          <Package size={24} />
        </div>
        <div>
          <p className="text-sm text-slate-500 font-medium">Investimento em Estoque</p>
          <h3 className="text-2xl font-bold text-slate-800">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalInventoryValue)}
          </h3>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
          <DollarSign size={24} />
        </div>
        <div>
          <p className="text-sm text-slate-500 font-medium">Receita Potencial</p>
          <h3 className="text-2xl font-bold text-slate-800">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(potentialRevenue)}
          </h3>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
        <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
          <TrendingUp size={24} />
        </div>
        <div>
          <p className="text-sm text-slate-500 font-medium">Lucro Projetado</p>
          <h3 className="text-2xl font-bold text-slate-800">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(potentialProfit)}
          </h3>
        </div>
      </div>

      {/* Mini Chart */}
      {products.length > 0 && (
        <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h4 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wider">Composição de Preço (Top 10 Produtos)</h4>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" tick={{fontSize: 12}} interval={0} />
                <YAxis tick={{fontSize: 12}} tickFormatter={(val) => `R$${val}`} />
                <Tooltip 
                  formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="Custo" stackId="a" fill="#94a3b8" />
                <Bar dataKey="Lucro" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};