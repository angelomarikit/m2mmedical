/**
 * Single source of truth: local folder paths → catalog categories & products.
 * Paths are relative to the M2M project root (original asset folders preserved).
 */

export const collectionsTree = [
  {
    slug: 'medical-accessories',
    name: 'Medical Accessories',
    description: 'Disposable and reusable medical accessories for hospitals and clinics.',
    children: [
      { slug: 'disposable-accessories', name: 'Disposable Accessories' },
      { slug: 'reusable-accessories', name: 'Reusable Accessories' },
      { slug: 'spo2-sensors', name: 'SpO2 Sensors' },
      { slug: 'ecg-cables-leadwires', name: 'ECG Cables & Leadwires' },
    ],
  },
  {
    slug: 'patient-monitoring-cardiology',
    name: 'Patient Monitoring & Cardiology',
    description: 'Patient monitors, ECG, defibrillators, and bedside monitoring.',
  },
  { slug: 'infant-care', name: 'Infant Care', description: 'Infant incubators and phototherapy systems.' },
  { slug: 'anesthesia', name: 'Anesthesia', description: 'Anesthesia machines and related equipment.' },
  {
    slug: 'ultrasound-fetal-monitoring',
    name: 'Ultrasound & Fetal Monitoring',
    description: 'Ultrasound systems and fetal monitoring equipment.',
  },
  {
    slug: 'radiology-imaging',
    name: 'Radiology & Imaging',
    description: 'Digital radiography, mammography, MRI, angiography, and imaging accessories.',
  },
] as const

export const brandDefs = [
  { slug: 'nihon-kohden', name: 'Nihon Kohden', logo_path: 'patient monitoring  ecg  defibrillators/06_nihon_kohden_logo_hd_transparent.png' },
  { slug: 'medtronic', name: 'Medtronic', logo_path: 'patient monitoring  ecg  defibrillators/04_medtronic_logo_hd_transparent.png' },
  { slug: 'nellcor', name: 'Nellcor', logo_path: null },
  { slug: 'neusoft', name: 'Neusoft', logo_path: 'radiology  imaging systems/03_brand_logos/original_transparent/neusoft_logo.png' },
  { slug: 'fujifilm', name: 'Fujifilm', logo_path: 'infant care  anesthesia  ultrasound/original_transparent/05_brand_logos/fujifilm_logo.png' },
  { slug: 'edan', name: 'Edan', logo_path: 'infant care  anesthesia  ultrasound/original_transparent/05_brand_logos/edan_logo.png' },
  { slug: 'comen', name: 'Comen', logo_path: 'infant care  anesthesia  ultrasound/original_transparent/05_brand_logos/comen_logo.png' },
] as const

export type CatalogProduct = {
  slug: string
  name: string
  model_number?: string
  brand?: string
  collections: string[]
  product_type?: 'disposable' | 'reusable' | 'equipment'
  status: 'draft' | 'published'
  is_featured?: boolean
  short_description?: string
  image_path: string
}

const accessoryReviewNote =
  'Catalog image from M2M assets — confirm exact product name and specifications with our team before ordering.'

