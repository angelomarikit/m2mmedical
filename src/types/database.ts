export type UserRole = 'owner' | 'admin' | 'editor' | 'sales'

export type ProductStatus = 'draft' | 'published' | 'archived'

export type ProductType = 'disposable' | 'reusable' | 'equipment' | null

export interface Brand {
  id: string
  name: string
  slug: string
  description: string | null
  logo_path: string | null
  website_url: string | null
  is_active: boolean
  sort_order: number
}

export interface Collection {
  id: string
  parent_id: string | null
  name: string
  slug: string
  description: string | null
  cover_image_path: string | null
  seo_title: string | null
  seo_description: string | null
  sort_order: number
  is_published: boolean
}

export interface Product {
  id: string
  name: string
  slug: string
  sku: string | null
  model_number: string | null
  brand_id: string | null
  short_description: string | null
  description: string | null
  product_type: ProductType
  status: ProductStatus
  is_featured: boolean
  publicly_displayed_price: number | null
  currency: string | null
  seo_title: string | null
  seo_description: string | null
  sort_order: number
  created_at: string
  updated_at: string
  brand?: Brand | null
  collections?: Collection[]
  images?: ProductImage[]
  specifications?: ProductSpecification[]
}

export interface ProductImage {
  id: string
  product_id: string
  storage_path: string
  alt_text: string | null
  sort_order: number
  is_primary: boolean
}

export interface ProductSpecification {
  id: string
  product_id: string
  group_name: string | null
  label: string
  value: string
  sort_order: number
  verification_status: 'verified' | 'draft' | 'unverified'
}

export interface PageSection {
  id: string
  page_id: string
  section_key: string
  section_type: string
  content_json: Record<string, unknown>
  sort_order: number
  is_visible: boolean
}

export interface PartnerClient {
  id: string
  type: 'partner' | 'client'
  name: string
  logo_path: string | null
  website_url: string | null
  sort_order: number
  is_published: boolean
}

export interface InquiryItemInput {
  product_id: string
  product_name_snapshot: string
  model_snapshot: string | null
  quantity: number
}
