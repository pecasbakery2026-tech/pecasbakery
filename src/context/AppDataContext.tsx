import { createContext, useContext, useState, useEffect } from 'react';
import type { RawMaterial, Product, Sale, Expense } from '../types';
import { mockRawMaterials, mockProducts, mockSales, mockExpenses } from '../data/mockData';
import { supabase, hasSupabaseConfig } from '../lib/supabase';

interface AppDataContextType {
  rawMaterials: RawMaterial[];
  products: Product[];
  sales: Sale[];
  expenses: Expense[];
  loading: boolean;
  addSale: (sale: Omit<Sale, 'id' | 'date'>) => Promise<void>;
  updateProductStock: (productId: string, quantity: number) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id' | 'date'>) => Promise<void>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider = ({ children }: { children: React.ReactNode }) => {
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>(hasSupabaseConfig ? [] : mockRawMaterials);
  const [products, setProducts] = useState<Product[]>(hasSupabaseConfig ? [] : mockProducts);
  const [sales, setSales] = useState<Sale[]>(hasSupabaseConfig ? [] : mockSales);
  const [expenses, setExpenses] = useState<Expense[]>(hasSupabaseConfig ? [] : mockExpenses);
  const [loading, setLoading] = useState(hasSupabaseConfig);

  useEffect(() => {
    if (!hasSupabaseConfig) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          { data: rmData },
          { data: prodData },
          { data: expData },
          { data: salesData },
          { data: saleItemsData }
        ] = await Promise.all([
          supabase.from('raw_materials').select('*'),
          supabase.from('products').select('*'),
          supabase.from('expenses').select('*'),
          supabase.from('sales').select('*'),
          supabase.from('sale_items').select('*')
        ]);

        if (rmData) setRawMaterials(rmData);
        if (prodData) setProducts(prodData);
        if (expData) setExpenses(expData);
        
        if (salesData && saleItemsData) {
          // Map items to sales
          const mappedSales = salesData.map(sale => ({
            ...sale,
            items: saleItemsData
              .filter(item => item.sale_id === sale.id)
              .map(item => ({
                productId: item.product_id,
                quantity: item.quantity,
                unitPrice: item.unit_price,
                subtotal: item.subtotal
              }))
          }));
          setSales(mappedSales);
        }
      } catch (error) {
        console.error('Error fetching data from Supabase:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  const updateProductStock = async (productId: string, quantitySold: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const newStock = Math.max(0, product.stock - quantitySold);
    const status = newStock === 0 ? 'Agotado' : 'Disponible';

    if (hasSupabaseConfig) {
      await supabase.from('products').update({ stock: newStock, status }).eq('id', productId);
    }

    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock, status } : p));
  };

  const addSale = async (saleData: Omit<Sale, 'id' | 'date'>) => {
    const date = new Date().toISOString();
    let newSaleId = `s_${Date.now()}`;

    if (hasSupabaseConfig) {
      // Insert sale
      const { data: saleRes, error: saleErr } = await supabase
        .from('sales')
        .insert({ 
          total: saleData.total, 
          totalCost: saleData.totalCost, 
          paymentMethod: saleData.paymentMethod, 
          customerType: saleData.customerType 
        })
        .select()
        .single();
        
      if (!saleErr && saleRes) {
        newSaleId = saleRes.id;
        
        // Insert items
        const itemsToInsert = saleData.items.map(item => ({
          sale_id: newSaleId,
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          subtotal: item.subtotal
        }));
        
        await supabase.from('sale_items').insert(itemsToInsert);
      }
    }

    const newSale: Sale = { ...saleData, id: newSaleId, date };
    setSales(prev => [newSale, ...prev]);
    
    // Deduct inventory
    for (const item of saleData.items) {
      await updateProductStock(item.productId, item.quantity);
    }
  };

  const addExpense = async (expenseData: Omit<Expense, 'id' | 'date'>) => {
    const date = new Date().toISOString();
    let newExpenseId = `e_${Date.now()}`;

    if (hasSupabaseConfig) {
      const { data, error } = await supabase
        .from('expenses')
        .insert({ 
          description: expenseData.description, 
          amount: expenseData.amount, 
          category: expenseData.category 
        })
        .select()
        .single();
        
      if (!error && data) {
        newExpenseId = data.id;
      }
    }

    const newExpense: Expense = { ...expenseData, id: newExpenseId, date };
    setExpenses(prev => [newExpense, ...prev]);
  };

  return (
    <AppDataContext.Provider value={{
      rawMaterials,
      products,
      sales,
      expenses,
      loading,
      addSale,
      updateProductStock,
      addExpense
    }}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};