const equipmentProducts: CatalogProduct[] = [
  {
    slug: 'cardiofax-m-ecg-3350',
    name: 'Cardiofax M (ECG-3350) Electrocardiogram Machine',
    model_number: 'ECG-3350',
    brand: 'nihon-kohden',
    collections: ['patient-monitoring-cardiology'],
    product_type: 'equipment',
    status: 'published',
    is_featured: true,
    image_path: 'Patient Monitoring  ECG  Defibrillators/01_cardiofax_m_ecg_3350_hd_transparent.png',
  },
  {
    slug: 'cardiolife-tec-5631',
    name: 'TEC-5631 Cardiolife Defibrillator',
    model_number: 'TEC-5631',
    brand: 'nihon-kohden',
    collections: ['patient-monitoring-cardiology'],
    product_type: 'equipment',
    status: 'published',
    is_featured: true,
    image_path: 'Patient Monitoring  ECG  Defibrillators/02_cardiolife_tec_5631_defibrillator_hd_transparent.png',
  },
  {
    slug: 'life-scope-g5',
    name: 'Life Scope G5 Cardiac Monitor',
    model_number: 'Life Scope G5',
    brand: 'nihon-kohden',
    collections: ['patient-monitoring-cardiology'],
    product_type: 'equipment',
    status: 'published',
    is_featured: true,
    image_path: 'Patient Monitoring  ECG  Defibrillators/03_life_scope_g5_cardiac_monitor_hd_transparent.png',
  },
  {
    slug: 'nellcor-bedside-spo2',
    name: 'Nellcor Bedside SpO2 Patient Monitor',
    brand: 'nellcor',
    collections: ['patient-monitoring-cardiology', 'spo2-sensors'],
    product_type: 'equipment',
    status: 'published',
    image_path: 'Patient Monitoring  ECG  Defibrillators/05_nellcor_bedside_spo2_monitor_hd_transparent.png',
  },
  {
    slug: 'b10-hybrid-infant-incubator',
    name: 'B10 Hybrid Infant Incubator',
    model_number: 'B10',
    collections: ['infant-care'],
    product_type: 'equipment',
    status: 'published',
    is_featured: true,
    image_path: 'Infant Care  Anesthesia  Ultrasound/Original_Transparent/01_Infant_Care/b10_hybrid_infant_incubator.png',
  },
  {
    slug: 'bl70-infant-phototherapy',
    name: 'BL70 Infant Phototherapy',
    model_number: 'BL70',
    collections: ['infant-care'],
    product_type: 'equipment',
    status: 'published',
    image_path: 'Infant Care  Anesthesia  Ultrasound/Original_Transparent/01_Infant_Care/bl70_infant_phototherapy.png',
  },
  {
    slug: 'ax-800-anesthesia',
    name: 'AX-800 Anesthesia Machine',
    model_number: 'AX-800',
    collections: ['anesthesia'],
    product_type: 'equipment',
    status: 'published',
    is_featured: true,
    image_path: 'Infant Care  Anesthesia  Ultrasound/Original_Transparent/02_Anesthesia/ax_800_anesthesia_machine.png',
  },
  {
    slug: 'edan-f12-fetal-monitor',
    name: 'Edan F12 Fetal Monitor',
    brand: 'edan',
    collections: ['ultrasound-fetal-monitoring'],
    product_type: 'equipment',
    status: 'published',
    image_path: 'Infant Care  Anesthesia  Ultrasound/Original_Transparent/03_Fetal_Monitoring/edan_f12_fetal_monitor.png',
  },
  {
    slug: 'acclarix-ax9-ultrasound',
    name: 'Acclarix AX9 Ultrasound',
    model_number: 'AX9',
    collections: ['ultrasound-fetal-monitoring'],
    product_type: 'equipment',
    status: 'published',
    image_path: 'Infant Care  Anesthesia  Ultrasound/Original_Transparent/04_Ultrasound/acclarix_ax9_ultrasound.png',
  },
  {
    slug: 'edan-nano-c5',
    name: 'Edan Nano C5 Ultrasound',
    brand: 'edan',
    collections: ['ultrasound-fetal-monitoring'],
    product_type: 'equipment',
    status: 'published',
    image_path: 'Infant Care  Anesthesia  Ultrasound/Original_Transparent/04_Ultrasound/edan_nano_c5_ultrasound.png',
  },
  {
    slug: 'edan-nano-l12',
    name: 'Edan Nano L12 Ultrasound',
    brand: 'edan',
    collections: ['ultrasound-fetal-monitoring'],
    product_type: 'equipment',
    status: 'published',
    image_path: 'Infant Care  Anesthesia  Ultrasound/Original_Transparent/04_Ultrasound/edan_nano_l12_ultrasound.png',
  },
  {
    slug: 'neucare-mammo-dr-hd',
    name: 'NeuCare Mammo DR HD Digital Mammography System',
    brand: 'neusoft',
    collections: ['radiology-imaging'],
    product_type: 'equipment',
    status: 'published',
    is_featured: true,
    image_path: 'Radiology  Imaging Systems/02_Neusoft_Equipment/Original_Transparent/neucare_mammo_dr_hd.png',
  },
  {
    slug: 'neumr-rena-mri',
    name: 'NeuMR RENA 1.5T MRI',
    brand: 'neusoft',
    collections: ['radiology-imaging'],
    product_type: 'equipment',
    status: 'published',
    image_path: 'Radiology  Imaging Systems/02_Neusoft_Equipment/Original_Transparent/neumr_rena_mri.png',
  },
  {
    slug: 'neuangio-33c',
    name: 'NeuAngio 33C',
    brand: 'neusoft',
    collections: ['radiology-imaging'],
    product_type: 'equipment',
    status: 'published',
    image_path: 'Radiology  Imaging Systems/02_Neusoft_Equipment/Original_Transparent/neuangio_33c.png',
  },
  {
    slug: 'fujifilm-fdr-xair',
    name: 'Fujifilm FDR Xair',
    brand: 'fujifilm',
    collections: ['radiology-imaging'],
    product_type: 'equipment',
    status: 'published',
    image_path: 'Radiology  Imaging Systems/01_Fujifilm_Equipment/Original_Transparent/fujifilm_fdr_xair.png',
  },
  {
    slug: 'fujifilm-fdr-devo-ii',
    name: 'Fujifilm FDR D-EVO II',
    brand: 'fujifilm',
    collections: ['radiology-imaging'],
    product_type: 'equipment',
    status: 'published',
    image_path: 'Radiology  Imaging Systems/01_Fujifilm_Equipment/Original_Transparent/fujifilm_fdr_devo_ii.png',
  },
  {
    slug: 'fujifilm-drypix-lite',
    name: 'Fujifilm DRYPIX Lite',
    brand: 'fujifilm',
    collections: ['radiology-imaging'],
    product_type: 'equipment',
    status: 'published',
    image_path: 'Radiology  Imaging Systems/01_Fujifilm_Equipment/Original_Transparent/fujifilm_drypix_lite.png',
  },
  {
    slug: 'fujifilm-drypix-smart',
    name: 'Fujifilm DRYPIX Smart',
    brand: 'fujifilm',
    collections: ['radiology-imaging'],
    product_type: 'equipment',
    status: 'published',
    image_path: 'Radiology  Imaging Systems/01_Fujifilm_Equipment/Original_Transparent/fujifilm_drypix_smart.png',
  },
  {
    slug: 'fujifilm-drypix-imaging-system',
    name: 'Fujifilm DRYPIX Imaging System',
    brand: 'fujifilm',
    collections: ['radiology-imaging'],
    product_type: 'equipment',
    status: 'published',
    short_description: 'DRYPIX medical imaging printer line — confirm exact model with M2M.',
    image_path: 'Radiology  Imaging Systems/01_Fujifilm_Equipment/Original_Transparent/fujifilm_drypix_product.png',
  },
]

