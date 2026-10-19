export const COMPANY = {
  name: 'M2M Medical Trading Inc.',
  tagline: 'Your Healthcare Partner',
  phone: '+632-8639-5622',
  phoneTel: '+63286395622',
  email: 'customercare@m2mmedical.com',
  website: 'https://www.m2mmedical.com',
  biomedUrl: 'https://www.m2mmedical.com/biomed',
  addressLines: [
    '2nd Floor Vista Square Commercial Bldg.,',
    'Main Gate, Vista Verde Executive Village,',
    'Cainta, Rizal, Philippines',
  ],
  founded: 2009,
  incorporated: 2016,
} as const

export const INQUIRY_STATUSES = [
  'new',
  'reviewing',
  'contacted',
  'quotation_sent',
  'won',
  'lost',
  'closed',
] as const

export type InquiryStatus = (typeof INQUIRY_STATUSES)[number]
