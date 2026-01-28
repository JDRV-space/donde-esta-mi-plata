import { createClient } from '@supabase/supabase-js';
import { CitizenReport } from '../types';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

export interface BudgetRow {
  id: number;
  year: number;
  district: string;
  category: string;
  project: string | null;
  allocated: number;
  spent: number;
  execution_pct: number | null;
}

// Fetch aggregated district data with pagination (handles >1000 records)
export async function fetchDistrictAggregates(): Promise<{
  district: string;
  total_allocated: number;
  total_spent: number;
  execution_pct: number;
  categories: Record<string, { allocated: number; spent: number; pct: number }>;
}[]> {
  // Paginated fetch - Supabase limits to 1000 rows per request
  let allData: { district: string; category: string; allocated: number; spent: number }[] = [];
  let from = 0;
  const pageSize = 1000;

  try {
    while (true) {
      const { data: pageData, error: pageError } = await supabase
        .from('budget_lima')
        .select('district, category, allocated, spent')
        .eq('year', 2025)
        .range(from, from + pageSize - 1);

      if (pageError) {
        break;
      }
      
      if (!pageData || pageData.length === 0) break;

      allData = allData.concat(pageData);
      
      // If we got fewer rows than pageSize, we are done
      if (pageData.length < pageSize) break;
      
      from += pageSize;
    }
  } catch {
    return [];
  }

  if (allData.length === 0) {
    return []; // Trigger fallback
  }

  // Aggregate by district
  const districtMap = new Map<string, {
    total_allocated: number;
    total_spent: number;
    categories: Record<string, { allocated: number; spent: number; pct: number }>;
  }>();

  for (const row of allData) {
    if (!districtMap.has(row.district)) {
      districtMap.set(row.district, {
        total_allocated: 0,
        total_spent: 0,
        categories: {}
      });
    }

    const d = districtMap.get(row.district)!;
    d.total_allocated += Number(row.allocated) || 0;
    d.total_spent += Number(row.spent) || 0;

    if (!d.categories[row.category]) {
      d.categories[row.category] = { allocated: 0, spent: 0, pct: 0 };
    }
    d.categories[row.category].allocated += Number(row.allocated) || 0;
    d.categories[row.category].spent += Number(row.spent) || 0;
  }

  // Calculate percentages
  return Array.from(districtMap.entries()).map(([district, data]) => {
    const execution_pct = data.total_allocated > 0
      ? (data.total_spent / data.total_allocated) * 100
      : 0;

    for (const cat of Object.values(data.categories)) {
      cat.pct = cat.allocated > 0 ? (cat.spent / cat.allocated) * 100 : 0;
    }

    return {
      district,
      total_allocated: data.total_allocated,
      total_spent: data.total_spent,
      execution_pct,
      categories: data.categories
    };
  });
}

// Fetch projects for a specific district and category
export async function fetchProjects(district: string, category?: string): Promise<BudgetRow[]> {
  try {
    let query = supabase
      .from('budget_lima')
      .select('*')
      .eq('district', district)
      .eq('year', 2025)
      .order('allocated', { ascending: false })
      .limit(50);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      return [];
    }

    return data || [];
  } catch {
    return [];
  }
}

/**
 * REPORT HANDLING
 * Note: Since we are using mock data for the hackathon/demo without a writable backend table for reports,
 * these functions act as placeholders for where real DB logic would reside.
 */

export async function fetchCitizenReports(district?: string): Promise<CitizenReport[]> {
  return []; 
}

export async function uploadReportToSupabase(report: CitizenReport): Promise<boolean> {
  return true;
}