const accessoryProducts: CatalogProduct[] = Array.from({ length: 19 }, (_, i) => {
  const n = i + 1
  const nn = String(n).padStart(2, '0')
  const disposable = n <= 10
  return {
    slug: `medical-accessory-${nn}`,
    name: `Medical Accessory ${nn}`,
    collections: disposable
      ? ['medical-accessories', 'disposable-accessories']
      : ['medical-accessories', 'reusable-accessories'],
    product_type: disposable ? 'disposable' : 'reusable',
    status: 'published',
    short_description: accessoryReviewNote,
    image_path: `Medical Accessories/medical_accessory_${nn}_hd_transparent.png`,
  }
})

export const catalogProducts: CatalogProduct[] = [...equipmentProducts, ...accessoryProducts]

export const partnerDefs = [
  { file: 'Business Partner Logos/01_szcaremed_hd_transparent.png', name: 'SZ Caremed' },
  { file: 'Business Partner Logos/02_upnmed_hd_transparent.png', name: 'UPNMed' },
  { file: 'Business Partner Logos/03_edan_hd_transparent.png', name: 'Edan' },
  { file: 'Business Partner Logos/04_heningtech_hd_transparent.png', name: 'Heningtech' },
  { file: 'Business Partner Logos/05_comen_hd_transparent.png', name: 'Comen' },
  { file: 'Business Partner Logos/06_sich_tech_hd_transparent.png', name: 'Sich Tech' },
  { file: 'Business Partner Logos/07_keling_hd_transparent.png', name: 'Keling' },
  { file: 'Business Partner Logos/08_lenko_hd_transparent.png', name: 'Lenko' },
  { file: 'Business Partner Logos/09_amoul_hd_transparent.png', name: 'Amoul' },
] as const

