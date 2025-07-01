// Common types for vpmed website

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  category: 'repair' | 'maintenance' | 'inspection';
  equipmentTypes: string[];
}

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  category: 'before-after' | 'equipment' | 'work-process' | 'certifications';
  alt_text?: string;
  location?: string;
  service_date?: string;
  equipment_type?: string;
  testimonial?: string;
  rating: number;
  is_featured?: boolean;
  created_at?: string;
  updated_at?: string;
  gallery_images?: GalleryImage[];
}

export interface GalleryImage {
  id: string;
  gallery_item_id: string;
  image_url: string;
  image_type: 'main' | 'before' | 'after' | 'additional';
  caption?: string;
  sort_order: number;
  created_at?: string;
}

export interface ShopProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  category: 'hospital-beds' | 'wheelchairs' | 'parts' | 'accessories' | 'mobility' | 'monitoring';
  brand?: string;
  model?: string;
  condition: 'new' | 'refurbished' | 'used-excellent' | 'used-good';
  images?: string[]; // For backward compatibility
  in_stock: boolean;
  stock_quantity?: number;
  specifications?: {
    [key: string]: string;
  };
  features?: string[];
  warranty?: string;
  tags?: string[];
  is_featured?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ShopProductImage {
  id: string;
  product_id: string;
  image_url: string;
  image_type: 'main' | 'gallery' | 'thumbnail';
  alt_text?: string;
  sort_order: number;
  created_at: string;
}

export interface ContactForm {
  name: string;
  email: string;
  phone: string;
  company: string;
  equipmentType: string;
  message: string;
  urgency: 'low' | 'medium' | 'high';
}

export interface NavigationItem {
  label: string;
  path: string;
  external?: boolean;
}

export interface PartUsed {
  id?: string;
  service_id?: string;
  name: string;
  quantity: number;
  cost: number;
  created_at?: string;
}

export interface CompletedService {
  id: string;
  title: string;
  description: string;
  equipment_type: string;
  client_name: string;
  location: string;
  service_date: string;
  completion_date: string;
  duration: number; // in hours
  service_fee: number;
  labor_cost: number;
  total_cost: number;
  status: 'completed' | 'pending' | 'cancelled';
  payment_status: 'paid' | 'pending' | 'overdue';
  technician: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  parts_used?: PartUsed[];
} 