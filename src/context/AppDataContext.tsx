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
  addSale: (sale: Omit<Sale, 'id' | 'date'>, isVendor?: boolean) => Promise<void>;
  updateProductStock: (productId: string, quantity: number, isVendor?: boolean) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id' | 'date'>) => Promise<void>;
  addRawMaterial: (rm: Omit<RawMaterial, 'id'>) => Promise<void>;
  updateRawMaterial: (id: string, rm: Partial<RawMaterial>) => Promise<void>;
  deleteRawMaterial: (id: string) => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
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

        if (rmData) {
          setRawMaterials(rmData.map(rm => ({
            id: rm.id,
            name: rm.name,
            unit: rm.unit,
            stock: rm.stock,
            minStockAlert: rm.minstockalert ?? rm.minStockAlert ?? 0,
            unitCost: rm.unitcost ?? rm.unitCost ?? 0
          })));
        }
        if (prodData) {
          setProducts(prodData.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category,
            price: p.price ?? 0,
            estimatedCost: p.estimatedcost ?? p.estimatedCost ?? 0,
            stock: p.stock ?? 0,
            status: p.status,
            assignedVendor: p.assignedvendor ?? p.assignedVendor,
            vendorStock: p.vendorstock ?? p.vendorStock ?? 0,
            image: p.image
          })));
        }
        if (expData) setExpenses(expData);
        
        if (salesData && saleItemsData) {
          // Map items to sales
          const mappedSales = salesData.map(sale => ({
            id: sale.id,
            date: sale.date,
            total: sale.total,
            totalCost: sale.totalcost ?? sale.totalCost ?? 0,
            paymentMethod: sale.paymentmethod ?? sale.paymentMethod,
            customerType: sale.customertype ?? sale.customerType,
            items: saleItemsData
              .filter(item => item.sale_id === sale.id)
              .map(item => ({
                productId: item.product_id,
                quantity: item.quantity,
                unitPrice: item.unit_price ?? 0,
                subtotal: item.subtotal ?? 0
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
  
  const updateProductStock = async (productId: string, quantitySold: number, isVendor: boolean = false) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    let updates: any = {};
    if (isVendor) {
      const newVendorStock = Math.max(0, (product.vendorStock || 0) - quantitySold);
      updates = { vendorstock: newVendorStock };
    } else {
      const newStock = Math.max(0, product.stock - quantitySold);
      const status = newStock === 0 ? 'Agotado' : 'Disponible';
      updates = { stock: newStock, status };
    }

    if (hasSupabaseConfig) {
      await supabase.from('products').update(updates).eq('id', productId);
    }

    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      if (isVendor) {
        return { ...p, vendorStock: Math.max(0, (p.vendorStock || 0) - quantitySold) };
      } else {
        const newStock = Math.max(0, p.stock - quantitySold);
        return { ...p, stock: newStock, status: newStock === 0 ? 'Agotado' : 'Disponible' };
      }
    }));
  };

  const addSale = async (saleData: Omit<Sale, 'id' | 'date'>, isVendor: boolean = false) => {
    const date = new Date().toISOString();
    let newSaleId = `s_${Date.now()}`;

    if (hasSupabaseConfig) {
      // Insert sale
      const { data: saleRes, error: saleErr } = await supabase
        .from('sales')
        .insert({ 
          total: saleData.total, 
          totalcost: saleData.totalCost, 
          paymentmethod: saleData.paymentMethod, 
          customertype: saleData.customerType 
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
    
      await updateProductStock(item.productId, item.quantity, isVendor);
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

  const addRawMaterial = async (rmData: Omit<RawMaterial, 'id'>) => {
    let newId = `rm_${Date.now()}`;
    if (hasSupabaseConfig) {
      const { data, error } = await supabase.from('raw_materials').insert({
        name: rmData.name,
        unit: rmData.unit,
        stock: rmData.stock,
        minstockalert: rmData.minStockAlert,
        unitcost: rmData.unitCost
      }).select().single();
      if (!error && data) newId = data.id;
    }
    const newRm: RawMaterial = { ...rmData, id: newId };
    setRawMaterials(prev => [newRm, ...prev]);
  };

  const updateRawMaterial = async (id: string, updates: Partial<RawMaterial>) => {
    if (hasSupabaseConfig) {
      const mappedUpdates: any = { ...updates };
      if (updates.minStockAlert !== undefined) mappedUpdates.minstockalert = updates.minStockAlert;
      if (updates.unitCost !== undefined) mappedUpdates.unitcost = updates.unitCost;
      
      delete mappedUpdates.minStockAlert;
      delete mappedUpdates.unitCost;

      await supabase.from('raw_materials').update(mappedUpdates).eq('id', id);
    }
    setRawMaterials(prev => prev.map(rm => rm.id === id ? { ...rm, ...updates } : rm));
  };

  const deleteRawMaterial = async (id: string) => {
    if (hasSupabaseConfig) {
      await supabase.from('raw_materials').delete().eq('id', id);
    }
    setRawMaterials(prev => prev.filter(rm => rm.id !== id));
  };

  const addProduct = async (prodData: Omit<Product, 'id'>) => {
    let newId = `p_${Date.now()}`;
    if (hasSupabaseConfig) {
      const { data, error } = await supabase.from('products').insert({
        name: prodData.name,
        category: prodData.category,
        price: prodData.price,
        estimatedcost: prodData.estimatedCost,
        stock: prodData.stock,
        status: prodData.status,
        assignedvendor: prodData.assignedVendor,
        vendorstock: prodData.vendorStock,
        image: prodData.image
      }).select().single();
      if (!error && data) newId = data.id;
    }
    const newProd: Product = { ...prodData, id: newId };
    setProducts(prev => [newProd, ...prev]);
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    if (hasSupabaseConfig) {
      const mappedUpdates: any = { ...updates };
      if (updates.estimatedCost !== undefined) mappedUpdates.estimatedcost = updates.estimatedCost;
      if (updates.assignedVendor !== undefined) mappedUpdates.assignedvendor = updates.assignedVendor;
      if (updates.vendorStock !== undefined) mappedUpdates.vendorstock = updates.vendorStock;
      
      delete mappedUpdates.estimatedCost;
      delete mappedUpdates.assignedVendor;
      delete mappedUpdates.vendorStock;

      await supabase.from('products').update(mappedUpdates).eq('id', id);
    }
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProduct = async (id: string) => {
    if (hasSupabaseConfig) {
      await supabase.from('products').delete().eq('id', id);
    }
    setProducts(prev => prev.filter(p => p.id !== id));
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
      addExpense,
      addRawMaterial,
      updateRawMaterial,
      deleteRawMaterial,
      addProduct,
      updateProduct,
      deleteProduct
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