function clientDisplayName(filename: string): string {
  return filename
    .replace(/\.png$/i, '')
    .replace(/^\d+_/, '')
    .replace(/_/g, ' ')
}

export const clientDefs = [
  'Client Logos/Original_Quality_Transparent/01_The_Medical_City.png',
  'Client Logos/Original_Quality_Transparent/02_Cardinal_Santos_Medical_Center.png',
  'Client Logos/Original_Quality_Transparent/03_St_Lukes_Medical_Center.png',
  'Client Logos/Original_Quality_Transparent/04_Philippine_Heart_Center.png',
  'Client Logos/Original_Quality_Transparent/05_University_of_Santo_Tomas_Hospital.png',
  'Client Logos/Original_Quality_Transparent/06_Makati_Medical_Center.png',
  'Client Logos/Original_Quality_Transparent/07_Asian_Hospital_Medical_Center.png',
  'Client Logos/Original_Quality_Transparent/08_National_Kidney_Transplant_Institute.png',
  'Client Logos/Original_Quality_Transparent/09_Manila_Doctors_Hospital.png',
  'Client Logos/Original_Quality_Transparent/10_ManilaMed.png',
  'Client Logos/Original_Quality_Transparent/11_Metropolitan_Medical_Center.png',
  'Client Logos/Original_Quality_Transparent/12_Lung_Center_of_the_Philippines.png',
  'Client Logos/Original_Quality_Transparent/13_East_Avenue_Medical_Center.png',
  'Client Logos/Original_Quality_Transparent/14_Hospital_Logo_14_Review_Name.png',
  'Client Logos/Original_Quality_Transparent/15_UERMMMC.png',
  'Client Logos/Original_Quality_Transparent/16_Dr_Nicanor_Reyes_Medical_Foundation.png',
  'Client Logos/Original_Quality_Transparent/17_Ilocos_Sur_Provincial_Hospital_Gabriela_Silang.png',
  'Client Logos/Original_Quality_Transparent/18_Ilocos_Sur_District_Hospital_Narvacan.png',
  'Client Logos/Original_Quality_Transparent/19_Ilocos_Sur_District_Hospital_Sinait.png',
  'Client Logos/Original_Quality_Transparent/20_Marikina_Valley_Medical_Center.png',
].map((file, index) => ({
  file,
  name: clientDisplayName(file.split('/').pop()!),
  sort_order: index,
  is_published: !file.includes('14_Hospital_Logo_14'),
}))

/** All filesystem paths that should be copied / uploaded for the live catalog */
export function collectAssetPaths(): { path: string; bucket: string }[] {
  const items: { path: string; bucket: string }[] = [
    { path: 'our logo.png', bucket: 'website-assets' },
  ]

  for (const p of catalogProducts) {
    items.push({ path: p.image_path, bucket: 'product-images' })
  }
  for (const b of brandDefs) {
    if (b.logo_path) items.push({ path: b.logo_path, bucket: 'brand-logos' })
  }
  for (const p of partnerDefs) {
    items.push({ path: p.file, bucket: 'partner-client-logos' })
  }
  for (const c of clientDefs) {
    items.push({ path: c.file, bucket: 'partner-client-logos' })
  }

  const seen = new Set<string>()
  return items.filter((i) => {
    const key = `${i.bucket}:${i.path}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
