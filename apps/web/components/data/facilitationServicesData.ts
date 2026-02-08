// Types for Facilitation Services Data
export interface ProcessStep {
  title: string;
  description: string;
  duration: string;
}

export interface FormField {
  label: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'checkbox' | 'textarea' | 'file' | 'number' | 'date';
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface FormSection {
  title: string;
  fields: FormField[];
}

export interface FAQ {
  question: string;
  answer: string;
}

/**
 * Enhanced document requirement with conditional logic and categorization
 */
export interface DocumentRequirement {
  /** Unique identifier for the document */
  id: string;
  /** Display name of the document */
  name: string;
  /** Detailed description or format requirements */
  description?: string;
  /** Whether document is required for all cases */
  required: boolean;
  /** Category for grouping (e.g., 'personal', 'business', 'property') */
  category: string;
  /** Condition that must be met for this document to be required */
  condition?: {
    /** Field name to check */
    field: string;
    /** Operator for comparison */
    operator: 'equals' | 'notEquals' | 'includes' | 'greaterThan' | 'lessThan';
    /** Value to compare against */
    value: any;
  };
  /** Alternative documents that can be used instead */
  alternatives?: string[];
  /** Number of copies needed */
  copies?: number;
  /** Accepted file formats (for digital submissions) */
  formats?: string[];
  /** Additional notes or requirements */
  notes?: string;
}

/**
 * Document category for organizing requirements
 */
export interface DocumentCategory {
  /** Category identifier */
  id: string;
  /** Display name */
  name: string;
  /** Description of what documents belong here */
  description?: string;
  /** Display order */
  order: number;
}

export interface FacilitationService {
  slug: string;
  title: string;
  tagline: string;
  deliverables: string[];
  processSteps: ProcessStep[];
  requiredDocuments: DocumentRequirement[];
  documentCategories?: DocumentCategory[];
  timeline: string;
  formSections: FormSection[];
  faqs: FAQ[];
}

// Facilitation Services Data
export const facilitationServices: FacilitationService[] = [
  // 1. SECP REGISTRATION
  {
    slug: 'secp-registration',
    title: 'SECP Registration',
    tagline: 'Register your company with Securities and Exchange Commission of Pakistan',
    deliverables: [
      'Certificate of Incorporation',
      'Company Registration Number',
      'Memorandum & Articles of Association',
      'Digital signatures setup',
      'Post-registration compliance guide'
    ],
    processSteps: [
      {
        title: 'Name Reservation',
        description: 'Check name availability and reserve company name with SECP',
        duration: '1-2 days'
      },
      {
        title: 'Documentation',
        description: 'Collect shareholder/director documents, draft MOA and AOA, prepare SECP forms (Form 1, 21, 29)',
        duration: '2-3 days'
      },
      {
        title: 'Submission',
        description: 'Submit to SECP portal, pay government fees, track application',
        duration: '2-4 days'
      },
      {
        title: 'Certificate',
        description: 'Receive incorporation certificate and download company documents',
        duration: '1 day'
      }
    ],
    documentCategories: [
      { id: 'personal', name: 'Personal Documents', description: 'Documents for all directors and shareholders', order: 1 },
      { id: 'business', name: 'Business Documents', description: 'Company and business related documents', order: 2 },
      { id: 'property', name: 'Property Documents', description: 'Registered office related documents', order: 3 }
    ],
    requiredDocuments: [
      // Personal Documents - Required for all directors/shareholders
      {
        id: 'cnic-copies',
        name: 'CNIC Copies',
        description: 'Clear, colored photocopies of Computerized National Identity Cards',
        required: true,
        category: 'personal',
        copies: 2,
        formats: ['PDF', 'JPG', 'PNG'],
        notes: 'Required for all directors and shareholders. Both sides of CNIC must be visible.'
      },
      {
        id: 'passport-photos',
        name: 'Passport-sized Photographs',
        description: 'Recent passport-sized photographs with white background',
        required: true,
        category: 'personal',
        copies: 2,
        formats: ['JPG', 'PNG'],
        notes: 'Required 2 photos per person (directors and shareholders)'
      },
      {
        id: 'proof-of-address',
        name: 'Proof of Address',
        description: 'Recent utility bill or bank statement',
        required: true,
        category: 'personal',
        formats: ['PDF', 'JPG'],
        alternatives: ['Electricity bill', 'Gas bill', 'Water bill', 'Bank statement'],
        notes: 'Must not be older than 3 months'
      },
      {
        id: 'contact-info',
        name: 'Contact Information',
        description: 'Active email addresses and mobile phone numbers',
        required: true,
        category: 'personal',
        notes: 'Required for all directors and shareholders for SECP communication'
      },
      // Property Documents
      {
        id: 'office-address-proof',
        name: 'Registered Office Address Proof',
        description: 'Document proving ownership or authorization to use the premises',
        required: true,
        category: 'property',
        formats: ['PDF'],
        alternatives: ['Property ownership documents', 'Rent/lease agreement', 'Utility bill in owner name'],
        notes: 'Must clearly show the complete address to be registered'
      },
      {
        id: 'noc-building-owner',
        name: 'NOC from Building Owner',
        description: 'No Objection Certificate from property owner',
        required: false,
        category: 'property',
        condition: {
          field: 'Registered Office Address',
          operator: 'notEquals',
          value: 'owned'
        },
        formats: ['PDF'],
        notes: 'Required only if the registered office is in a rented/leased property. Must be notarized.'
      }
    ],
    timeline: '3-7 working days',
    formSections: [
      {
        title: 'Business Details',
        fields: [
          {
            label: 'Preferred Company Name (Option 1)',
            type: 'text',
            required: true,
            placeholder: 'Enter first choice'
          },
          {
            label: 'Preferred Company Name (Option 2)',
            type: 'text',
            required: false,
            placeholder: 'Enter second choice'
          },
          {
            label: 'Preferred Company Name (Option 3)',
            type: 'text',
            required: false,
            placeholder: 'Enter third choice'
          },
          {
            label: 'Business Type',
            type: 'select',
            required: true,
            options: ['Pvt Ltd', 'SMC', 'LLP', 'Partnership']
          },
          {
            label: 'Authorized Capital (PKR)',
            type: 'number',
            required: true,
            placeholder: '100000'
          },
          {
            label: 'Business Activities Description',
            type: 'textarea',
            required: true,
            placeholder: 'Describe your business activities'
          },
          {
            label: 'Registered Office Address',
            type: 'textarea',
            required: true,
            placeholder: 'Complete address with city'
          }
        ]
      },
      {
        title: 'Shareholders/Directors Information',
        fields: [
          {
            label: 'Full Name',
            type: 'text',
            required: true,
            placeholder: 'As per CNIC'
          },
          {
            label: 'CNIC Number',
            type: 'text',
            required: true,
            placeholder: '12345-1234567-1'
          },
          {
            label: "Father's Name",
            type: 'text',
            required: true
          },
          {
            label: 'Email',
            type: 'email',
            required: true
          },
          {
            label: 'Phone Number',
            type: 'tel',
            required: true,
            placeholder: '+92-300-1234567'
          },
          {
            label: 'Address',
            type: 'textarea',
            required: true
          },
          {
            label: 'Role',
            type: 'select',
            required: true,
            options: ['Director', 'Shareholder', 'Both']
          },
          {
            label: 'Shareholding Percentage',
            type: 'number',
            required: true,
            placeholder: '0-100'
          }
        ]
      },
      {
        title: 'Additional Information',
        fields: [
          {
            label: 'Do you have NTN?',
            type: 'select',
            required: true,
            options: ['Yes', 'No']
          },
          {
            label: 'Need Fast-track Service?',
            type: 'select',
            required: true,
            options: ['Yes', 'No']
          },
          {
            label: 'Document Pickup Needed?',
            type: 'select',
            required: true,
            options: ['Yes', 'No']
          }
        ]
      }
    ],
    faqs: [
      {
        question: 'Can I use home address?',
        answer: 'Yes, residential address is acceptable initially.'
      },
      {
        question: 'Minimum capital required?',
        answer: 'You can start as low as PKR 100,000.'
      },
      {
        question: 'Do I need office immediately?',
        answer: 'No, home address works for registration.'
      }
    ]
  },

  // 2. IP REGISTRATION (TRADEMARK)
  {
    slug: 'ip-registration-trademark',
    title: 'IP Registration (Trademark)',
    tagline: 'Protect your brand with trademark registration',
    deliverables: [
      'Trademark registration certificate',
      'Exclusive rights to your mark',
      'Legal protection from copycats',
      'Registration valid for 10 years'
    ],
    processSteps: [
      {
        title: 'Search & Assessment',
        description: 'Conduct trademark search in IPO database, check for similar marks, assess registrability',
        duration: '2-3 days'
      },
      {
        title: 'Application Preparation',
        description: 'Prepare application (TM-1 form), classification of goods/services, logo preparation',
        duration: '3-5 days'
      },
      {
        title: 'Filing',
        description: 'File with IPO Pakistan, pay government fees, receive filing receipt',
        duration: '1 day'
      },
      {
        title: 'Examination',
        description: 'IPO examines application, handle objections if any, respond to queries',
        duration: '3-4 months'
      },
      {
        title: 'Publication',
        description: 'Published in Trade Marks Journal, opposition period (2 months)',
        duration: '1 month'
      },
      {
        title: 'Registration',
        description: 'Issue registration certificate',
        duration: '1-2 months'
      }
    ],
    documentCategories: [
      { id: 'applicant', name: 'Applicant Documents', description: 'Identity and business verification', order: 1 },
      { id: 'trademark', name: 'Trademark Materials', description: 'Logo, design, and trademark specifics', order: 2 },
      { id: 'legal', name: 'Legal Documents', description: 'Authorization and proof documents', order: 3 }
    ],
    requiredDocuments: [
      // Applicant Documents
      {
        id: 'applicant-id',
        name: 'CNIC or Passport Copy',
        description: 'Valid identification document of the applicant',
        required: true,
        category: 'applicant',
        formats: ['PDF', 'JPG', 'PNG'],
        alternatives: ['CNIC (for Pakistani nationals)', 'Passport (for foreign nationals)'],
        notes: 'Must be clear and readable. Both sides required for CNIC.'
      },
      {
        id: 'business-registration',
        name: 'Business Registration Documents',
        description: 'Company incorporation certificate or business registration',
        required: false,
        category: 'applicant',
        condition: {
          field: 'Applicant Type',
          operator: 'equals',
          value: 'Company'
        },
        formats: ['PDF'],
        notes: 'Required only if applying as a company. Individual applicants do not need this.'
      },
      // Trademark Materials
      {
        id: 'logo-wordmark',
        name: 'Logo/Wordmark (High Resolution)',
        description: 'Clear, high-quality image of the trademark',
        required: true,
        category: 'trademark',
        formats: ['JPG', 'PNG', 'AI', 'EPS', 'SVG'],
        notes: 'Minimum 300 DPI resolution. Vector format preferred for logo trademarks.'
      },
      {
        id: 'goods-services-list',
        name: 'List of Goods/Services',
        description: 'Detailed description of goods/services the trademark will cover',
        required: true,
        category: 'trademark',
        formats: ['PDF', 'DOC', 'DOCX'],
        notes: 'Must align with Nice Classification (Classes 1-45). We can help classify.'
      },
      {
        id: 'proof-of-use',
        name: 'Proof of Use',
        description: 'Evidence showing use of the trademark in commerce',
        required: false,
        category: 'trademark',
        formats: ['PDF', 'JPG', 'PNG'],
        alternatives: ['Product photographs', 'Advertisements', 'Invoices', 'Website screenshots'],
        notes: 'Not mandatory but strengthens application. Helpful if trademark is already in use.'
      },
      // Legal Documents
      {
        id: 'power-of-attorney',
        name: 'Power of Attorney',
        description: 'Authorization for AR&CO to represent you before IPO',
        required: true,
        category: 'legal',
        formats: ['PDF'],
        notes: 'We will provide the template. Must be signed and stamped.'
      }
    ],
    timeline: '6-12 months',
    formSections: [
      {
        title: 'Applicant Details',
        fields: [
          {
            label: 'Name (Individual/Company)',
            type: 'text',
            required: true
          },
          {
            label: 'CNIC/Registration Number',
            type: 'text',
            required: true
          },
          {
            label: 'Address',
            type: 'textarea',
            required: true
          },
          {
            label: 'Email',
            type: 'email',
            required: true
          },
          {
            label: 'Phone',
            type: 'tel',
            required: true
          }
        ]
      },
      {
        title: 'Trademark Details',
        fields: [
          {
            label: 'Trademark Type',
            type: 'select',
            required: true,
            options: ['Word', 'Logo', 'Word+Logo', '3D', 'Sound']
          },
          {
            label: 'Trademark Text (if any)',
            type: 'text',
            required: false,
            placeholder: 'Enter trademark text'
          },
          {
            label: 'Upload Logo File',
            type: 'file',
            required: false
          },
          {
            label: 'Colors Claimed',
            type: 'text',
            required: false,
            placeholder: 'e.g., Red, Blue'
          },
          {
            label: 'Translation/Transliteration',
            type: 'text',
            required: false,
            placeholder: 'If non-English'
          }
        ]
      },
      {
        title: 'Classification',
        fields: [
          {
            label: 'Class (1-45)',
            type: 'text',
            required: true,
            placeholder: 'Select applicable classes'
          },
          {
            label: 'Goods/Services Description',
            type: 'textarea',
            required: true,
            placeholder: 'Describe what you want to protect'
          }
        ]
      },
      {
        title: 'Usage Information',
        fields: [
          {
            label: 'Date of First Use',
            type: 'date',
            required: false
          },
          {
            label: 'Have you used this mark?',
            type: 'select',
            required: true,
            options: ['Yes', 'No']
          }
        ]
      }
    ],
    faqs: [
      {
        question: 'How long is trademark valid?',
        answer: '10 years, renewable indefinitely.'
      },
      {
        question: 'Can I register name and logo together?',
        answer: 'Yes, recommended for full protection.'
      },
      {
        question: 'What if someone opposes?',
        answer: 'We handle opposition proceedings on your behalf.'
      }
    ]
  },

  // 3. PAKISTAN FOOD AUTHORITY LICENSE
  {
    slug: 'pakistan-food-authority-license',
    title: 'Pakistan Food Authority License',
    tagline: 'Get licensed to operate your food business legally',
    deliverables: [
      'Food business registration certificate',
      'License to operate legally',
      'Inspection clearance',
      'Display certificate'
    ],
    processSteps: [
      {
        title: 'Registration',
        description: 'Register on PFA portal, submit business details, upload documents',
        duration: '3-5 days'
      },
      {
        title: 'Documentation Review',
        description: 'PFA reviews application, may request additional info, verify business details',
        duration: '5-7 days'
      },
      {
        title: 'Inspection',
        description: 'PFA schedules inspection, premises inspection conducted, check hygiene standards',
        duration: '7-14 days'
      },
      {
        title: 'License Issuance',
        description: 'Pay license fee, receive certificate, download from portal',
        duration: '3-5 days'
      }
    ],
    documentCategories: [
      { id: 'owner', name: 'Owner Documents', description: 'Personal identification and verification', order: 1 },
      { id: 'business', name: 'Business Documents', description: 'Business registration and legal documents', order: 2 },
      { id: 'premises', name: 'Premises Documents', description: 'Property and facility related documents', order: 3 },
      { id: 'health', name: 'Health & Safety', description: 'Health certifications and safety requirements', order: 4 }
    ],
    requiredDocuments: [
      // Owner Documents
      {
        id: 'owner-cnic',
        name: 'CNIC Copy (Owner)',
        description: 'Computerized National Identity Card of business owner',
        required: true,
        category: 'owner',
        copies: 2,
        formats: ['PDF', 'JPG', 'PNG'],
        notes: 'Both sides must be clear. Colored copy preferred.'
      },
      // Business Documents
      {
        id: 'business-registration',
        name: 'Business Registration Documents',
        description: 'Company incorporation certificate or business registration',
        required: true,
        category: 'business',
        formats: ['PDF'],
        alternatives: ['SECP Registration Certificate', 'Partnership Deed', 'Proprietorship Documents'],
        notes: 'Must match the business name being registered with PFA'
      },
      // Premises Documents
      {
        id: 'premises-ownership',
        name: 'Premises Ownership/Rent Agreement',
        description: 'Document proving right to use the premises',
        required: true,
        category: 'premises',
        formats: ['PDF'],
        alternatives: ['Property ownership deed', 'Rent agreement', 'Lease agreement'],
        notes: 'Must clearly show the address matching your business location'
      },
      {
        id: 'noc-building-owner',
        name: 'NOC from Building Owner',
        description: 'No Objection Certificate for operating food business',
        required: false,
        category: 'premises',
        condition: {
          field: 'Ownership Status',
          operator: 'notEquals',
          value: 'Owned'
        },
        formats: ['PDF'],
        notes: 'Required if premises is rented. Must mention food business operation.'
      },
      {
        id: 'layout-plan',
        name: 'Layout Plan of Premises',
        description: 'Detailed floor plan showing kitchen, storage, dining areas',
        required: true,
        category: 'premises',
        formats: ['PDF', 'JPG', 'PNG', 'DWG'],
        notes: 'Must show kitchen layout, storage areas, washrooms, and dining space. Can be hand-drawn if clear.'
      },
      {
        id: 'premises-photos',
        name: 'Photographs of Premises',
        description: 'Clear photos of kitchen, storage, and food preparation areas',
        required: true,
        category: 'premises',
        copies: 6,
        formats: ['JPG', 'PNG'],
        notes: 'Include: kitchen, storage, preparation area, dining (if applicable), washrooms, exterior'
      },
      {
        id: 'equipment-list',
        name: 'List of Equipment',
        description: 'Complete inventory of all food preparation and storage equipment',
        required: true,
        category: 'premises',
        formats: ['PDF', 'DOC', 'DOCX'],
        notes: 'Include: refrigerators, ovens, stoves, storage racks, utensils, etc.'
      },
      // Health & Safety
      {
        id: 'water-test-report',
        name: 'Water Test Report',
        description: 'Water quality test from PCSIR or authorized lab',
        required: true,
        category: 'health',
        formats: ['PDF'],
        notes: 'Report must not be older than 6 months. Required for all food businesses.'
      },
      {
        id: 'medical-certificates',
        name: 'Medical Certificates (Food Handlers)',
        description: 'Health certificates for all staff handling food',
        required: true,
        category: 'health',
        formats: ['PDF', 'JPG'],
        notes: 'Required for all employees. Must include: Blood test, Chest X-ray, Physical examination'
      }
    ],
    timeline: '3-4 weeks',
    formSections: [
      {
        title: 'Business Information',
        fields: [
          {
            label: 'Business Name',
            type: 'text',
            required: true
          },
          {
            label: 'Business Type',
            type: 'select',
            required: true,
            options: ['Restaurant', 'Cafe', 'Bakery', 'Catering', 'Manufacturing', 'Home-based', 'Other']
          },
          {
            label: 'Registration Number (if registered)',
            type: 'text',
            required: false
          },
          {
            label: 'Established Date',
            type: 'date',
            required: true
          }
        ]
      },
      {
        title: 'Premises Details',
        fields: [
          {
            label: 'Complete Address',
            type: 'textarea',
            required: true
          },
          {
            label: 'Area (sq ft)',
            type: 'number',
            required: true
          },
          {
            label: 'Ownership Status',
            type: 'select',
            required: true,
            options: ['Owned', 'Rented']
          },
          {
            label: 'Number of Food Handlers',
            type: 'number',
            required: true
          }
        ]
      },
      {
        title: 'Owner Details',
        fields: [
          {
            label: 'Name',
            type: 'text',
            required: true
          },
          {
            label: 'CNIC',
            type: 'text',
            required: true
          },
          {
            label: 'Contact Number',
            type: 'tel',
            required: true
          },
          {
            label: 'Email',
            type: 'email',
            required: true
          },
          {
            label: 'Qualification',
            type: 'text',
            required: false
          }
        ]
      },
      {
        title: 'Food Categories',
        fields: [
          {
            label: 'Food Categories Offered',
            type: 'checkbox',
            required: true,
            options: ['Ready-to-eat foods', 'Packaged foods', 'Beverages', 'Bakery items', 'Meat products', 'Dairy products']
          }
        ]
      }
    ],
    faqs: [
      {
        question: 'Is home kitchen license required?',
        answer: 'Yes, even home-based food businesses need registration.'
      },
      {
        question: 'What happens in inspection?',
        answer: 'They check cleanliness, equipment, storage conditions, and hygiene practices.'
      },
      {
        question: 'How long is license valid?',
        answer: '1 year, requires annual renewal.'
      }
    ]
  },

  // 4. IMPORT/EXPORT LICENSE
  {
    slug: 'import-export-license',
    title: 'Import/Export License',
    tagline: 'Start your international trade business legally',
    deliverables: [
      'Import/Export registration',
      'NTN and Sales tax registration',
      'Customs clearance authorization',
      'Trade facilitation'
    ],
    processSteps: [
      {
        title: 'NTN Registration',
        description: 'Register with FBR and obtain National Tax Number',
        duration: '2-3 days'
      },
      {
        title: 'Sales Tax Registration',
        description: 'Register for STRN and get sales tax number',
        duration: '5-7 days'
      },
      {
        title: 'Trade License',
        description: 'Register with relevant chamber and obtain trade membership',
        duration: '3-5 days'
      },
      {
        title: 'Customs Registration',
        description: 'Register with Pakistan Customs, get WeBOC access, obtain import/export code',
        duration: '5-7 days'
      }
    ],
    documentCategories: [
      { id: 'company', name: 'Company Documents', description: 'Business registration and legal entity documents', order: 1 },
      { id: 'tax', name: 'Tax Documents', description: 'FBR and tax registration documents', order: 2 },
      { id: 'financial', name: 'Financial Documents', description: 'Bank and financial details', order: 3 },
      { id: 'personal', name: 'Personal Documents', description: 'Director/owner identification', order: 4 }
    ],
    requiredDocuments: [
      // Company Documents
      {
        id: 'company-registration',
        name: 'Company Registration (SECP Certificate)',
        description: 'Certificate of incorporation from SECP',
        required: true,
        category: 'company',
        formats: ['PDF'],
        notes: 'Company must be registered with SECP to apply for import/export license'
      },
      {
        id: 'moa-aoa',
        name: 'Memorandum & Articles of Association',
        description: 'Complete MOA and AOA of the company',
        required: true,
        category: 'company',
        formats: ['PDF'],
        notes: 'Must include import/export in the business objects clause'
      },
      {
        id: 'business-address-proof',
        name: 'Business Address Proof',
        description: 'Document proving registered office address',
        required: true,
        category: 'company',
        formats: ['PDF'],
        alternatives: ['Rent agreement', 'Property ownership deed', 'Utility bill'],
        notes: 'Must match the address in SECP registration'
      },
      // Tax Documents
      {
        id: 'ntn-certificate',
        name: 'NTN Certificate',
        description: 'National Tax Number certificate from FBR',
        required: true,
        category: 'tax',
        formats: ['PDF'],
        notes: 'Will be obtained during the process if not already available'
      },
      {
        id: 'sales-tax-certificate',
        name: 'Sales Tax Certificate',
        description: 'Sales Tax Registration Number (STRN) certificate',
        required: true,
        category: 'tax',
        formats: ['PDF'],
        notes: 'Required for customs clearance. Will be processed as part of registration.'
      },
      // Financial Documents
      {
        id: 'bank-account-details',
        name: 'Bank Account Details',
        description: 'Company bank account statement and details',
        required: true,
        category: 'financial',
        formats: ['PDF'],
        notes: 'Bank account must be in company name. Include: Account title, number, branch, IBAN'
      },
      // Personal Documents
      {
        id: 'cnic-passport',
        name: 'CNIC/Passport Copy',
        description: 'Identity documents of all directors',
        required: true,
        category: 'personal',
        copies: 2,
        formats: ['PDF', 'JPG', 'PNG'],
        notes: 'Required for all company directors. Both sides for CNIC.'
      },
      {
        id: 'director-photos',
        name: 'Photographs',
        description: 'Passport-sized photographs of directors',
        required: true,
        category: 'personal',
        copies: 4,
        formats: ['JPG', 'PNG'],
        notes: '2 photographs per director with white background'
      }
    ],
    timeline: '2-3 weeks',
    formSections: [
      {
        title: 'Importer/Exporter Details',
        fields: [
          {
            label: 'Company Name',
            type: 'text',
            required: true
          },
          {
            label: 'SECP Registration Number',
            type: 'text',
            required: true
          },
          {
            label: 'Business Address',
            type: 'textarea',
            required: true
          },
          {
            label: 'Email',
            type: 'email',
            required: true
          },
          {
            label: 'Phone',
            type: 'tel',
            required: true
          },
          {
            label: 'Website (if any)',
            type: 'text',
            required: false
          }
        ]
      },
      {
        title: 'Type of Business',
        fields: [
          {
            label: 'Business Type',
            type: 'select',
            required: true,
            options: ['Import only', 'Export only', 'Both import and export']
          }
        ]
      },
      {
        title: 'Products/Goods',
        fields: [
          {
            label: 'HS Codes (if known)',
            type: 'text',
            required: false,
            placeholder: 'Enter HS codes'
          },
          {
            label: 'Product Description',
            type: 'textarea',
            required: true,
            placeholder: 'Describe products you plan to import/export'
          },
          {
            label: 'Country of Import/Export',
            type: 'text',
            required: true,
            placeholder: 'Countries you plan to trade with'
          },
          {
            label: 'Expected Annual Volume',
            type: 'text',
            required: false
          }
        ]
      },
      {
        title: 'Banking Information',
        fields: [
          {
            label: 'Bank Name',
            type: 'text',
            required: true
          },
          {
            label: 'Branch Name',
            type: 'text',
            required: true
          },
          {
            label: 'Account Number',
            type: 'text',
            required: true
          },
          {
            label: 'IBAN',
            type: 'text',
            required: true
          }
        ]
      },
      {
        title: 'Existing Registrations',
        fields: [
          {
            label: 'NTN',
            type: 'text',
            required: false,
            placeholder: 'Enter if already have, or select need to apply'
          },
          {
            label: 'STRN',
            type: 'text',
            required: false,
            placeholder: 'Enter if already have, or select need to apply'
          }
        ]
      }
    ],
    faqs: [
      {
        question: 'Can individuals apply?',
        answer: 'Yes, but company registration is recommended for better credibility.'
      },
      {
        question: 'What is WeBOC?',
        answer: 'Web-Based One Customs - online clearance system for import/export.'
      },
      {
        question: 'Do I need separate licenses for import and export?',
        answer: 'No, single registration covers both activities.'
      }
    ]
  },

  // 5. IHRA REGISTRATION
  {
    slug: 'ihra-registration',
    title: 'IHRA Registration',
    tagline: 'Register your healthcare facility in Islamabad',
    deliverables: [
      'IHRA registration certificate',
      'Legal approval to operate healthcare facility',
      'Inspection clearance certificate',
      'Annual license'
    ],
    processSteps: [
      {
        title: 'Pre-Application',
        description: 'Verify facility requirements, prepare documentation, layout approval',
        duration: '3-5 days'
      },
      {
        title: 'Application Submission',
        description: 'Submit online application, upload documents, pay application fee',
        duration: '2-3 days'
      },
      {
        title: 'Document Verification',
        description: 'IHRA reviews documents, request additional info if needed, technical assessment',
        duration: '1-2 weeks'
      },
      {
        title: 'Inspection',
        description: 'Schedule site inspection, IHRA team visits facility, check compliance with standards',
        duration: '2-3 weeks'
      },
      {
        title: 'License Issuance',
        description: 'Approval by IHRA board, pay license fee, receive certificate',
        duration: '1 week'
      }
    ],
    documentCategories: [
      { id: 'personal', name: 'Personal Documents', description: 'Owner and staff identification', order: 1 },
      { id: 'professional', name: 'Professional Credentials', description: 'Medical qualifications and registrations', order: 2 },
      { id: 'facility', name: 'Facility Documents', description: 'Property and infrastructure documents', order: 3 },
      { id: 'compliance', name: 'Compliance & Safety', description: 'Regulatory clearances and safety documents', order: 4 }
    ],
    requiredDocuments: [
      // Personal Documents
      {
        id: 'owner-cnic',
        name: 'CNIC (Owner/Partners)',
        description: 'Computerized National Identity Card of facility owners',
        required: true,
        category: 'personal',
        copies: 2,
        formats: ['PDF', 'JPG', 'PNG'],
        notes: 'Required for all owners and partners. Both sides must be clear.'
      },
      // Professional Credentials
      {
        id: 'qualification-certificates',
        name: 'Qualification Certificates (Doctors/Staff)',
        description: 'Academic and professional qualification documents',
        required: true,
        category: 'professional',
        formats: ['PDF'],
        notes: 'All medical degrees, diplomas, and certifications for doctors and technical staff'
      },
      {
        id: 'pmc-pnc-registration',
        name: 'PMC/PNC Registration (Medical Staff)',
        description: 'Pakistan Medical Council or Nursing Council registration',
        required: true,
        category: 'professional',
        condition: {
          field: 'Facility Type',
          operator: 'includes',
          value: 'medical'
        },
        formats: ['PDF'],
        notes: 'All practicing doctors must have valid PMC registration. Nurses require PNC registration.'
      },
      // Facility Documents
      {
        id: 'premises-ownership',
        name: 'Premises Ownership/Rent Deed',
        description: 'Property ownership document or lease agreement',
        required: true,
        category: 'facility',
        formats: ['PDF'],
        alternatives: ['Property ownership deed', 'Rent agreement', 'Lease deed'],
        notes: 'Must cover the entire facility area'
      },
      {
        id: 'layout-plan-cda',
        name: 'Layout Plan (Approved by CDA)',
        description: 'Architectural floor plan approved by Capital Development Authority',
        required: true,
        category: 'facility',
        formats: ['PDF', 'DWG'],
        notes: 'Must show: consultation rooms, operation theaters (if any), waiting areas, emergency exits'
      },
      {
        id: 'equipment-list',
        name: 'List of Equipment',
        description: 'Complete inventory of medical equipment and machinery',
        required: true,
        category: 'facility',
        formats: ['PDF', 'DOC', 'DOCX', 'XLS', 'XLSX'],
        notes: 'Include: Make, model, quantity, and functionality of all medical equipment'
      },
      // Compliance & Safety
      {
        id: 'fire-safety-noc',
        name: 'Fire Safety NOC',
        description: 'No Objection Certificate from Fire Brigade',
        required: true,
        category: 'compliance',
        formats: ['PDF'],
        notes: 'Facility must have adequate fire safety measures and emergency exits'
      },
      {
        id: 'environmental-clearance',
        name: 'Environmental Clearance',
        description: 'EPA clearance certificate',
        required: false,
        category: 'compliance',
        condition: {
          field: 'Number of Beds',
          operator: 'greaterThan',
          value: 10
        },
        formats: ['PDF'],
        notes: 'Required for hospitals with more than 10 beds or facilities with significant environmental impact'
      },
      {
        id: 'biomedical-waste-plan',
        name: 'Biomedical Waste Management Plan',
        description: 'Documented procedure for handling medical waste',
        required: true,
        category: 'compliance',
        formats: ['PDF', 'DOC', 'DOCX'],
        notes: 'Must comply with Hospital Waste Management Rules. Include: Segregation, storage, disposal procedures'
      },
      {
        id: 'sops',
        name: 'Standard Operating Procedures',
        description: 'Documented SOPs for all clinical and administrative processes',
        required: true,
        category: 'compliance',
        formats: ['PDF', 'DOC', 'DOCX'],
        notes: 'Include: Patient care protocols, infection control, emergency response, quality assurance'
      }
    ],
    timeline: '6-8 weeks',
    formSections: [
      {
        title: 'Facility Details',
        fields: [
          {
            label: 'Facility Name',
            type: 'text',
            required: true
          },
          {
            label: 'Facility Type',
            type: 'select',
            required: true,
            options: ['Hospital', 'Clinic', 'Diagnostic Center', 'Laboratory', 'Dental Clinic', 'Other']
          },
          {
            label: 'Number of Beds (if applicable)',
            type: 'number',
            required: false
          },
          {
            label: 'Total Area (sq ft)',
            type: 'number',
            required: true
          },
          {
            label: 'Complete Address',
            type: 'textarea',
            required: true
          }
        ]
      },
      {
        title: 'Services Offered',
        fields: [
          {
            label: 'Medical Services',
            type: 'checkbox',
            required: true,
            options: ['General Medicine', 'Surgery', 'Pediatrics', 'Gynecology', 'Diagnostic Services', 'Laboratory', 'Radiology', 'Emergency Services']
          }
        ]
      },
      {
        title: 'Ownership',
        fields: [
          {
            label: 'Owner Name',
            type: 'text',
            required: true
          },
          {
            label: 'CNIC',
            type: 'text',
            required: true
          },
          {
            label: 'Qualification',
            type: 'text',
            required: true
          },
          {
            label: 'Registration Number (PMC/PNC)',
            type: 'text',
            required: true
          }
        ]
      },
      {
        title: 'Medical Staff',
        fields: [
          {
            label: 'Doctor Name',
            type: 'text',
            required: true
          },
          {
            label: 'Qualification',
            type: 'text',
            required: true
          },
          {
            label: 'PMC Registration',
            type: 'text',
            required: true
          },
          {
            label: 'Specialization',
            type: 'text',
            required: true
          }
        ]
      },
      {
        title: 'Infrastructure',
        fields: [
          {
            label: 'Number of Rooms',
            type: 'number',
            required: true
          },
          {
            label: 'OPD Rooms',
            type: 'number',
            required: true
          },
          {
            label: 'Procedure Rooms',
            type: 'number',
            required: false
          },
          {
            label: 'Emergency Area',
            type: 'select',
            required: true,
            options: ['Yes', 'No']
          }
        ]
      }
    ],
    faqs: [
      {
        question: 'Only for Islamabad?',
        answer: 'Yes, IHRA regulates healthcare facilities in Islamabad Capital Territory only.'
      },
      {
        question: 'How often is renewal?',
        answer: 'Annual renewal is required.'
      },
      {
        question: 'What if inspection fails?',
        answer: 'You will be given time to rectify issues and a re-inspection will be scheduled.'
      }
    ]
  },

  // 6. DRAP LICENSING
  {
    slug: 'drap-licensing',
    title: 'DRAP Licensing',
    tagline: 'Get licensed to operate pharmacy or medical business',
    deliverables: [
      'DRAP license certificate',
      'Authorization to operate pharmacy/medical business',
      'Compliance certification',
      'Annual renewal capability'
    ],
    processSteps: [
      {
        title: 'Application Preparation',
        description: 'Prepare required documents, complete forms, staff documentation',
        duration: '5-7 days'
      },
      {
        title: 'Submission',
        description: 'Submit to DRAP office, pay application fee, receive acknowledgment',
        duration: '2-3 days'
      },
      {
        title: 'Document Review',
        description: 'DRAP reviews application, verify qualifications, check compliance',
        duration: '2-3 weeks'
      },
      {
        title: 'Inspection',
        description: 'Schedule site visit, inspect premises and equipment, check storage conditions',
        duration: '2-4 weeks'
      },
      {
        title: 'License Approval',
        description: 'DRAP board approval, pay license fee, receive certificate',
        duration: '1-2 weeks'
      }
    ],
    documentCategories: [
      { id: 'personal', name: 'Personal Documents', description: 'Owner identification', order: 1 },
      { id: 'professional', name: 'Professional Credentials', description: 'Pharmacy qualifications and registrations', order: 2 },
      { id: 'facility', name: 'Facility Documents', description: 'Property and infrastructure', order: 3 },
      { id: 'compliance', name: 'Compliance Documents', description: 'Regulatory and safety requirements', order: 4 }
    ],
    requiredDocuments: [
      // Personal Documents
      {
        id: 'owner-cnic',
        name: 'CNIC (Owner)',
        description: 'Computerized National Identity Card of pharmacy owner',
        required: true,
        category: 'personal',
        copies: 2,
        formats: ['PDF', 'JPG', 'PNG'],
        notes: 'Both sides must be clear and legible'
      },
      // Professional Credentials
      {
        id: 'pharmacy-qualification',
        name: 'Pharmacy Qualification Certificate',
        description: 'B.Pharmacy, Pharm-D, or equivalent degree',
        required: true,
        category: 'professional',
        formats: ['PDF'],
        notes: 'All academic qualifications related to pharmaceutical sciences'
      },
      {
        id: 'pharmacy-council-registration',
        name: 'Pharmacy Council Registration',
        description: 'Valid registration with Pharmacy Council of Pakistan',
        required: true,
        category: 'professional',
        formats: ['PDF'],
        notes: 'The registered pharmacist must be available during operating hours'
      },
      {
        id: 'staff-qualifications',
        name: 'Staff Qualifications',
        description: 'Qualification certificates of all pharmacy staff',
        required: true,
        category: 'professional',
        formats: ['PDF'],
        notes: 'Include qualifications for dispensers, assistants, and support staff'
      },
      // Facility Documents
      {
        id: 'premises-ownership',
        name: 'Premises Ownership/Rent',
        description: 'Property documents or rental agreement',
        required: true,
        category: 'facility',
        formats: ['PDF'],
        alternatives: ['Property ownership deed', 'Rent agreement', 'Lease deed'],
        notes: 'Must cover adequate space as per DRAP requirements'
      },
      {
        id: 'layout-plan',
        name: 'Layout Plan',
        description: 'Detailed floor plan of the pharmacy premises',
        required: true,
        category: 'facility',
        formats: ['PDF', 'DWG', 'JPG'],
        notes: 'Must show: dispensing area, storage, reception, restroom. Minimum area requirements apply.'
      },
      {
        id: 'equipment-list',
        name: 'List of Equipment',
        description: 'Complete inventory of pharmacy equipment',
        required: true,
        category: 'facility',
        formats: ['PDF', 'DOC', 'DOCX', 'XLS', 'XLSX'],
        notes: 'Include: Refrigerator, shelves, dispensing counter, measuring equipment, computers'
      },
      {
        id: 'premises-photos',
        name: 'Photographs of Premises',
        description: 'Clear photographs of interior and exterior',
        required: true,
        category: 'facility',
        copies: 6,
        formats: ['JPG', 'PNG'],
        notes: 'Include: Front view, dispensing area, storage area, signage'
      },
      // Compliance Documents
      {
        id: 'drug-storage-plan',
        name: 'Drug Storage Plan',
        description: 'Documented procedure for storing different categories of drugs',
        required: true,
        category: 'compliance',
        formats: ['PDF', 'DOC', 'DOCX'],
        notes: 'Must cover: Temperature control, controlled substances security, expiry management'
      },
      {
        id: 'noc-local-authority',
        name: 'NOC from Local Authority',
        description: 'No Objection Certificate from municipal authority',
        required: true,
        category: 'compliance',
        formats: ['PDF'],
        notes: 'From relevant district/city administration for operating a pharmacy'
      }
    ],
    timeline: '2-3 months',
    formSections: [
      {
        title: 'Business Details',
        fields: [
          {
            label: 'Business Name',
            type: 'text',
            required: true
          },
          {
            label: 'Business Type',
            type: 'select',
            required: true,
            options: ['Retail Pharmacy', 'Wholesale', 'Medical Devices', 'Manufacturing', 'Import/Distribution']
          },
          {
            label: 'Address',
            type: 'textarea',
            required: true
          },
          {
            label: 'Contact Number',
            type: 'tel',
            required: true
          },
          {
            label: 'Email',
            type: 'email',
            required: true
          }
        ]
      },
      {
        title: 'Pharmacist Details',
        fields: [
          {
            label: 'Name',
            type: 'text',
            required: true
          },
          {
            label: 'Qualification',
            type: 'select',
            required: true,
            options: ['B.Pharm', 'D.Pharm', 'Pharm.D']
          },
          {
            label: 'Pharmacy Council Registration Number',
            type: 'text',
            required: true
          },
          {
            label: 'Registration Date',
            type: 'date',
            required: true
          },
          {
            label: 'CNIC',
            type: 'text',
            required: true
          }
        ]
      },
      {
        title: 'Premises',
        fields: [
          {
            label: 'Total Area (sq ft)',
            type: 'number',
            required: true
          },
          {
            label: 'Storage Area (sq ft)',
            type: 'number',
            required: true
          },
          {
            label: 'Dispensing Area (sq ft)',
            type: 'number',
            required: true
          },
          {
            label: 'Temperature Control Available',
            type: 'select',
            required: true,
            options: ['Yes', 'No']
          },
          {
            label: 'Security Measures',
            type: 'textarea',
            required: true,
            placeholder: 'Describe security arrangements'
          }
        ]
      },
      {
        title: 'Product Categories',
        fields: [
          {
            label: 'Product Types',
            type: 'checkbox',
            required: true,
            options: ['Prescription medicines', 'OTC medicines', 'Medical devices', 'Surgical items', 'Nutraceuticals']
          }
        ]
      }
    ],
    faqs: [
      {
        question: 'Can I open pharmacy without pharmacist?',
        answer: 'No, registered pharmacist is mandatory for operating a pharmacy.'
      },
      {
        question: 'What equipment is needed?',
        answer: 'Minimum requirement includes shelving, refrigerator, and dispensing counter.'
      },
      {
        question: 'Is inspection surprise visit?',
        answer: 'No, inspection is scheduled in advance.'
      }
    ]
  },

  // 7. NTN REGISTRATION
  {
    slug: 'ntn-registration',
    title: 'NTN Registration',
    tagline: 'Get your National Tax Number for tax compliance',
    deliverables: [
      'National Tax Number certificate',
      'Active taxpayer status',
      'FBR portal access',
      'Ability to file tax returns'
    ],
    processSteps: [
      {
        title: 'Documentation',
        description: 'Collect required documents and complete application form',
        duration: '1 day'
      },
      {
        title: 'Online Application',
        description: 'Submit via IRIS portal, upload documents, generate provisional NTN',
        duration: '1 day'
      },
      {
        title: 'Verification',
        description: 'FBR verifies information, may request additional docs, email/SMS confirmation',
        duration: '1-3 days'
      },
      {
        title: 'Certificate Issuance',
        description: 'Download NTN certificate, access FBR portal, activate taxpayer status',
        duration: '1 day'
      }
    ],
    documentCategories: [
      { id: 'identity', name: 'Identity Documents', description: 'Personal or business identification', order: 1 },
      { id: 'business', name: 'Business Documents', description: 'Company registration (if applicable)', order: 2 },
      { id: 'contact', name: 'Contact & Financial', description: 'Contact details and bank information', order: 3 }
    ],
    requiredDocuments: [
      // Identity Documents
      {
        id: 'cnic-individual',
        name: 'CNIC Copy (Individuals)',
        description: 'Computerized National Identity Card for individual applicants',
        required: false,
        category: 'identity',
        condition: {
          field: 'Applicant Type',
          operator: 'equals',
          value: 'Individual'
        },
        copies: 2,
        formats: ['PDF', 'JPG', 'PNG'],
        notes: 'Required only for individual applicants. Both sides must be clear.'
      },
      {
        id: 'passport-photo',
        name: 'Passport Size Photo',
        description: 'Recent passport-sized photograph',
        required: true,
        category: 'identity',
        formats: ['JPG', 'PNG'],
        notes: 'White background, recent photo'
      },
      // Business Documents
      {
        id: 'secp-certificate',
        name: 'SECP Certificate (Companies)',
        description: 'Company incorporation certificate from SECP',
        required: false,
        category: 'business',
        condition: {
          field: 'Applicant Type',
          operator: 'equals',
          value: 'Company'
        },
        formats: ['PDF'],
        notes: 'Required only for company applicants'
      },
      {
        id: 'business-address-proof',
        name: 'Business Address Proof',
        description: 'Document verifying business/residential address',
        required: true,
        category: 'business',
        formats: ['PDF', 'JPG'],
        alternatives: ['Utility bill', 'Rent agreement', 'Property ownership deed'],
        notes: 'Must not be older than 3 months for utility bills'
      },
      // Contact & Financial
      {
        id: 'bank-account-details',
        name: 'Bank Account Details',
        description: 'Bank account statement or details',
        required: true,
        category: 'contact',
        formats: ['PDF'],
        notes: 'Include: Account title, number, bank name, branch. Can be personal or company account.'
      },
      {
        id: 'contact-info',
        name: 'Email and Phone Number',
        description: 'Active email address and mobile number',
        required: true,
        category: 'contact',
        notes: 'Will be used for FBR communications and OTP verification'
      }
    ],
    timeline: '2-5 working days',
    formSections: [
      {
        title: 'Applicant Type',
        fields: [
          {
            label: 'Are you applying as',
            type: 'select',
            required: true,
            options: ['Individual', 'Company']
          }
        ]
      },
      {
        title: 'For Individuals',
        fields: [
          {
            label: 'Full Name (as per CNIC)',
            type: 'text',
            required: true
          },
          {
            label: 'CNIC Number',
            type: 'text',
            required: true
          },
          {
            label: 'Date of Birth',
            type: 'date',
            required: true
          },
          {
            label: "Father's/Husband's Name",
            type: 'text',
            required: true
          },
          {
            label: 'Residential Address',
            type: 'textarea',
            required: true
          },
          {
            label: 'Mobile Number',
            type: 'tel',
            required: true
          },
          {
            label: 'Email Address',
            type: 'email',
            required: true
          },
          {
            label: 'Profession',
            type: 'text',
            required: true
          },
          {
            label: 'Source of Income',
            type: 'select',
            required: true,
            options: ['Salary', 'Business', 'Freelance', 'Other']
          }
        ]
      },
      {
        title: 'For Companies',
        fields: [
          {
            label: 'Company Name',
            type: 'text',
            required: true
          },
          {
            label: 'SECP Registration Number',
            type: 'text',
            required: true
          },
          {
            label: 'Registration Date',
            type: 'date',
            required: true
          },
          {
            label: 'Business Address',
            type: 'textarea',
            required: true
          },
          {
            label: 'Principal Business Activity',
            type: 'text',
            required: true
          },
          {
            label: 'Company Email',
            type: 'email',
            required: true
          },
          {
            label: 'Company Phone',
            type: 'tel',
            required: true
          },
          {
            label: 'Authorized Person Name',
            type: 'text',
            required: true
          },
          {
            label: 'Authorized Person CNIC',
            type: 'text',
            required: true
          }
        ]
      },
      {
        title: 'Additional Information',
        fields: [
          {
            label: 'Do you need sales tax registration?',
            type: 'select',
            required: true,
            options: ['Yes', 'No']
          },
          {
            label: 'Expected Annual Turnover (PKR)',
            type: 'number',
            required: false
          }
        ]
      }
    ],
    faqs: [
      {
        question: 'Is NTN free?',
        answer: 'Yes, no fee is charged for NTN registration.'
      },
      {
        question: 'Difference between NTN and tax filing?',
        answer: 'NTN is your registration number, filing is the annual obligation to submit tax returns.'
      },
      {
        question: 'Can I get NTN same day?',
        answer: 'Usually yes, provisional NTN is issued immediately, confirmed within 2-3 days.'
      }
    ]
  },

  // 8. SALES TAX REGISTRATION (STRN)
  {
    slug: 'sales-tax-registration',
    title: 'Sales Tax Registration (STRN)',
    tagline: 'Register for sales tax and become eligible to charge GST',
    deliverables: [
      'Sales Tax Registration Number',
      'Authority to charge sales tax',
      'Input tax claim ability',
      'Legal invoicing capability'
    ],
    processSteps: [
      {
        title: 'Eligibility Check',
        description: 'Verify business qualifies, check turnover threshold, assess registration type',
        duration: '1 day'
      },
      {
        title: 'Documentation',
        description: 'Collect documents, prepare application, business verification',
        duration: '2-3 days'
      },
      {
        title: 'Application Submission',
        description: 'Submit via IRIS portal, upload documents, pay registration fee',
        duration: '1 day'
      },
      {
        title: 'Verification',
        description: 'FBR verifies premises, may conduct physical visit, document authentication',
        duration: '5-7 days'
      },
      {
        title: 'STRN Issuance',
        description: 'Approval by FBR, generate STRN certificate, activate in system',
        duration: '2-3 days'
      }
    ],
    documentCategories: [
      { id: 'tax', name: 'Tax Documents', description: 'Existing tax registrations', order: 1 },
      { id: 'identity', name: 'Identity Documents', description: 'Personal or business identification', order: 2 },
      { id: 'business', name: 'Business Documents', description: 'Business location and operations proof', order: 3 },
      { id: 'financial', name: 'Financial Documents', description: 'Bank and financial records', order: 4 }
    ],
    requiredDocuments: [
      // Tax Documents
      {
        id: 'ntn-certificate',
        name: 'NTN Certificate',
        description: 'National Tax Number certificate from FBR',
        required: true,
        category: 'tax',
        formats: ['PDF'],
        notes: 'NTN is mandatory prerequisite for sales tax registration'
      },
      // Identity Documents
      {
        id: 'cnic-secp',
        name: 'CNIC (Proprietor) / SECP Certificate',
        description: 'Owner CNIC for sole proprietorship or company registration for companies',
        required: true,
        category: 'identity',
        formats: ['PDF', 'JPG', 'PNG'],
        alternatives: ['CNIC (for individuals/proprietors)', 'SECP Certificate (for companies)'],
        notes: 'Provide CNIC for sole proprietorship, SECP certificate for registered companies'
      },
      {
        id: 'partnership-deed',
        name: 'Partnership Deed (if applicable)',
        description: 'Registered partnership agreement',
        required: false,
        category: 'identity',
        condition: {
          field: 'Business Type',
          operator: 'equals',
          value: 'Partnership'
        },
        formats: ['PDF'],
        notes: 'Required only for partnership firms. Must be registered with registrar.'
      },
      // Business Documents
      {
        id: 'business-address-proof',
        name: 'Business Address Proof',
        description: 'Document verifying business location',
        required: true,
        category: 'business',
        formats: ['PDF'],
        alternatives: ['Rent agreement', 'Property ownership deed', 'Utility bill'],
        notes: 'Address must match the principal place of business'
      },
      {
        id: 'rent-ownership-docs',
        name: 'Rent Agreement / Ownership Documents',
        description: 'Legal document for business premises',
        required: true,
        category: 'business',
        formats: ['PDF'],
        alternatives: ['Rent/lease agreement', 'Property ownership documents', 'Allotment letter'],
        notes: 'Must clearly show the business address'
      },
      {
        id: 'electricity-bill',
        name: 'Electricity Bill',
        description: 'Recent electricity bill of business premises',
        required: true,
        category: 'business',
        formats: ['PDF', 'JPG'],
        notes: 'Must not be older than 3 months. Address must match business location.'
      },
      {
        id: 'business-photos',
        name: 'Business Photographs',
        description: 'Photos of business premises - interior and exterior',
        required: true,
        category: 'business',
        copies: 4,
        formats: ['JPG', 'PNG'],
        notes: 'Include: exterior signboard, interior shop/office, inventory/stock, owner at premises'
      },
      // Financial Documents
      {
        id: 'bank-statement',
        name: 'Bank Account Statement',
        description: 'Recent bank statement in business name',
        required: true,
        category: 'financial',
        formats: ['PDF'],
        notes: 'Last 3 months statement. Must be in business name (individual or company).'
      }
    ],
    timeline: '1-2 weeks',
    formSections: [
      {
        title: 'Business Information',
        fields: [
          {
            label: 'Business Name',
            type: 'text',
            required: true
          },
          {
            label: 'NTN',
            type: 'text',
            required: true
          },
          {
            label: 'Business Type',
            type: 'select',
            required: true,
            options: ['Manufacturing', 'Trading', 'Services', 'Retailer', 'Wholesaler']
          },
          {
            label: 'Business Address',
            type: 'textarea',
            required: true
          },
          {
            label: 'Number of Outlets',
            type: 'number',
            required: true
          }
        ]
      },
      {
        title: 'Registration Type',
        fields: [
          {
            label: 'Select Registration Authority',
            type: 'select',
            required: true,
            options: ['Federal (FBR)', 'Provincial (SRB/PRA)', 'Both']
          }
        ]
      },
      {
        title: 'Turnover Details',
        fields: [
          {
            label: 'Expected Annual Turnover (PKR)',
            type: 'number',
            required: true
          },
          {
            label: 'Nature of Supplies',
            type: 'select',
            required: true,
            options: ['Goods', 'Services', 'Both']
          }
        ]
      },
      {
        title: 'Bank Details',
        fields: [
          {
            label: 'Bank Name',
            type: 'text',
            required: true
          },
          {
            label: 'Branch',
            type: 'text',
            required: true
          },
          {
            label: 'Account Title',
            type: 'text',
            required: true
          },
          {
            label: 'Account Number',
            type: 'text',
            required: true
          }
        ]
      },
      {
        title: 'Premises',
        fields: [
          {
            label: 'Ownership',
            type: 'select',
            required: true,
            options: ['Owned', 'Rented']
          },
          {
            label: 'Area (sq ft)',
            type: 'number',
            required: true
          },
          {
            label: 'Utility Bill Account Number',
            type: 'text',
            required: true
          }
        ]
      }
    ],
    faqs: [
      {
        question: 'Who must register?',
        answer: 'Manufacturers, importers, exporters, and businesses above the turnover threshold.'
      },
      {
        question: 'What is the threshold?',
        answer: 'PKR 10 million annual turnover for federal (varies by province for provincial).'
      },
      {
        question: 'Federal or provincial?',
        answer: 'Depends on your business type and location - we help determine the right one.'
      }
    ]
  },

  // 9. TAX FILING
  {
    slug: 'tax-filing',
    title: 'Tax Filing',
    tagline: 'File your annual tax returns and stay compliant',
    deliverables: [
      'Filed tax return',
      'FBR acknowledgment receipt',
      'Active filer status',
      'Compliance certificate'
    ],
    processSteps: [
      {
        title: 'Document Collection',
        description: 'Collect financial records, bank statements, income documents, expense receipts',
        duration: '1-2 days'
      },
      {
        title: 'Return Preparation',
        description: 'Calculate taxable income, compute tax liability, prepare tax return, client review',
        duration: '2-3 days'
      },
      {
        title: 'Filing on IRIS',
        description: 'Submit via FBR portal, upload supporting documents, generate acknowledgment',
        duration: '1 day'
      },
      {
        title: 'Payment (if due)',
        description: 'Calculate payment, generate challan, make payment, attach proof',
        duration: '1 day'
      }
    ],
    documentCategories: [
      { id: 'identity', name: 'Identity & Tax Documents', description: 'Personal or business identification', order: 1 },
      { id: 'income', name: 'Income Documents', description: 'All sources of income', order: 2 },
      { id: 'financial', name: 'Financial Records', description: 'Bank accounts and assets', order: 3 },
      { id: 'expenses', name: 'Expense Records', description: 'Deductible expenses and receipts', order: 4 }
    ],
    requiredDocuments: [
      // Identity & Tax Documents
      {
        id: 'cnic-ntn',
        name: 'CNIC / NTN Certificate',
        description: 'National identity card or tax number certificate',
        required: true,
        category: 'identity',
        formats: ['PDF', 'JPG', 'PNG'],
        notes: 'Both CNIC and NTN required if available'
      },
      {
        id: 'previous-return',
        name: 'Previous Year Tax Return',
        description: 'Last filed tax return with acknowledgment',
        required: false,
        category: 'identity',
        formats: ['PDF'],
        notes: 'Required only if you have filed tax returns before. Helps maintain continuity.'
      },
      // Income Documents
      {
        id: 'salary-slips',
        name: 'Salary Slips (if employed)',
        description: 'Monthly salary slips or annual salary certificate',
        required: false,
        category: 'income',
        condition: {
          field: 'Source of Income',
          operator: 'includes',
          value: 'salary'
        },
        formats: ['PDF'],
        notes: 'All 12 months of the tax year. Include tax deduction certificates if available.'
      },
      {
        id: 'business-income',
        name: 'Business Income Records (if applicable)',
        description: 'Financial statements, invoices, and business income proof',
        required: false,
        category: 'income',
        condition: {
          field: 'Source of Income',
          operator: 'includes',
          value: 'business'
        },
        formats: ['PDF', 'XLS', 'XLSX'],
        notes: 'Include: Profit & loss statement, sales records, business bank statements'
      },
      // Financial Records
      {
        id: 'bank-statements',
        name: 'Bank Statements (All Accounts)',
        description: 'Complete bank statements for all accounts held',
        required: true,
        category: 'financial',
        formats: ['PDF'],
        notes: 'All 12 months for the tax year. Include accounts in Pakistan and abroad.'
      },
      {
        id: 'investment-details',
        name: 'Investment Details',
        description: 'Documentation of all investments and securities',
        required: false,
        category: 'financial',
        formats: ['PDF'],
        alternatives: ['Share certificates', 'Mutual fund statements', 'Prize bonds', 'National savings certificates'],
        notes: 'Include dividend income, capital gains, and investment principal amounts'
      },
      {
        id: 'property-details',
        name: 'Property Details',
        description: 'Documentation of all owned properties',
        required: false,
        category: 'financial',
        formats: ['PDF'],
        notes: 'Include: Property purchase documents, rental income (if any), property tax receipts'
      },
      // Expense Records
      {
        id: 'expense-receipts',
        name: 'Expense Receipts',
        description: 'Receipts for deductible expenses',
        required: false,
        category: 'expenses',
        formats: ['PDF', 'JPG', 'PNG'],
        alternatives: ['Medical expenses', 'Education fees', 'Charitable donations', 'Business expenses'],
        notes: 'Keep receipts for all tax-deductible expenses and donations to approved institutions'
      },
      {
        id: 'loan-statements',
        name: 'Loan Statements',
        description: 'Statements for any loans taken during the year',
        required: false,
        category: 'expenses',
        formats: ['PDF'],
        notes: 'Include: Home loans, car loans, business loans. Interest may be deductible.'
      },
      {
        id: 'advance-tax-challans',
        name: 'Advance Tax Paid Challans',
        description: 'Receipts of advance tax payments made during the year',
        required: false,
        category: 'expenses',
        formats: ['PDF'],
        notes: 'If you paid advance tax, include all payment challans to claim credit'
      },
      {
        id: 'wealth-statement',
        name: 'Wealth Statement Details',
        description: 'Complete list of assets and liabilities',
        required: true,
        category: 'financial',
        formats: ['PDF', 'DOC', 'DOCX', 'XLS', 'XLSX'],
        notes: 'Include: All assets (property, vehicles, bank balances, investments) and liabilities (loans)'
      }
    ],
    timeline: '3-5 days',
    formSections: [
      {
        title: 'Taxpayer Details',
        fields: [
          {
            label: 'Name',
            type: 'text',
            required: true
          },
          {
            label: 'CNIC',
            type: 'text',
            required: true
          },
          {
            label: 'NTN',
            type: 'text',
            required: true
          },
          {
            label: 'Tax Year',
            type: 'text',
            required: true,
            placeholder: 'e.g., 2025'
          },
          {
            label: 'Filing Type',
            type: 'select',
            required: true,
            options: ['First time', 'Regular']
          }
        ]
      },
      {
        title: 'Income Sources - Salary',
        fields: [
          {
            label: 'Employer Name',
            type: 'text',
            required: false
          },
          {
            label: 'Annual Salary (PKR)',
            type: 'number',
            required: false
          },
          {
            label: 'Tax Deducted (PKR)',
            type: 'number',
            required: false
          }
        ]
      },
      {
        title: 'Income Sources - Business',
        fields: [
          {
            label: 'Business Name',
            type: 'text',
            required: false
          },
          {
            label: 'Gross Receipts (PKR)',
            type: 'number',
            required: false
          },
          {
            label: 'Business Expenses (PKR)',
            type: 'number',
            required: false
          },
          {
            label: 'Net Profit (PKR)',
            type: 'number',
            required: false
          }
        ]
      },
      {
        title: 'Other Income',
        fields: [
          {
            label: 'Bank Profit (PKR)',
            type: 'number',
            required: false
          },
          {
            label: 'Rental Income (PKR)',
            type: 'number',
            required: false
          },
          {
            label: 'Capital Gains (PKR)',
            type: 'number',
            required: false
          }
        ]
      },
      {
        title: 'Deductions',
        fields: [
          {
            label: 'Tax Credits Claimed',
            type: 'text',
            required: false
          },
          {
            label: 'Advance Tax Paid (PKR)',
            type: 'number',
            required: false
          }
        ]
      },
      {
        title: 'Assets',
        fields: [
          {
            label: 'Bank Balance (PKR)',
            type: 'number',
            required: false
          },
          {
            label: 'Property Value (PKR)',
            type: 'number',
            required: false
          },
          {
            label: 'Vehicles (PKR)',
            type: 'number',
            required: false
          },
          {
            label: 'Investments (PKR)',
            type: 'number',
            required: false
          }
        ]
      },
      {
        title: 'Liabilities',
        fields: [
          {
            label: 'Loans (PKR)',
            type: 'number',
            required: false
          },
          {
            label: 'Other Liabilities (PKR)',
            type: 'number',
            required: false
          }
        ]
      }
    ],
    faqs: [
      {
        question: 'When is the deadline?',
        answer: 'September 30 for individuals, December 31 for companies.'
      },
      {
        question: 'What if I miss deadline?',
        answer: 'Late filing penalty is applicable - better to file late than never.'
      },
      {
        question: 'Do I need to file if no income?',
        answer: 'If you have NTN, filing is recommended to maintain active taxpayer status.'
      }
    ]
  },

  // 10. HARASSMENT CASES
  {
    slug: 'harassment-cases',
    title: 'Harassment Cases',
    tagline: 'Legal support for harassment complaints and litigation',
    deliverables: [
      'Legal complaint drafting',
      'Case filing support',
      'Representation at ombudsman/court',
      'Legal advice and guidance'
    ],
    processSteps: [
      {
        title: 'Initial Consultation',
        description: 'Discuss case details, assess legal options, explain process and rights, collect evidence',
        duration: '1-2 days'
      },
      {
        title: 'Documentation',
        description: 'Draft legal complaint, prepare supporting documents, organize evidence, client approval',
        duration: '3-5 days'
      },
      {
        title: 'Filing',
        description: 'File with relevant forum, submit to ombudsman/court, serve notice to respondent',
        duration: '2-3 days'
      },
      {
        title: 'Proceedings',
        description: 'Attend hearings, present evidence, legal representation, settlement negotiations',
        duration: '2-4 months'
      },
      {
        title: 'Resolution',
        description: 'Obtain orders/judgment, follow-up for compliance, enforcement if needed',
        duration: 'Varies'
      }
    ],
    documentCategories: [
      { id: 'identity', name: 'Identity Documents', description: 'Personal identification', order: 1 },
      { id: 'employment', name: 'Employment Records', description: 'Job and workplace documents', order: 2 },
      { id: 'evidence', name: 'Evidence', description: 'Proof of harassment incidents', order: 3 },
      { id: 'medical', name: 'Medical & Support Documents', description: 'Health and witness documentation', order: 4 }
    ],
    requiredDocuments: [
      // Identity Documents
      {
        id: 'cnic-copy',
        name: 'CNIC Copy',
        description: 'Computerized National Identity Card of complainant',
        required: true,
        category: 'identity',
        copies: 2,
        formats: ['PDF', 'JPG', 'PNG'],
        notes: 'Both sides must be clear'
      },
      // Employment Records
      {
        id: 'employment-documents',
        name: 'Employment Documents',
        description: 'Proof of employment relationship',
        required: true,
        category: 'employment',
        formats: ['PDF'],
        alternatives: ['Employment contract', 'Appointment letter', 'Job offer letter', 'Pay slips', 'ID card'],
        notes: 'Any document establishing the employment relationship with the organization'
      },
      {
        id: 'employment-contract',
        name: 'Employment Contract',
        description: 'Formal employment agreement',
        required: false,
        category: 'employment',
        formats: ['PDF'],
        notes: 'If available, helps establish terms of employment'
      },
      {
        id: 'company-policies',
        name: 'Company Policies',
        description: 'Workplace harassment policy or code of conduct',
        required: false,
        category: 'employment',
        formats: ['PDF'],
        notes: 'Company anti-harassment policy, code of conduct, or employee handbook'
      },
      // Evidence
      {
        id: 'messages-emails',
        name: 'Messages/Emails (Evidence)',
        description: 'Electronic communications showing harassment',
        required: false,
        category: 'evidence',
        formats: ['PDF', 'JPG', 'PNG', 'MSG', 'EML'],
        notes: 'Screenshots or exports of WhatsApp, SMS, emails, social media messages. Include dates/timestamps.'
      },
      {
        id: 'audio-video',
        name: 'Audio/Video Recordings',
        description: 'Recorded evidence of harassment incidents',
        required: false,
        category: 'evidence',
        formats: ['MP3', 'MP4', 'WAV', 'M4A', 'MOV'],
        notes: 'Legally obtained recordings. Provide transcripts if possible.'
      },
      {
        id: 'previous-complaints',
        name: 'Previous Complaints (if filed)',
        description: 'Any earlier complaints filed internally or externally',
        required: false,
        category: 'evidence',
        formats: ['PDF'],
        notes: 'Copies of complaints to HR, management, or other authorities with responses'
      },
      // Medical & Support Documents
      {
        id: 'medical-reports',
        name: 'Medical Reports (if applicable)',
        description: 'Medical documentation of physical or psychological harm',
        required: false,
        category: 'medical',
        condition: {
          field: 'Harassment Type',
          operator: 'includes',
          value: 'physical'
        },
        formats: ['PDF'],
        notes: 'Medical certificates, psychological evaluation, therapy records showing impact of harassment'
      },
      {
        id: 'witness-statements',
        name: 'Witness Statements',
        description: 'Written statements from witnesses to incidents',
        required: false,
        category: 'medical',
        formats: ['PDF', 'DOC', 'DOCX'],
        notes: 'Affidavits or signed statements from colleagues or others who witnessed incidents'
      }
    ],
    timeline: '2-6 months',
    formSections: [
      {
        title: 'Complainant Details',
        fields: [
          {
            label: 'Full Name',
            type: 'text',
            required: true
          },
          {
            label: 'CNIC',
            type: 'text',
            required: true
          },
          {
            label: 'Contact Number',
            type: 'tel',
            required: true
          },
          {
            label: 'Email',
            type: 'email',
            required: true
          },
          {
            label: 'Current Address',
            type: 'textarea',
            required: true
          },
          {
            label: 'Employment Status',
            type: 'text',
            required: true
          }
        ]
      },
      {
        title: 'Respondent Details',
        fields: [
          {
            label: 'Name (if known)',
            type: 'text',
            required: false
          },
          {
            label: 'Position/Designation',
            type: 'text',
            required: false
          },
          {
            label: 'Organization Name',
            type: 'text',
            required: true
          },
          {
            label: 'Organization Address',
            type: 'textarea',
            required: true
          }
        ]
      },
      {
        title: 'Incident Details',
        fields: [
          {
            label: 'Type of Harassment',
            type: 'select',
            required: true,
            options: ['Workplace harassment', 'Sexual harassment', 'Cyber harassment', 'Domestic harassment', 'Other']
          },
          {
            label: 'Date of Incident(s)',
            type: 'date',
            required: true
          },
          {
            label: 'Location',
            type: 'text',
            required: true
          },
          {
            label: 'Duration (if ongoing)',
            type: 'text',
            required: false,
            placeholder: 'How long has this been happening?'
          },
          {
            label: 'Detailed Description',
            type: 'textarea',
            required: true,
            placeholder: 'Please provide detailed description of incidents (confidential)'
          }
        ]
      },
      {
        title: 'Evidence Available',
        fields: [
          {
            label: 'Type of Evidence',
            type: 'checkbox',
            required: false,
            options: ['Written communications', 'Witness testimonies', 'Audio recordings', 'Video recordings', 'Medical reports', 'Police complaint']
          }
        ]
      },
      {
        title: 'Previous Actions',
        fields: [
          {
            label: 'Complained to employer?',
            type: 'select',
            required: true,
            options: ['Yes', 'No']
          },
          {
            label: 'Police complaint filed?',
            type: 'select',
            required: true,
            options: ['Yes', 'No']
          },
          {
            label: 'Inquiry conducted?',
            type: 'select',
            required: true,
            options: ['Yes', 'No']
          }
        ]
      },
      {
        title: 'Desired Outcome',
        fields: [
          {
            label: 'What outcome are you seeking?',
            type: 'checkbox',
            required: true,
            options: ['Stop harassment', 'Compensation', 'Dismissal of harasser', 'Transfer/relocation', 'Other']
          }
        ]
      }
    ],
    faqs: [
      {
        question: 'Is it confidential?',
        answer: 'Yes, 100% confidential handling of your case.'
      },
      {
        question: 'Do I need to appear in person?',
        answer: 'Limited appearances may be required, but we minimize your burden.'
      },
      {
        question: 'What if I\'m afraid of retaliation?',
        answer: 'Legal protections are available, and we advise on safety measures.'
      }
    ]
  },

  // 11. PROPERTY TRANSFER
  {
    slug: 'property-transfer',
    title: 'Property Transfer',
    tagline: 'Complete legal property transfer and mutation services',
    deliverables: [
      'Transfer deed preparation',
      'Mutation in revenue records',
      'Fard/registry documents',
      'Legal ownership transfer'
    ],
    processSteps: [
      {
        title: 'Documentation',
        description: 'Collect property documents, verify ownership, check encumbrances, prepare sale deed',
        duration: '3-5 days'
      },
      {
        title: 'Stamp Duty & Registration',
        description: 'Calculate stamp duty, pay at designated bank, register deed at sub-registrar',
        duration: '5-7 days'
      },
      {
        title: 'Mutation Application',
        description: 'Apply to revenue office, submit documents, schedule hearing, attend mutation hearing',
        duration: '7-10 days'
      },
      {
        title: 'Mutation Completion',
        description: 'Obtain mutation order, update revenue records, get new Fard, transfer utilities',
        duration: '5-7 days'
      }
    ],
    documentCategories: [
      { id: 'property', name: 'Property Documents', description: 'Ownership and title documents', order: 1 },
      { id: 'identity', name: 'Identity Documents', description: 'Buyer and seller identification', order: 2 },
      { id: 'financial', name: 'Financial Documents', description: 'Tax and utility payment records', order: 3 },
      { id: 'legal', name: 'Legal Documents', description: 'NOCs, affidavits, and authorizations', order: 4 }
    ],
    requiredDocuments: [
      // Property Documents
      {
        id: 'original-title-docs',
        name: 'Original Sale Deed / Title Documents',
        description: 'Original ownership documents proving current ownership',
        required: true,
        category: 'property',
        formats: ['PDF', 'Original physical document'],
        notes: 'Must be original or certified copy. Shows chain of ownership.'
      },
      {
        id: 'fard',
        name: 'Fard (Land Registry)',
        description: 'Current land registry document from revenue office',
        required: true,
        category: 'property',
        formats: ['PDF'],
        notes: 'Recent Fard (not older than 3 months) showing current owner name in revenue records'
      },
      // Identity Documents
      {
        id: 'cnic-buyer-seller',
        name: 'CNIC (Buyer and Seller)',
        description: 'Valid CNICs of both parties',
        required: true,
        category: 'identity',
        copies: 2,
        formats: ['PDF', 'JPG', 'PNG'],
        notes: 'Both sides of CNIC for buyer and seller. Must not be expired.'
      },
      // Financial Documents
      {
        id: 'property-tax-receipts',
        name: 'Property Tax Receipts',
        description: 'Proof of paid property tax (last 3 years)',
        required: true,
        category: 'financial',
        formats: ['PDF', 'JPG'],
        notes: 'Tax receipts from municipal authority. Should be up to date.'
      },
      {
        id: 'utility-bills',
        name: 'Electricity/Gas Bills',
        description: 'Recent utility bills showing property address',
        required: true,
        category: 'financial',
        formats: ['PDF', 'JPG'],
        notes: 'Latest bills (within 2 months) in current owner name'
      },
      // Legal Documents
      {
        id: 'noc-society',
        name: 'NOC (if from Society/DHA)',
        description: 'No Objection Certificate from housing society',
        required: false,
        category: 'legal',
        condition: {
          field: 'Property Type',
          operator: 'includes',
          value: 'society'
        },
        formats: ['PDF'],
        notes: 'Required if property is in a housing society, DHA, or gated community. Must be recent.'
      },
      {
        id: 'affidavits',
        name: 'Affidavits',
        description: 'Sworn statements as required by law',
        required: true,
        category: 'legal',
        formats: ['PDF'],
        notes: 'Standard affidavits for property transfer. We will provide templates.'
      },
      {
        id: 'death-certificate',
        name: 'Death Certificate (if inheritance)',
        description: 'Original death certificate of deceased owner',
        required: false,
        category: 'legal',
        condition: {
          field: 'Transfer Type',
          operator: 'equals',
          value: 'inheritance'
        },
        formats: ['PDF', 'Original physical document'],
        notes: 'Required only for inheritance transfers'
      },
      {
        id: 'succession-certificate',
        name: 'Succession Certificate (if inheritance)',
        description: 'Court-issued succession certificate',
        required: false,
        category: 'legal',
        condition: {
          field: 'Transfer Type',
          operator: 'equals',
          value: 'inheritance'
        },
        formats: ['PDF'],
        notes: 'Required for inheritance transfers to establish legal heirs'
      },
      {
        id: 'power-of-attorney',
        name: 'Power of Attorney (if applicable)',
        description: 'Registered POA if transaction through attorney',
        required: false,
        category: 'legal',
        condition: {
          field: 'Transaction Mode',
          operator: 'equals',
          value: 'attorney'
        },
        formats: ['PDF'],
        notes: 'Required if buyer or seller is represented by an attorney'
      }
    ],
    timeline: '3-4 weeks',
    formSections: [
      {
        title: 'Seller Details',
        fields: [
          {
            label: 'Name',
            type: 'text',
            required: true
          },
          {
            label: 'CNIC',
            type: 'text',
            required: true
          },
          {
            label: "Father's Name",
            type: 'text',
            required: true
          },
          {
            label: 'Address',
            type: 'textarea',
            required: true
          },
          {
            label: 'Contact Number',
            type: 'tel',
            required: true
          },
          {
            label: 'Email',
            type: 'email',
            required: true
          }
        ]
      },
      {
        title: 'Buyer Details',
        fields: [
          {
            label: 'Name',
            type: 'text',
            required: true
          },
          {
            label: 'CNIC',
            type: 'text',
            required: true
          },
          {
            label: "Father's Name",
            type: 'text',
            required: true
          },
          {
            label: 'Address',
            type: 'textarea',
            required: true
          },
          {
            label: 'Contact Number',
            type: 'tel',
            required: true
          },
          {
            label: 'Email',
            type: 'email',
            required: true
          }
        ]
      },
      {
        title: 'Property Details',
        fields: [
          {
            label: 'Property Type',
            type: 'select',
            required: true,
            options: ['Plot', 'House', 'Apartment', 'Commercial']
          },
          {
            label: 'Complete Address',
            type: 'textarea',
            required: true
          },
          {
            label: 'Khasra/Survey Number',
            type: 'text',
            required: true
          },
          {
            label: 'Area',
            type: 'text',
            required: true,
            placeholder: 'e.g., 5 marla, 1000 sq ft'
          },
          {
            label: 'Current Valuation (PKR)',
            type: 'number',
            required: true
          },
          {
            label: 'Sale Consideration (PKR)',
            type: 'number',
            required: true
          }
        ]
      },
      {
        title: 'Transaction Details',
        fields: [
          {
            label: 'Sale Type',
            type: 'select',
            required: true,
            options: ['Full sale', 'Gift', 'Inheritance', 'Exchange']
          },
          {
            label: 'Payment Mode',
            type: 'select',
            required: true,
            options: ['Cash', 'Bank transfer', 'Cheque']
          },
          {
            label: 'Date of Agreement',
            type: 'date',
            required: true
          },
          {
            label: 'Possession Date',
            type: 'date',
            required: true
          }
        ]
      },
      {
        title: 'Location',
        fields: [
          {
            label: 'City',
            type: 'text',
            required: true
          },
          {
            label: 'Tehsil',
            type: 'text',
            required: true
          },
          {
            label: 'District',
            type: 'text',
            required: true
          },
          {
            label: 'Society/Scheme',
            type: 'text',
            required: false
          }
        ]
      }
    ],
    faqs: [
      {
        question: 'How much is stamp duty?',
        answer: 'Varies by province, typically 2-5% of property value.'
      },
      {
        question: 'Can overseas Pakistanis transfer property?',
        answer: 'Yes, through power of attorney.'
      },
      {
        question: 'How long does mutation take?',
        answer: '1-2 weeks after application submission.'
      }
    ]
  },

  // 12. AGREEMENT DRAFTING
  {
    slug: 'agreement-drafting',
    title: 'Agreement Drafting',
    tagline: 'Custom legal agreements tailored to your needs',
    deliverables: [
      'Customized legal agreement',
      'Legally enforceable document',
      'Notarized copy (if needed)',
      'Guidance on execution'
    ],
    processSteps: [
      {
        title: 'Requirement Discussion',
        description: 'Understand agreement purpose, identify parties, discuss key terms, clarify expectations',
        duration: '1 day'
      },
      {
        title: 'Drafting',
        description: 'Prepare initial draft, include all clauses, legal compliance check, send for review',
        duration: '2-3 days'
      },
      {
        title: 'Revision',
        description: 'Client review, incorporate feedback, finalize terms, final approval',
        duration: '1-2 days'
      },
      {
        title: 'Execution',
        description: 'Print on stamp paper, arrange notarization, guide on signing, deliver final copies',
        duration: '1 day'
      }
    ],
    documentCategories: [
      { id: 'identity', name: 'Identity Documents', description: 'All parties identification', order: 1 },
      { id: 'business', name: 'Business Documents', description: 'Company registration (if applicable)', order: 2 },
      { id: 'reference', name: 'Reference Documents', description: 'Previous agreements or related documents', order: 3 },
      { id: 'specific', name: 'Agreement-Specific', description: 'Documents specific to agreement type', order: 4 }
    ],
    requiredDocuments: [
      // Identity Documents
      {
        id: 'cnic-all-parties',
        name: 'CNIC (All Parties)',
        description: 'Computerized National Identity Cards of all parties to the agreement',
        required: true,
        category: 'identity',
        copies: 2,
        formats: ['PDF', 'JPG', 'PNG'],
        notes: 'Both sides for all parties (individuals) entering into the agreement'
      },
      // Business Documents
      {
        id: 'business-registration',
        name: 'Business Registration (if company)',
        description: 'Company incorporation certificate or business registration',
        required: false,
        category: 'business',
        condition: {
          field: 'Party Type',
          operator: 'includes',
          value: 'company'
        },
        formats: ['PDF'],
        notes: 'Required if any party is a company/organization rather than an individual'
      },
      // Reference Documents
      {
        id: 'previous-agreements',
        name: 'Previous Agreements (if amendment)',
        description: 'Original agreement being amended or referenced',
        required: false,
        category: 'reference',
        condition: {
          field: 'Agreement Type',
          operator: 'includes',
          value: 'amendment'
        },
        formats: ['PDF'],
        notes: 'Required only for amendments or addendums to existing agreements'
      },
      // Agreement-Specific
      {
        id: 'supporting-docs',
        name: 'Supporting Documents Specific to Agreement Type',
        description: 'Additional documents based on agreement nature',
        required: false,
        category: 'specific',
        formats: ['PDF', 'DOC', 'DOCX'],
        alternatives: [
          'Property documents (for sale/lease agreements)',
          'Employment history (for employment contracts)',
          'Business plan (for partnership agreements)',
          'Financial statements (for loan agreements)',
          'Product specifications (for supply agreements)'
        ],
        notes: 'Varies by agreement type. We will specify what is needed during consultation.'
      }
    ],
    timeline: '3-5 days',
    formSections: [
      {
        title: 'Agreement Type',
        fields: [
          {
            label: 'Select Agreement Type',
            type: 'select',
            required: true,
            options: [
              'Service Agreement',
              'Employment Contract',
              'Non-Disclosure Agreement (NDA)',
              'Memorandum of Understanding (MOU)',
              'Partnership Agreement',
              'Lease/Rent Agreement',
              'Sale Agreement',
              'Loan Agreement',
              'Consultancy Agreement',
              'Other'
            ]
          }
        ]
      },
      {
        title: 'First Party',
        fields: [
          {
            label: 'Name',
            type: 'text',
            required: true
          },
          {
            label: 'CNIC/Registration Number',
            type: 'text',
            required: true
          },
          {
            label: 'Address',
            type: 'textarea',
            required: true
          },
          {
            label: 'Role',
            type: 'text',
            required: true,
            placeholder: 'e.g., Service Provider, Employer'
          }
        ]
      },
      {
        title: 'Second Party',
        fields: [
          {
            label: 'Name',
            type: 'text',
            required: true
          },
          {
            label: 'CNIC/Registration Number',
            type: 'text',
            required: true
          },
          {
            label: 'Address',
            type: 'textarea',
            required: true
          },
          {
            label: 'Role',
            type: 'text',
            required: true,
            placeholder: 'e.g., Client, Employee'
          }
        ]
      },
      {
        title: 'Agreement Details',
        fields: [
          {
            label: 'Purpose',
            type: 'textarea',
            required: true,
            placeholder: 'Describe the purpose of this agreement'
          },
          {
            label: 'Duration',
            type: 'select',
            required: true,
            options: ['Fixed term', 'Perpetual']
          },
          {
            label: 'Start Date',
            type: 'date',
            required: true
          },
          {
            label: 'End Date (if applicable)',
            type: 'date',
            required: false
          },
          {
            label: 'Consideration/Payment (PKR)',
            type: 'number',
            required: false
          },
          {
            label: 'Payment Terms',
            type: 'text',
            required: false,
            placeholder: 'e.g., Monthly, Upon completion'
          }
        ]
      },
      {
        title: 'Key Terms',
        fields: [
          {
            label: 'Deliverables',
            type: 'textarea',
            required: false,
            placeholder: 'What will be delivered/provided?'
          },
          {
            label: 'Responsibilities',
            type: 'textarea',
            required: false,
            placeholder: 'Key responsibilities of parties'
          },
          {
            label: 'Confidentiality Required?',
            type: 'select',
            required: true,
            options: ['Yes', 'No']
          },
          {
            label: 'Non-compete Clause?',
            type: 'select',
            required: false,
            options: ['Yes', 'No']
          },
          {
            label: 'Termination Conditions',
            type: 'textarea',
            required: false,
            placeholder: 'Under what conditions can the agreement be terminated?'
          },
          {
            label: 'Dispute Resolution',
            type: 'select',
            required: true,
            options: ['Arbitration', 'Courts', 'Mediation']
          }
        ]
      },
      {
        title: 'Special Clauses',
        fields: [
          {
            label: 'Additional Terms or Conditions',
            type: 'textarea',
            required: false,
            placeholder: 'Any specific terms or conditions to include'
          }
        ]
      },
      {
        title: 'Notarization',
        fields: [
          {
            label: 'Notarization Required?',
            type: 'select',
            required: true,
            options: ['Yes', 'No']
          },
          {
            label: 'Stamp Paper Value (PKR)',
            type: 'number',
            required: false
          }
        ]
      }
    ],
    faqs: [
      {
        question: 'Is stamp paper mandatory?',
        answer: 'Depends on agreement type - we advise accordingly based on legal requirements.'
      },
      {
        question: 'Can we customize any clause?',
        answer: 'Yes, agreements are fully customized to your specific needs.'
      },
      {
        question: 'Is it legally valid?',
        answer: 'Yes, when properly executed and stamped, it is legally enforceable.'
      }
    ]
  },

  // 13. TV CHANNEL REGISTRATION
  {
    slug: 'tv-channel-registration',
    title: 'TV Channel Registration',
    tagline: 'Get PEMRA license for your television channel',
    deliverables: [
      'PEMRA license application',
      'NOC from relevant authorities',
      'Channel launch clearance',
      'Operational permission'
    ],
    processSteps: [
      {
        title: 'Pre-Application',
        description: 'Feasibility assessment, company registration, shareholders documentation, financial planning',
        duration: '2 weeks'
      },
      {
        title: 'PEMRA Application',
        description: 'Complete application forms, submit financial guarantees, business plan submission',
        duration: '1 month'
      },
      {
        title: 'PEMRA Review',
        description: 'Application scrutiny, technical evaluation, financial assessment, background checks',
        duration: '3-6 months'
      },
      {
        title: 'Hearing & Approval',
        description: 'PEMRA hearing, present case, address queries, await decision',
        duration: '1-2 months'
      },
      {
        title: 'License Issuance',
        description: 'Pay license fee, receive license, NOC issuance',
        duration: '1 month'
      }
    ],
    documentCategories: [
      { id: 'company', name: 'Company Documents', description: 'Business registration and shareholder information', order: 1 },
      { id: 'financial', name: 'Financial Documents', description: 'Financial statements and solvency proof', order: 2 },
      { id: 'technical', name: 'Technical Documents', description: 'Studio, equipment, and infrastructure details', order: 3 },
      { id: 'compliance', name: 'Compliance Documents', description: 'Content policy and regulatory compliance', order: 4 }
    ],
    requiredDocuments: [
      {
        id: 'secp-certificate',
        name: 'Company Registration (SECP)',
        description: 'Certificate of incorporation from SECP',
        required: true,
        category: 'company',
        formats: ['PDF'],
        notes: 'Company must be registered as a private limited company with minimum capital requirement'
      },
      {
        id: 'shareholders-cnic',
        name: "Shareholders' CNICs",
        description: 'Identity documents of all company shareholders',
        required: true,
        category: 'company',
        copies: 2,
        formats: ['PDF', 'JPG', 'PNG'],
        notes: 'Both sides for all shareholders. Directors must also provide CNICs.'
      },
      {
        id: 'financial-statements',
        name: 'Financial Statements',
        description: 'Audited financial statements of the company',
        required: true,
        category: 'financial',
        formats: ['PDF'],
        notes: 'Last 2 years if existing company. Projected financials for new companies.'
      },
      {
        id: 'bank-solvency',
        name: 'Bank Solvency Certificate',
        description: 'Certificate from bank showing financial capacity',
        required: true,
        category: 'financial',
        formats: ['PDF'],
        notes: 'Must show sufficient funds to operate a TV channel. Minimum threshold applies.'
      },
      {
        id: 'business-plan',
        name: 'Business Plan',
        description: 'Detailed business plan for the TV channel',
        required: true,
        category: 'financial',
        formats: ['PDF', 'DOC', 'DOCX'],
        notes: 'Include: revenue model, programming schedule, target market analysis, marketing strategy'
      },
      {
        id: 'technical-details',
        name: 'Technical Details (Equipment, Studio)',
        description: 'Complete technical specifications of studio and broadcasting equipment',
        required: true,
        category: 'technical',
        formats: ['PDF', 'DOC', 'DOCX'],
        notes: 'Include: Studio layout, transmission equipment, production facilities, backup systems'
      },
      {
        id: 'content-policy',
        name: 'Content Policy',
        description: 'Documented editorial and content policy',
        required: true,
        category: 'compliance',
        formats: ['PDF', 'DOC', 'DOCX'],
        notes: 'Must comply with PEMRA regulations and code of conduct'
      },
      {
        id: 'code-of-conduct',
        name: 'Code of Conduct Compliance',
        description: 'Undertaking to comply with PEMRA code of conduct',
        required: true,
        category: 'compliance',
        formats: ['PDF'],
        notes: 'Signed undertaking on company letterhead'
      },
      {
        id: 'security-clearances',
        name: 'Security Clearances',
        description: 'Security clearance certificates for key personnel',
        required: true,
        category: 'compliance',
        formats: ['PDF'],
        notes: 'Required for directors, major shareholders, and editorial head'
      },
      {
        id: 'fee-deposit-proof',
        name: 'Fee Deposit Proof',
        description: 'Proof of application and processing fee payment',
        required: true,
        category: 'compliance',
        formats: ['PDF'],
        notes: 'Bank challan of fee deposited with PEMRA'
      }
    ],
    timeline: '8-12 months',
    formSections: [
      {
        title: 'Channel Details',
        fields: [
          {
            label: 'Proposed Channel Name',
            type: 'text',
            required: true
          },
          {
            label: 'Channel Type',
            type: 'select',
            required: true,
            options: ['News', 'Entertainment', 'Sports', 'Religious', 'Educational', 'Regional']
          },
          {
            label: 'Language',
            type: 'text',
            required: true
          },
          {
            label: 'Target Audience',
            type: 'text',
            required: true,
            placeholder: 'Describe your target audience'
          },
          {
            label: 'Coverage Area',
            type: 'select',
            required: true,
            options: ['National', 'Regional', 'Local']
          }
        ]
      },
      {
        title: 'Company Information',
        fields: [
          {
            label: 'Company Name',
            type: 'text',
            required: true
          },
          {
            label: 'SECP Registration Number',
            type: 'text',
            required: true
          },
          {
            label: 'Authorized Capital (PKR)',
            type: 'number',
            required: true
          },
          {
            label: 'Paid-up Capital (PKR)',
            type: 'number',
            required: true
          }
        ]
      },
      {
        title: 'Shareholders',
        fields: [
          {
            label: 'Shareholder Name',
            type: 'text',
            required: true
          },
          {
            label: 'CNIC',
            type: 'text',
            required: true
          },
          {
            label: 'Nationality',
            type: 'text',
            required: true
          },
          {
            label: 'Shareholding %',
            type: 'number',
            required: true
          }
        ]
      },
      {
        title: 'Technical Details',
        fields: [
          {
            label: 'Studio Location',
            type: 'textarea',
            required: true
          },
          {
            label: 'Studio Area (sq ft)',
            type: 'number',
            required: true
          },
          {
            label: 'Transmission Equipment',
            type: 'textarea',
            required: true,
            placeholder: 'List of equipment'
          },
          {
            label: 'Production Facilities',
            type: 'textarea',
            required: true,
            placeholder: 'Describe production facilities'
          }
        ]
      },
      {
        title: 'Financial Information',
        fields: [
          {
            label: 'Estimated Setup Cost (PKR)',
            type: 'number',
            required: true
          },
          {
            label: 'Annual Operating Budget (PKR)',
            type: 'number',
            required: true
          },
          {
            label: 'Revenue Model',
            type: 'textarea',
            required: true,
            placeholder: 'Describe expected revenue sources'
          },
          {
            label: 'Financial Guarantees (PKR)',
            type: 'number',
            required: true
          }
        ]
      },
      {
        title: 'Content Details',
        fields: [
          {
            label: 'Programming Hours Per Day',
            type: 'number',
            required: true
          },
          {
            label: 'Original Content %',
            type: 'number',
            required: true,
            placeholder: '0-100'
          },
          {
            label: 'Acquired Content %',
            type: 'number',
            required: true,
            placeholder: '0-100'
          },
          {
            label: 'News Bulletin Frequency (if news channel)',
            type: 'text',
            required: false
          }
        ]
      }
    ],
    faqs: [
      {
        question: 'How long for approval?',
        answer: '8-12 months on average, depending on application completeness.'
      },
      {
        question: 'What is the license fee?',
        answer: 'Varies by channel type, ranges from PKR 10-50 million.'
      },
      {
        question: 'Can I start before license?',
        answer: 'No, operating without PEMRA license is illegal.'
      }
    ]
  },

  // 14. RESTAURANT LICENSE & REGISTRATION
  {
    slug: 'restaurant-license-registration',
    title: 'Restaurant License & Registration',
    tagline: 'Complete registration and licensing for your restaurant',
    deliverables: [
      'Business registration',
      'Food authority license',
      'Fire safety NOC',
      'Health department approval',
      'Municipal license'
    ],
    processSteps: [
      {
        title: 'Business Registration',
        description: 'Register with SECP/local authority, obtain NTN',
        duration: '1 week'
      },
      {
        title: 'Food Authority License',
        description: 'Apply to PFA/FDA, submit documents, premises inspection, get license',
        duration: '2-3 weeks'
      },
      {
        title: 'Fire Safety NOC',
        description: 'Apply to fire department, safety inspection, install equipment, receive NOC',
        duration: '1-2 weeks'
      },
      {
        title: 'Health Department',
        description: 'Staff medical checkups, hygiene inspection, clearance certificate',
        duration: '1-2 weeks'
      },
      {
        title: 'Municipal License',
        description: 'Apply to local authority, trade license, signage approval',
        duration: '1 week'
      }
    ],
    documentCategories: [
      { id: 'identity', name: 'Identity & Business', description: 'Owner and business registration', order: 1 },
      { id: 'premises', name: 'Premises Documents', description: 'Property and facility documents', order: 2 },
      { id: 'health', name: 'Health & Safety', description: 'Health and safety certifications', order: 3 },
      { id: 'operational', name: 'Operational Documents', description: 'Menu, equipment, and operations', order: 4 }
    ],
    requiredDocuments: [
      {
        id: 'owner-cnic',
        name: 'CNIC (Owner)',
        description: 'Computerized National Identity Card of restaurant owner',
        required: true,
        category: 'identity',
        copies: 2,
        formats: ['PDF', 'JPG', 'PNG'],
        notes: 'Both sides must be clear'
      },
      {
        id: 'business-registration',
        name: 'Business Registration',
        description: 'Company registration or sole proprietorship documents',
        required: true,
        category: 'identity',
        formats: ['PDF'],
        alternatives: ['SECP registration', 'NTN certificate', 'Business registration from district'],
        notes: 'At minimum, NTN is required for tax purposes'
      },
      {
        id: 'premises-ownership',
        name: 'Premises Ownership/Rent Deed',
        description: 'Property ownership document or lease agreement',
        required: true,
        category: 'premises',
        formats: ['PDF'],
        alternatives: ['Property ownership deed', 'Rent agreement', 'Lease deed'],
        notes: 'Must show legal right to use the premises for restaurant'
      },
      {
        id: 'noc-landlord',
        name: 'NOC from Landlord',
        description: 'No Objection Certificate for operating restaurant',
        required: false,
        category: 'premises',
        condition: {
          field: 'Premises Status',
          operator: 'equals',
          value: 'rented'
        },
        formats: ['PDF'],
        notes: 'Required if premises is rented. Must mention restaurant/food business.'
      },
      {
        id: 'layout-plan',
        name: 'Layout Plan',
        description: 'Floor plan showing kitchen, dining, storage areas',
        required: true,
        category: 'premises',
        formats: ['PDF', 'JPG', 'DWG'],
        notes: 'Must show: kitchen layout, dining area, washrooms, storage, emergency exits'
      },
      {
        id: 'premises-photos',
        name: 'Photographs of Premises',
        description: 'Clear photos of interior and exterior',
        required: true,
        category: 'premises',
        copies: 8,
        formats: ['JPG', 'PNG'],
        notes: 'Include: exterior/signage, kitchen, dining area, storage, washrooms'
      },
      {
        id: 'water-test-report',
        name: 'Water Test Report',
        description: 'Water quality test from authorized lab',
        required: true,
        category: 'health',
        formats: ['PDF'],
        notes: 'From PCSIR or other approved laboratory. Must not be older than 6 months.'
      },
      {
        id: 'medical-certificates',
        name: 'Medical Certificates (Staff)',
        description: 'Health certificates for all food handlers',
        required: true,
        category: 'health',
        formats: ['PDF'],
        notes: 'Required for all staff handling food. Include: Medical examination, blood test, chest X-ray'
      },
      {
        id: 'fire-safety-equipment',
        name: 'Fire Safety Equipment',
        description: 'List and photos of fire safety equipment installed',
        required: true,
        category: 'health',
        formats: ['PDF', 'JPG'],
        notes: 'Fire extinguishers, smoke detectors, emergency exits. Include purchase receipts.'
      },
      {
        id: 'kitchen-equipment',
        name: 'Kitchen Equipment List',
        description: 'Complete inventory of kitchen equipment',
        required: true,
        category: 'operational',
        formats: ['PDF', 'DOC', 'DOCX', 'XLS', 'XLSX'],
        notes: 'Include: Ovens, ranges, refrigerators, freezers, prep tables, utensils'
      },
      {
        id: 'menu-prices',
        name: 'Menu with Prices',
        description: 'Complete menu card with item prices',
        required: true,
        category: 'operational',
        formats: ['PDF', 'JPG'],
        notes: 'Final menu to be displayed. Prices must be clearly marked.'
      }
    ],
    timeline: '6-8 weeks',
    formSections: [
      {
        title: 'Restaurant Details',
        fields: [
          {
            label: 'Restaurant Name',
            type: 'text',
            required: true
          },
          {
            label: 'Restaurant Type',
            type: 'select',
            required: true,
            options: ['Restaurant', 'Cafe', 'Fast Food', 'Fine Dining', 'Bakery', 'Cloud Kitchen']
          },
          {
            label: 'Cuisine Type',
            type: 'text',
            required: true,
            placeholder: 'e.g., Italian, Pakistani, Chinese'
          },
          {
            label: 'Seating Capacity',
            type: 'number',
            required: true
          },
          {
            label: 'Delivery Service?',
            type: 'select',
            required: true,
            options: ['Yes', 'No']
          }
        ]
      },
      {
        title: 'Location',
        fields: [
          {
            label: 'Complete Address',
            type: 'textarea',
            required: true
          },
          {
            label: 'Area (sq ft)',
            type: 'number',
            required: true
          },
          {
            label: 'Floor Level',
            type: 'text',
            required: true,
            placeholder: 'e.g., Ground Floor, 2nd Floor'
          },
          {
            label: 'Parking Available',
            type: 'select',
            required: true,
            options: ['Yes', 'No']
          }
        ]
      },
      {
        title: 'Owner Details',
        fields: [
          {
            label: 'Name',
            type: 'text',
            required: true
          },
          {
            label: 'CNIC',
            type: 'text',
            required: true
          },
          {
            label: 'Contact Number',
            type: 'tel',
            required: true
          },
          {
            label: 'Email',
            type: 'email',
            required: true
          },
          {
            label: 'Previous Restaurant Experience',
            type: 'text',
            required: false
          }
        ]
      },
      {
        title: 'Premises',
        fields: [
          {
            label: 'Kitchen Area (sq ft)',
            type: 'number',
            required: true
          },
          {
            label: 'Dining Area (sq ft)',
            type: 'number',
            required: true
          },
          {
            label: 'Storage Area (sq ft)',
            type: 'number',
            required: true
          },
          {
            label: 'Number of Washrooms',
            type: 'number',
            required: true
          }
        ]
      },
      {
        title: 'Staff',
        fields: [
          {
            label: 'Total Staff',
            type: 'number',
            required: true
          },
          {
            label: 'Number of Chefs',
            type: 'number',
            required: true
          },
          {
            label: 'Service Staff',
            type: 'number',
            required: true
          },
          {
            label: 'Delivery Personnel',
            type: 'number',
            required: false
          }
        ]
      },
      {
        title: 'Equipment',
        fields: [
          {
            label: 'Equipment Available',
            type: 'checkbox',
            required: true,
            options: ['Cooking range', 'Refrigerators/freezers', 'Exhaust system', 'Fire extinguishers', 'First aid kit']
          }
        ]
      },
      {
        title: 'Operating Hours',
        fields: [
          {
            label: 'Opening Time',
            type: 'text',
            required: true,
            placeholder: 'e.g., 11:00 AM'
          },
          {
            label: 'Closing Time',
            type: 'text',
            required: true,
            placeholder: 'e.g., 11:00 PM'
          },
          {
            label: 'Days Open',
            type: 'text',
            required: true,
            placeholder: 'e.g., Monday to Sunday'
          }
        ]
      },
      {
        title: 'Investment',
        fields: [
          {
            label: 'Setup Cost (PKR)',
            type: 'number',
            required: true
          },
          {
            label: 'Monthly Operating Cost (PKR)',
            type: 'number',
            required: true
          }
        ]
      }
    ],
    faqs: [
      {
        question: 'Can I operate from home?',
        answer: 'Yes, but you need a separate kitchen and food license.'
      },
      {
        question: 'How often is inspection?',
        answer: 'Annually, plus random inspections by authorities.'
      },
      {
        question: 'What if I fail inspection?',
        answer: 'You will be given time to fix issues and a re-inspection will be scheduled.'
      }
    ]
  },

  // 15. CHAMBER OF COMMERCE REGISTRATION
  {
    slug: 'chamber-of-commerce-registration',
    title: 'Chamber of Commerce Registration',
    tagline: 'Join chamber of commerce for business credibility',
    deliverables: [
      'Chamber membership certificate',
      'Business credibility',
      'Networking opportunities',
      'Certificate of origin facility'
    ],
    processSteps: [
      {
        title: 'Eligibility Check',
        description: 'Verify business registration, check membership criteria, select chamber type',
        duration: '1 day'
      },
      {
        title: 'Application',
        description: 'Complete application form, submit documents, pay membership fee',
        duration: '2-3 days'
      },
      {
        title: 'Verification',
        description: 'Chamber verifies business, may conduct site visit, background check',
        duration: '3-5 days'
      },
      {
        title: 'Approval',
        description: 'Review by chamber, membership approval, issue certificate',
        duration: '2-3 days'
      }
    ],
    documentCategories: [
      { id: 'company', name: 'Company Documents', description: 'Business registration and tax documents', order: 1 },
      { id: 'identity', name: 'Identity Documents', description: 'Owner and partner identification', order: 2 },
      { id: 'operational', name: 'Operational Documents', description: 'Business operations proof', order: 3 }
    ],
    requiredDocuments: [
      {
        id: 'secp-certificate',
        name: 'SECP Registration Certificate',
        description: 'Company incorporation certificate from SECP',
        required: true,
        category: 'company',
        formats: ['PDF'],
        notes: 'Original or certified copy. Company must be registered for Chamber membership.'
      },
      {
        id: 'ntn-certificate',
        name: 'NTN Certificate',
        description: 'National Tax Number certificate from FBR',
        required: true,
        category: 'company',
        formats: ['PDF'],
        notes: 'Active taxpayer status required'
      },
      {
        id: 'business-address-proof',
        name: 'Business Address Proof',
        description: 'Document proving registered business address',
        required: true,
        category: 'company',
        formats: ['PDF'],
        alternatives: ['Utility bill', 'Rent agreement', 'Property ownership deed'],
        notes: 'Must match address in SECP registration'
      },
      {
        id: 'cnic-owners',
        name: 'CNIC (Owner/Partners)',
        description: 'Identity documents of all owners/partners/directors',
        required: true,
        category: 'identity',
        copies: 2,
        formats: ['PDF', 'JPG', 'PNG'],
        notes: 'Both sides for all key persons in the business'
      },
      {
        id: 'partnership-deed',
        name: 'Partnership Deed (if applicable)',
        description: 'Registered partnership agreement',
        required: false,
        category: 'identity',
        condition: {
          field: 'Business Type',
          operator: 'equals',
          value: 'Partnership'
        },
        formats: ['PDF'],
        notes: 'Required only for partnership firms'
      },
      {
        id: 'bank-account-details',
        name: 'Bank Account Details',
        description: 'Company bank account statement or details',
        required: true,
        category: 'operational',
        formats: ['PDF'],
        notes: 'Bank account in company name. Include: Account title, number, branch'
      },
      {
        id: 'business-letterhead',
        name: 'Business Letterhead',
        description: 'Sample of company letterhead',
        required: true,
        category: 'operational',
        formats: ['PDF', 'DOC', 'DOCX'],
        notes: 'Official letterhead with company logo and complete contact details'
      },
      {
        id: 'photographs',
        name: 'Photographs',
        description: 'Passport-sized photographs of directors',
        required: true,
        category: 'identity',
        copies: 2,
        formats: ['JPG', 'PNG'],
        notes: '2 photographs per director/authorized representative'
      }
    ],
    timeline: '1-2 weeks',
    formSections: [
      {
        title: 'Business Information',
        fields: [
          {
            label: 'Business Name',
            type: 'text',
            required: true
          },
          {
            label: 'SECP Registration Number',
            type: 'text',
            required: true
          },
          {
            label: 'Registration Date',
            type: 'date',
            required: true
          },
          {
            label: 'NTN',
            type: 'text',
            required: true
          },
          {
            label: 'Business Type',
            type: 'select',
            required: true,
            options: ['Manufacturing', 'Trading', 'Services', 'Import/Export', 'Retail']
          }
        ]
      },
      {
        title: 'Chamber Selection',
        fields: [
          {
            label: 'Select Chamber',
            type: 'select',
            required: true,
            options: [
              'Federation of Pakistan Chambers of Commerce',
              'Islamabad Chamber of Commerce',
              'Karachi Chamber of Commerce',
              'Lahore Chamber of Commerce',
              'Rawalpindi Chamber of Commerce',
              'Other Provincial Chamber',
              'Local Chamber'
            ]
          }
        ]
      },
      {
        title: 'Business Details',
        fields: [
          {
            label: 'Nature of Business',
            type: 'textarea',
            required: true,
            placeholder: 'Describe your business activities'
          },
          {
            label: 'Products/Services',
            type: 'textarea',
            required: true,
            placeholder: 'List main products or services'
          },
          {
            label: 'Annual Turnover (PKR)',
            type: 'number',
            required: true
          },
          {
            label: 'Number of Employees',
            type: 'number',
            required: true
          },
          {
            label: 'Year Established',
            type: 'number',
            required: true,
            placeholder: '2020'
          }
        ]
      },
      {
        title: 'Owner/Partner Details',
        fields: [
          {
            label: 'Name',
            type: 'text',
            required: true
          },
          {
            label: 'CNIC',
            type: 'text',
            required: true
          },
          {
            label: 'Designation',
            type: 'text',
            required: true,
            placeholder: 'e.g., CEO, Partner'
          },
          {
            label: 'Email',
            type: 'email',
            required: true
          },
          {
            label: 'Phone',
            type: 'tel',
            required: true
          }
        ]
      },
      {
        title: 'Business Address',
        fields: [
          {
            label: 'Office Address',
            type: 'textarea',
            required: true
          },
          {
            label: 'Factory Address (if different)',
            type: 'textarea',
            required: false
          },
          {
            label: 'City',
            type: 'text',
            required: true
          },
          {
            label: 'Province',
            type: 'select',
            required: true,
            options: ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Islamabad Capital Territory']
          }
        ]
      }
    ],
    faqs: [
      {
        question: 'What are the benefits?',
        answer: 'Business credibility, networking, certificate of origin, representation in policy matters.'
      },
      {
        question: 'Is it mandatory?',
        answer: 'Not mandatory, but highly recommended for business growth and credibility.'
      },
      {
        question: 'Can I join multiple chambers?',
        answer: 'Yes, you can join both local and national chambers.'
      }
    ]
  },

  // 16. SUCCESSION CERTIFICATE
  {
    slug: 'succession-certificate',
    title: 'Succession Certificate',
    tagline: 'Legal right to claim deceased\'s assets and estate',
    deliverables: [
      'Court-issued succession certificate',
      'Legal right to claim assets',
      'Authority over deceased\'s estate',
      'Bank account access'
    ],
    processSteps: [
      {
        title: 'Documentation',
        description: 'Collect death certificate, identity documents, list of assets/liabilities, family tree documentation',
        duration: '1 week'
      },
      {
        title: 'Petition Filing',
        description: 'Draft succession petition, file in relevant court, pay court fees, receive case number',
        duration: '1 week'
      },
      {
        title: 'Publication',
        description: 'Newspaper publication, notice to potential claimants, objection period',
        duration: '1 month'
      },
      {
        title: 'Court Hearing',
        description: 'Attend hearings, present evidence, handle objections, witness examination',
        duration: '1-2 months'
      },
      {
        title: 'Certificate Issuance',
        description: 'Court judgment, issue succession certificate, authenticate and collect',
        duration: '2-4 weeks'
      }
    ],
    documentCategories: [
      { id: 'identity', name: 'Identity Documents', description: 'Applicant and deceased identification', order: 1 },
      { id: 'proof', name: 'Relationship Proof', description: 'Documents proving legal relationship', order: 2 },
      { id: 'estate', name: 'Estate Documents', description: 'Assets and liabilities of deceased', order: 3 },
      { id: 'legal', name: 'Legal Documents', description: 'Affidavits and consents', order: 4 }
    ],
    requiredDocuments: [
      {
        id: 'death-certificate',
        name: 'Death Certificate (Original)',
        description: 'Original death certificate of deceased',
        required: true,
        category: 'identity',
        formats: ['PDF', 'Original physical document'],
        notes: 'Must be original or certified copy from NADRA or union council'
      },
      {
        id: 'applicant-cnic',
        name: 'CNIC (Applicant)',
        description: 'National identity card of person applying for succession certificate',
        required: true,
        category: 'identity',
        copies: 2,
        formats: ['PDF', 'JPG', 'PNG'],
        notes: 'Applicant must be a legal heir'
      },
      {
        id: 'deceased-cnic',
        name: 'CNIC (Deceased)',
        description: 'Copy of deceased person\'s CNIC',
        required: true,
        category: 'identity',
        formats: ['PDF', 'JPG', 'PNG'],
        notes: 'Both sides if available'
      },
      {
        id: 'frc',
        name: 'Family Registration Certificate',
        description: 'FRC showing family members of deceased',
        required: true,
        category: 'proof',
        formats: ['PDF'],
        notes: 'Shows legal heirs and their relationship to deceased'
      },
      {
        id: 'relationship-proof',
        name: 'Relationship Proof',
        description: 'Documents establishing relationship with deceased',
        required: true,
        category: 'proof',
        formats: ['PDF'],
        alternatives: ['Birth certificates', 'Marriage certificate (Nikah nama)', 'School certificates', 'Domicile'],
        notes: 'Any official document showing relationship'
      },
      {
        id: 'assets-list',
        name: 'Assets List with Values',
        description: 'Complete inventory of deceased\'s assets',
        required: true,
        category: 'estate',
        formats: ['PDF', 'DOC', 'DOCX', 'XLS', 'XLSX'],
        notes: 'Include: Property, bank accounts, investments, vehicles, etc. with current values'
      },
      {
        id: 'liabilities-list',
        name: 'Liabilities List',
        description: 'List of any debts or liabilities of deceased',
        required: true,
        category: 'estate',
        formats: ['PDF', 'DOC', 'DOCX'],
        notes: 'Include loans, pending bills, or any outstanding debts'
      },
      {
        id: 'bank-details',
        name: 'Bank Account Details',
        description: 'Details of all bank accounts held by deceased',
        required: true,
        category: 'estate',
        formats: ['PDF'],
        notes: 'Bank account statements showing balance at time of death'
      },
      {
        id: 'property-docs',
        name: 'Property Documents',
        description: 'Title documents of all properties owned by deceased',
        required: false,
        category: 'estate',
        formats: ['PDF'],
        notes: 'Sale deeds, Fard, registry documents for all properties'
      },
      {
        id: 'affidavit',
        name: 'Affidavit',
        description: 'Sworn statement by applicant',
        required: true,
        category: 'legal',
        formats: ['PDF'],
        notes: 'Sworn affidavit stating facts of the case. We provide template.'
      },
      {
        id: 'noc-heirs',
        name: 'No Objection from Other Heirs',
        description: 'NOC from other legal heirs',
        required: false,
        category: 'legal',
        formats: ['PDF'],
        notes: 'If other heirs exist and consent to succession certificate issuance. Reduces court time.'
      }
    ],
    timeline: '3-6 months',
    formSections: [
      {
        title: 'Deceased Details',
        fields: [
          {
            label: 'Full Name',
            type: 'text',
            required: true
          },
          {
            label: 'CNIC',
            type: 'text',
            required: true
          },
          {
            label: "Father's Name",
            type: 'text',
            required: true
          },
          {
            label: 'Date of Death',
            type: 'date',
            required: true
          },
          {
            label: 'Place of Death',
            type: 'text',
            required: true
          },
          {
            label: 'Last Address',
            type: 'textarea',
            required: true
          },
          {
            label: 'Religion',
            type: 'text',
            required: true
          },
          {
            label: 'Marital Status at Death',
            type: 'select',
            required: true,
            options: ['Single', 'Married', 'Widowed', 'Divorced']
          }
        ]
      },
      {
        title: 'Applicant Details',
        fields: [
          {
            label: 'Full Name',
            type: 'text',
            required: true
          },
          {
            label: 'CNIC',
            type: 'text',
            required: true
          },
          {
            label: 'Relationship with Deceased',
            type: 'select',
            required: true,
            options: ['Son', 'Daughter', 'Spouse', 'Father', 'Mother', 'Brother', 'Sister', 'Other']
          },
          {
            label: 'Address',
            type: 'textarea',
            required: true
          },
          {
            label: 'Contact Number',
            type: 'tel',
            required: true
          },
          {
            label: 'Email',
            type: 'email',
            required: true
          }
        ]
      },
      {
        title: 'Legal Heirs Information',
        fields: [
          {
            label: 'Heir Name',
            type: 'text',
            required: true
          },
          {
            label: 'CNIC',
            type: 'text',
            required: true
          },
          {
            label: 'Relationship',
            type: 'select',
            required: true,
            options: ['Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Brother', 'Sister']
          },
          {
            label: 'Age',
            type: 'number',
            required: true
          },
          {
            label: 'Address',
            type: 'textarea',
            required: true
          },
          {
            label: 'Share in Estate',
            type: 'text',
            required: false,
            placeholder: 'As per Islamic law'
          }
        ]
      },
      {
        title: 'Assets Information',
        fields: [
          {
            label: 'Bank Name',
            type: 'text',
            required: false
          },
          {
            label: 'Account Number',
            type: 'text',
            required: false
          },
          {
            label: 'Approximate Balance (PKR)',
            type: 'number',
            required: false
          },
          {
            label: 'Property Details',
            type: 'textarea',
            required: false,
            placeholder: 'Type, location, estimated value'
          },
          {
            label: 'Total Estate Value (PKR)',
            type: 'number',
            required: true
          },
          {
            label: 'Total Liabilities (PKR)',
            type: 'number',
            required: false
          }
        ]
      },
      {
        title: 'Objections Expected',
        fields: [
          {
            label: 'Any Objections Expected?',
            type: 'select',
            required: true,
            options: ['No objections expected', 'Potential objectors exist']
          },
          {
            label: 'Details of Potential Objectors',
            type: 'textarea',
            required: false
          }
        ]
      }
    ],
    faqs: [
      {
        question: 'Who can apply?',
        answer: 'Legal heirs of the deceased person.'
      },
      {
        question: 'How long does it take?',
        answer: '3-6 months typically, depending on court schedule and objections.'
      },
      {
        question: 'What if there\'s a will?',
        answer: 'Different process - will execution required, not succession certificate.'
      }
    ]
  },

  // 17. FAMILY REGISTRATION CERTIFICATE (FRC)
  {
    slug: 'family-registration-certificate',
    title: 'Family Registration Certificate (FRC)',
    tagline: 'NADRA-issued official family document',
    deliverables: [
      'NADRA-issued family certificate',
      'Proof of family relationships',
      'Required for visas/immigration',
      'Official government document'
    ],
    processSteps: [
      {
        title: 'Documentation',
        description: 'Collect CNICs, marriage certificate, children\'s B-Forms, verify information',
        duration: '1-2 days'
      },
      {
        title: 'Application',
        description: 'Visit NADRA office or apply online, fill application form, submit documents, pay fee',
        duration: '1 day'
      },
      {
        title: 'Processing',
        description: 'NADRA verifies records, cross-check database, generate certificate',
        duration: '3-5 days'
      },
      {
        title: 'Delivery',
        description: 'Receive SMS notification, collect from NADRA or home delivery',
        duration: '1-2 days'
      }
    ],
    documentCategories: [
      { id: 'identity', name: 'Identity Documents', description: 'Husband and wife identification', order: 1 },
      { id: 'marriage', name: 'Marriage Documents', description: 'Marriage certificate', order: 2 },
      { id: 'children', name: 'Children Documents', description: 'Children identification', order: 3 },
      { id: 'contact', name: 'Contact Information', description: 'Communication details', order: 4 }
    ],
    requiredDocuments: [
      {
        id: 'husband-cnic',
        name: 'CNIC (Husband)',
        description: 'Computerized National Identity Card of husband',
        required: true,
        category: 'identity',
        copies: 2,
        formats: ['PDF', 'JPG', 'PNG'],
        notes: 'Both sides must be clear. CNIC must be valid (not expired).'
      },
      {
        id: 'wife-cnic',
        name: 'CNIC (Wife)',
        description: 'Computerized National Identity Card of wife',
        required: true,
        category: 'identity',
        copies: 2,
        formats: ['PDF', 'JPG', 'PNG'],
        notes: 'Both sides must be clear. CNIC must be valid (not expired).'
      },
      {
        id: 'nikah-nama',
        name: 'Nikah Nama (Marriage Certificate)',
        description: 'Original Nikah nama or marriage certificate',
        required: true,
        category: 'marriage',
        formats: ['PDF', 'JPG', 'PNG'],
        notes: 'Computerized Nikah nama from union council or original handwritten nikah nama'
      },
      {
        id: 'children-bforms',
        name: "Children's B-Forms",
        description: 'Birth certificates (B-Forms) of all children',
        required: false,
        category: 'children',
        formats: ['PDF', 'JPG', 'PNG'],
        notes: 'Required for all children to be included in FRC. Both sides if B-Form is card format.'
      },
      {
        id: 'previous-frc',
        name: 'Previous FRC (if updating)',
        description: 'Old Family Registration Certificate if applying for update',
        required: false,
        category: 'identity',
        condition: {
          field: 'Application Type',
          operator: 'equals',
          value: 'Update'
        },
        formats: ['PDF'],
        notes: 'Required only if updating/renewing existing FRC'
      },
      {
        id: 'contact-info',
        name: 'Email and Phone Number',
        description: 'Active email address and mobile number',
        required: true,
        category: 'contact',
        notes: 'For NADRA communication and SMS tracking of application'
      }
    ],
    timeline: '5-7 working days',
    formSections: [
      {
        title: 'Family Head Details',
        fields: [
          {
            label: 'Full Name (as per CNIC)',
            type: 'text',
            required: true
          },
          {
            label: 'CNIC Number',
            type: 'text',
            required: true
          },
          {
            label: 'Date of Birth',
            type: 'date',
            required: true
          },
          {
            label: 'Place of Birth',
            type: 'text',
            required: true
          }
        ]
      },
      {
        title: 'Spouse Details',
        fields: [
          {
            label: 'Full Name (as per CNIC)',
            type: 'text',
            required: true
          },
          {
            label: 'CNIC Number',
            type: 'text',
            required: true
          },
          {
            label: 'Date of Birth',
            type: 'date',
            required: true
          },
          {
            label: 'Marriage Date (as per Nikah Nama)',
            type: 'date',
            required: true
          }
        ]
      },
      {
        title: 'Children Details',
        fields: [
          {
            label: 'Child Full Name',
            type: 'text',
            required: true
          },
          {
            label: 'B-Form Number / CNIC (if adult)',
            type: 'text',
            required: true
          },
          {
            label: 'Date of Birth',
            type: 'date',
            required: true
          },
          {
            label: 'Gender',
            type: 'select',
            required: true,
            options: ['Male', 'Female']
          }
        ]
      },
      {
        title: 'Residential Address',
        fields: [
          {
            label: 'House Number',
            type: 'text',
            required: true
          },
          {
            label: 'Street',
            type: 'text',
            required: true
          },
          {
            label: 'Area/Sector',
            type: 'text',
            required: true
          },
          {
            label: 'City',
            type: 'text',
            required: true
          },
          {
            label: 'Province',
            type: 'select',
            required: true,
            options: ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Islamabad Capital Territory', 'Gilgit-Baltistan', 'Azad Kashmir']
          },
          {
            label: 'Postal Code',
            type: 'text',
            required: false
          }
        ]
      },
      {
        title: 'Contact Information',
        fields: [
          {
            label: 'Mobile Number',
            type: 'tel',
            required: true
          },
          {
            label: 'Email Address',
            type: 'email',
            required: true
          }
        ]
      },
      {
        title: 'Delivery Method',
        fields: [
          {
            label: 'Choose Delivery Method',
            type: 'select',
            required: true,
            options: ['Collect from NADRA office', 'Home delivery (+PKR 200)']
          },
          {
            label: 'Processing Type',
            type: 'select',
            required: true,
            options: ['Normal (5-7 days)', 'Urgent (2-3 days) - Additional fee']
          }
        ]
      }
    ],
    faqs: [
      {
        question: 'Who can apply?',
        answer: 'Pakistani citizens with NADRA records.'
      },
      {
        question: 'How long is it valid?',
        answer: 'Indefinite, but should be updated when family changes occur.'
      },
      {
        question: 'Can I apply online?',
        answer: 'Yes, through NADRA website or mobile app.'
      }
    ]
  },

  // 18. CHILD REGISTRATION CERTIFICATE (B-FORM)
  {
    slug: 'child-registration-certificate-b-form',
    title: 'Child Registration Certificate (B-Form)',
    tagline: 'Official identity document for children under 18',
    deliverables: [
      'Child Registration Certificate (B-Form)',
      'Official identity document',
      'Required for school admission',
      'Essential for passport'
    ],
    processSteps: [
      {
        title: 'Documentation',
        description: 'Collect parents\' CNICs, birth certificate, child\'s photograph',
        duration: '1 day'
      },
      {
        title: 'Application',
        description: 'Visit NADRA center, complete form, biometric (child 5+ years), submit documents',
        duration: '1 day'
      },
      {
        title: 'Processing',
        description: 'NADRA verifies parents, checks birth records, generates B-Form',
        duration: '3-5 days'
      },
      {
        title: 'Delivery',
        description: 'SMS notification, collect from center or home delivery option',
        duration: '1-2 days'
      }
    ],
    documentCategories: [
      { id: 'child', name: 'Child Documents', description: 'Child birth and identity documents', order: 1 },
      { id: 'parents', name: 'Parents Documents', description: 'Parents identification', order: 2 },
      { id: 'proof', name: 'Proof Documents', description: 'Marriage and relationship proof', order: 3 }
    ],
    requiredDocuments: [
      {
        id: 'birth-certificate',
        name: "Child's Birth Certificate",
        description: 'Original birth certificate from hospital or union council',
        required: true,
        category: 'child',
        formats: ['PDF', 'JPG', 'PNG', 'Original physical document'],
        notes: 'Hospital-issued birth certificate or Form-B issued by union council'
      },
      {
        id: 'child-photo',
        name: "Child's Recent Photograph",
        description: 'Recent passport-sized photograph of the child',
        required: true,
        category: 'child',
        copies: 2,
        formats: ['JPG', 'PNG'],
        notes: 'White background, clear face. For children above 5 years.'
      },
      {
        id: 'vaccination-card',
        name: 'Vaccination Card (helpful)',
        description: 'Child vaccination/immunization card',
        required: false,
        category: 'child',
        formats: ['PDF', 'JPG', 'PNG'],
        notes: 'Not mandatory but helpful for age verification and record purposes'
      },
      {
        id: 'father-cnic',
        name: "Father's CNIC",
        description: 'Computerized National Identity Card of father',
        required: true,
        category: 'parents',
        copies: 2,
        formats: ['PDF', 'JPG', 'PNG'],
        notes: 'Both sides must be clear. CNIC must be valid.'
      },
      {
        id: 'mother-cnic',
        name: "Mother's CNIC",
        description: 'Computerized National Identity Card of mother',
        required: true,
        category: 'parents',
        copies: 2,
        formats: ['PDF', 'JPG', 'PNG'],
        notes: 'Both sides must be clear. CNIC must be valid.'
      },
      {
        id: 'marriage-certificate',
        name: "Parents' Marriage Certificate",
        description: 'Nikah nama or marriage certificate of parents',
        required: true,
        category: 'proof',
        formats: ['PDF', 'JPG', 'PNG'],
        notes: 'To establish legitimate parentage. Computerized or original nikah nama.'
      }
    ],
    timeline: '5-7 working days',
    formSections: [
      {
        title: 'Child Details',
        fields: [
          {
            label: 'Full Name (as per Birth Certificate)',
            type: 'text',
            required: true
          },
          {
            label: 'Gender',
            type: 'select',
            required: true,
            options: ['Male', 'Female']
          },
          {
            label: 'Date of Birth',
            type: 'date',
            required: true
          },
          {
            label: 'Place of Birth',
            type: 'text',
            required: true
          },
          {
            label: 'Religion',
            type: 'text',
            required: true
          }
        ]
      },
      {
        title: 'Father Details',
        fields: [
          {
            label: 'Full Name (as per CNIC)',
            type: 'text',
            required: true
          },
          {
            label: 'CNIC Number',
            type: 'text',
            required: true
          },
          {
            label: 'Occupation',
            type: 'text',
            required: false
          }
        ]
      },
      {
        title: 'Mother Details',
        fields: [
          {
            label: 'Full Name (as per CNIC)',
            type: 'text',
            required: true
          },
          {
            label: 'CNIC Number',
            type: 'text',
            required: true
          },
          {
            label: 'Occupation',
            type: 'text',
            required: false
          }
        ]
      },
      {
        title: 'Birth Registration',
        fields: [
          {
            label: 'Birth Certificate Number',
            type: 'text',
            required: true
          },
          {
            label: 'Issuing Authority',
            type: 'text',
            required: true
          },
          {
            label: 'Registration Date',
            type: 'date',
            required: true
          }
        ]
      },
      {
        title: 'Address',
        fields: [
          {
            label: 'Permanent Address (as per CNIC)',
            type: 'textarea',
            required: true
          },
          {
            label: 'Current Address (if different)',
            type: 'textarea',
            required: false
          }
        ]
      },
      {
        title: 'Contact',
        fields: [
          {
            label: 'Mobile Number',
            type: 'tel',
            required: true
          },
          {
            label: 'Email Address',
            type: 'email',
            required: true
          }
        ]
      },
      {
        title: 'Delivery Options',
        fields: [
          {
            label: 'Delivery Method',
            type: 'select',
            required: true,
            options: ['Collect from NADRA center', 'Home delivery (+PKR 150)']
          },
          {
            label: 'Processing Type',
            type: 'select',
            required: true,
            options: ['Normal (7-10 days) - PKR 300', 'Urgent (3-5 days) - PKR 600', 'Executive (1-2 days) - PKR 1,200']
          }
        ]
      }
    ],
    faqs: [
      {
        question: 'When should I register?',
        answer: 'As soon as possible after birth.'
      },
      {
        question: 'Is it mandatory?',
        answer: 'Yes, required for passport and school admission.'
      },
      {
        question: 'Can I apply from any city?',
        answer: 'Yes, at any NADRA center nationwide.'
      }
    ]
  },

  // 19. PROPERTY VERIFICATION & DUE DILIGENCE
  {
    slug: 'property-verification-due-diligence',
    title: 'Property Verification & Due Diligence',
    tagline: 'Comprehensive property verification for overseas Pakistanis',
    deliverables: [
      'Complete property verification report',
      'Title document authentication',
      'Ownership verification',
      'Legal status assessment',
      'Written legal opinion',
      'Evidence-based findings'
    ],
    processSteps: [
      {
        title: 'Request & Documentation',
        description: 'Submit property details, provide available documents, specify verification scope, pay initial fee',
        duration: '1-2 days'
      },
      {
        title: 'Document Review',
        description: 'Review title documents, check ownership records, verify seller identity, examine property papers',
        duration: '3-5 days'
      },
      {
        title: 'On-Ground Verification',
        description: 'Physical site visit in Pakistan, survey/measurement verification, check encumbrances, interview neighbors, photograph documentation',
        duration: '5-7 days'
      },
      {
        title: 'Legal Records Check',
        description: 'Revenue office verification, court records search, check for disputes/liens, verify NOCs and approvals',
        duration: '5-7 days'
      },
      {
        title: 'Report Preparation',
        description: 'Compile findings, legal opinion drafting, risk assessment, recommendations, final report delivery',
        duration: '3-5 days'
      }
    ],
    documentCategories: [
      { id: 'property', name: 'Property Information', description: 'Basic property details and identifiers', order: 1 },
      { id: 'documents', name: 'Existing Documents', description: 'Any documents already available', order: 2 },
      { id: 'client', name: 'Client Information', description: 'Your identification and details', order: 3 }
    ],
    requiredDocuments: [
      {
        id: 'property-address',
        name: 'Property Address/Location Details',
        description: 'Complete address or precise location of the property',
        required: true,
        category: 'property',
        formats: ['Text', 'PDF', 'DOC'],
        notes: 'Be as specific as possible. Include: Street, sector/block, phase, city'
      },
      {
        id: 'plot-file-number',
        name: 'Plot/File Number',
        description: 'Plot number or file number assigned by society/authority',
        required: true,
        category: 'property',
        notes: 'As mentioned in sale documents or booking forms'
      },
      {
        id: 'khasra-number',
        name: 'Khasra Number (if available)',
        description: 'Revenue record identification number',
        required: false,
        category: 'property',
        notes: 'If property is located in rural area or has revenue record. Not always available for urban properties.'
      },
      {
        id: 'seller-documents',
        name: 'Any Documents from Seller',
        description: 'Copies of any documents provided by property seller',
        required: false,
        category: 'documents',
        formats: ['PDF', 'JPG', 'PNG'],
        alternatives: ['Allotment letter', 'Transfer letter', 'Previous sale deed', 'Registry', 'Possession letter'],
        notes: 'Any and all documents you have received. We will verify their authenticity.'
      },
      {
        id: 'sale-agreement',
        name: 'Sale Agreement (if exists)',
        description: 'Draft or signed sale agreement',
        required: false,
        category: 'documents',
        formats: ['PDF', 'DOC', 'DOCX'],
        notes: 'If you have already signed an agreement, provide a copy for review'
      },
      {
        id: 'client-cnic',
        name: 'Your CNIC/Passport Copy',
        description: 'Your national identity card or passport',
        required: true,
        category: 'client',
        copies: 2,
        formats: ['PDF', 'JPG', 'PNG'],
        notes: 'For Pakistani nationals: CNIC. For overseas: Passport or NICOP'
      },
      {
        id: 'seller-contact',
        name: 'Contact Details of Seller (if available)',
        description: 'Name, phone, and address of property seller',
        required: false,
        category: 'client',
        notes: 'If available and seller is cooperative, helps speed up verification'
      }
    ],
    timeline: '3-4 weeks',
    formSections: [
      {
        title: 'Property Details',
        fields: [
          {
            label: 'Property Type',
            type: 'select',
            required: true,
            options: ['Residential plot', 'House', 'Apartment', 'Commercial', 'Agricultural land']
          },
          {
            label: 'Complete Address',
            type: 'textarea',
            required: true
          },
          {
            label: 'City',
            type: 'text',
            required: true
          },
          {
            label: 'Society/Scheme Name',
            type: 'text',
            required: false
          },
          {
            label: 'Plot/File Number',
            type: 'text',
            required: false
          },
          {
            label: 'Khasra/Survey Number',
            type: 'text',
            required: false
          },
          {
            label: 'Property Size',
            type: 'text',
            required: true,
            placeholder: 'e.g., 5 marla, 1000 sq yd'
          }
        ]
      },
      {
        title: 'Seller Information',
        fields: [
          {
            label: 'Seller Name',
            type: 'text',
            required: false
          },
          {
            label: 'Seller CNIC',
            type: 'text',
            required: false
          },
          {
            label: 'Contact Number',
            type: 'tel',
            required: false
          },
          {
            label: 'Relationship to Property',
            type: 'select',
            required: false,
            options: ['Owner', 'Agent', 'Heir', 'Unknown']
          }
        ]
      },
      {
        title: 'Verification Scope',
        fields: [
          {
            label: 'Select Verification Services',
            type: 'checkbox',
            required: true,
            options: ['Ownership verification', 'Title document authentication', 'Physical site inspection', 'Court records check', 'Revenue records verification', 'Society/DHA verification', 'Encumbrance check', 'Market value assessment']
          }
        ]
      },
      {
        title: 'Transaction Details',
        fields: [
          {
            label: 'Asking Price (PKR)',
            type: 'number',
            required: false
          },
          {
            label: 'Your Budget (PKR)',
            type: 'number',
            required: false
          },
          {
            label: 'Intended Use',
            type: 'select',
            required: true,
            options: ['Investment', 'Residence', 'Resale']
          },
          {
            label: 'Timeline',
            type: 'select',
            required: true,
            options: ['Urgent', 'Within 1 month', 'Flexible']
          }
        ]
      },
      {
        title: 'Documents Available',
        fields: [
          {
            label: 'Documents You Have',
            type: 'checkbox',
            required: false,
            options: ['Sale agreement', 'Allotment letter', 'Transfer documents', 'Fard/registry', 'NOCs', 'Payment receipts', 'None available']
          }
        ]
      },
      {
        title: 'Your Details',
        fields: [
          {
            label: 'Current Country',
            type: 'text',
            required: true
          },
          {
            label: 'NICOP/Passport Number',
            type: 'text',
            required: true
          },
          {
            label: 'Contact (WhatsApp)',
            type: 'tel',
            required: true
          },
          {
            label: 'Email',
            type: 'email',
            required: true
          }
        ]
      },
      {
        title: 'Concerns',
        fields: [
          {
            label: 'Any Concerns or Red Flags',
            type: 'textarea',
            required: false,
            placeholder: 'Describe any concerns you have about this property'
          }
        ]
      }
    ],
    faqs: [
      {
        question: 'How thorough is the verification?',
        answer: 'We check documents, physical site, revenue records, courts, and conduct local inquiries.'
      },
      {
        question: 'What if property has issues?',
        answer: 'We provide detailed findings with legal opinion and recommendations.'
      },
      {
        question: 'Can you verify before I commit?',
        answer: 'Yes, that\'s the purpose - verify before you invest.'
      }
    ]
  },

  // 20. SALE, PURCHASE & TRANSFER OF PROPERTY
  {
    slug: 'sale-purchase-transfer-property',
    title: 'Sale, Purchase & Transfer of Property',
    tagline: 'Complete property transaction services for overseas Pakistanis',
    deliverables: [
      'Complete sale/purchase documentation',
      'Power of Attorney execution',
      'Stamp duty payment',
      'Registration with authorities',
      'Mutation in revenue records',
      'Transfer deed',
      'Updated property documents'
    ],
    processSteps: [
      {
        title: 'Agreement & POA',
        description: 'Review property documents, draft sale agreement, prepare Power of Attorney, POA attestation from embassy, send POA to Pakistan',
        duration: '1 week'
      },
      {
        title: 'Documentation Preparation',
        description: 'Verify all property papers, draft transfer deed, calculate stamp duty, prepare mutation application, get seller\'s documents',
        duration: '1 week'
      },
      {
        title: 'Payment & Registration',
        description: 'Coordinate payment (via POA holder), pay stamp duty, register deed at sub-registrar, obtain registered documents',
        duration: '3-5 days'
      },
      {
        title: 'Mutation & Transfer',
        description: 'Apply for mutation, submit to revenue office, attend mutation hearing (via POA), obtain mutation order, update Fard',
        duration: '2-3 weeks'
      },
      {
        title: 'Post-Transfer',
        description: 'Transfer utilities, get possession, provide all documents, final reporting',
        duration: '1 week'
      }
    ],
    documentCategories: [
      { id: 'client', name: 'Client Documents', description: 'Your identification and authorization', order: 1 },
      { id: 'property', name: 'Property Documents', description: 'Property ownership and title documents', order: 2 },
      { id: 'counterparty', name: 'Counterparty Documents', description: 'Other party identification and documents', order: 3 },
      { id: 'financial', name: 'Financial Documents', description: 'Payment and transaction proof', order: 4 }
    ],
    requiredDocuments: [
      {
        id: 'client-id',
        name: 'Your CNIC/NICOP/Passport',
        description: 'Your identification document',
        required: true,
        category: 'client',
        copies: 2,
        formats: ['PDF', 'JPG', 'PNG'],
        notes: 'For residents: CNIC. For overseas Pakistanis: NICOP or Passport'
      },
      {
        id: 'power-of-attorney',
        name: 'Power of Attorney (attested)',
        description: 'Registered and attested POA for representative',
        required: false,
        category: 'client',
        condition: {
          field: 'Representation',
          operator: 'equals',
          value: 'attorney'
        },
        formats: ['PDF'],
        notes: 'Required if you are overseas or using a representative. Must be attested by Pakistan Embassy/Consulate.'
      },
      {
        id: 'payment-proof',
        name: 'Payment Proof/Bank Details',
        description: 'Proof of funds or payment made for property',
        required: true,
        category: 'financial',
        formats: ['PDF'],
        alternatives: ['Bank statement', 'Pay orders', 'Wire transfer receipts', 'Cheque copies'],
        notes: 'To establish source of funds and payment trail'
      },
      {
        id: 'seller-property-docs',
        name: 'Property Documents from Seller',
        description: 'All property documents provided by seller',
        required: true,
        category: 'property',
        formats: ['PDF'],
        alternatives: ['Original title deed', 'Allotment letter', 'Transfer documents', 'Previous sale deeds'],
        notes: 'Complete chain of ownership documents. We will verify authenticity.'
      },
      {
        id: 'seller-cnic',
        name: "Seller's CNIC",
        description: 'Copy of seller\'s national identity card',
        required: true,
        category: 'counterparty',
        copies: 2,
        formats: ['PDF', 'JPG', 'PNG'],
        notes: 'Both sides. Must match name on property documents.'
      },
      {
        id: 'sale-agreement',
        name: 'Sale Agreement',
        description: 'Signed agreement between buyer and seller',
        required: true,
        category: 'property',
        formats: ['PDF', 'DOC', 'DOCX'],
        notes: 'We can draft this or you can provide your draft for review'
      },
      {
        id: 'original-property-docs',
        name: 'Original Property Documents (for sale)',
        description: 'Original ownership documents',
        required: false,
        category: 'property',
        condition: {
          field: 'Transaction Type',
          operator: 'equals',
          value: 'Sell property'
        },
        formats: ['PDF', 'Original physical documents'],
        notes: 'Required if you are the seller. Include all original title documents.'
      },
      {
        id: 'fard-registry',
        name: 'Fard/Registry',
        description: 'Current land registry document or Fard',
        required: true,
        category: 'property',
        formats: ['PDF'],
        notes: 'Recent Fard from revenue office showing current ownership'
      },
      {
        id: 'property-tax-receipts',
        name: 'Property Tax Receipts',
        description: 'Proof of paid property taxes',
        required: true,
        category: 'property',
        formats: ['PDF', 'JPG'],
        notes: 'Last 3 years property tax receipts. All dues must be cleared.'
      }
    ],
    timeline: '6-8 weeks',
    formSections: [
      {
        title: 'Transaction Type',
        fields: [
          {
            label: 'Select Transaction',
            type: 'select',
            required: true,
            options: ['Purchase property', 'Sell property', 'Transfer to family member', 'Gift deed']
          }
        ]
      },
      {
        title: 'Your Details',
        fields: [
          {
            label: 'Full Name (as per Passport)',
            type: 'text',
            required: true
          },
          {
            label: 'NICOP/Passport Number',
            type: 'text',
            required: true
          },
          {
            label: 'Current Country',
            type: 'text',
            required: true
          },
          {
            label: 'Address Abroad',
            type: 'textarea',
            required: true
          },
          {
            label: 'WhatsApp',
            type: 'tel',
            required: true
          },
          {
            label: 'Email',
            type: 'email',
            required: true
          }
        ]
      },
      {
        title: 'Property Details',
        fields: [
          {
            label: 'Property Type',
            type: 'select',
            required: true,
            options: ['Plot', 'House', 'Apartment', 'Commercial']
          },
          {
            label: 'Address',
            type: 'textarea',
            required: true
          },
          {
            label: 'City',
            type: 'text',
            required: true
          },
          {
            label: 'Size',
            type: 'text',
            required: true,
            placeholder: 'e.g., 5 marla, 1000 sq yd'
          },
          {
            label: 'Current Owner',
            type: 'text',
            required: true
          },
          {
            label: 'Khasra Number',
            type: 'text',
            required: false
          }
        ]
      },
      {
        title: 'For Purchase',
        fields: [
          {
            label: 'Seller Name',
            type: 'text',
            required: false
          },
          {
            label: 'Seller CNIC',
            type: 'text',
            required: false
          },
          {
            label: 'Agreed Price (PKR)',
            type: 'number',
            required: false
          },
          {
            label: 'Payment Method',
            type: 'select',
            required: false,
            options: ['Cash', 'Bank transfer', 'Installments']
          },
          {
            label: 'Payment Status',
            type: 'select',
            required: false,
            options: ['Paid', 'Will pay on registration']
          },
          {
            label: 'Possession',
            type: 'select',
            required: false,
            options: ['Immediate', 'After registration', 'Other']
          }
        ]
      },
      {
        title: 'For Sale',
        fields: [
          {
            label: 'Buyer Name',
            type: 'text',
            required: false
          },
          {
            label: 'Buyer CNIC',
            type: 'text',
            required: false
          },
          {
            label: 'Sale Price (PKR)',
            type: 'number',
            required: false
          },
          {
            label: 'Payment Terms',
            type: 'text',
            required: false
          },
          {
            label: 'Current Possession',
            type: 'select',
            required: false,
            options: ['With me', 'Tenant', 'Empty']
          }
        ]
      },
      {
        title: 'Power of Attorney',
        fields: [
          {
            label: 'Do you have POA?',
            type: 'select',
            required: true,
            options: ['Yes', 'No (we\'ll prepare)']
          },
          {
            label: 'POA Holder Name',
            type: 'text',
            required: false
          },
          {
            label: 'POA Holder CNIC',
            type: 'text',
            required: false
          },
          {
            label: 'POA Attestation Status',
            type: 'select',
            required: false,
            options: ['Done', 'Need assistance']
          }
        ]
      },
      {
        title: 'Timeline & Services',
        fields: [
          {
            label: 'How Urgent',
            type: 'select',
            required: true,
            options: ['Very urgent', 'Within 1 month', 'Flexible']
          },
          {
            label: 'Additional Services Needed',
            type: 'checkbox',
            required: false,
            options: ['Property verification before purchase', 'Loan arrangement', 'Possession assistance', 'Rent agreement preparation']
          }
        ]
      }
    ],
    faqs: [
      {
        question: 'Can I buy/sell without visiting Pakistan?',
        answer: 'Yes, through Power of Attorney representation.'
      },
      {
        question: 'Who can be my POA holder?',
        answer: 'Trusted family member, friend, or our representative service.'
      },
      {
        question: 'How is payment handled?',
        answer: 'We coordinate but don\'t handle money - direct between parties or through escrow.'
      }
    ]
  },

  // 21. PROPERTY DISPUTES & ILLEGAL POSSESSION
  {
    slug: 'property-disputes-illegal-possession',
    title: 'Property Disputes & Illegal Possession',
    tagline: 'Legal action against property grabbing and disputes',
    deliverables: [
      'Legal case filing',
      'Court representation',
      'Recovery proceedings',
      'Police complaint assistance',
      'Regular case updates',
      'Final judgment execution'
    ],
    processSteps: [
      {
        title: 'Case Assessment',
        description: 'Review all documents, assess legal position, visit disputed property, gather evidence, legal strategy formulation',
        duration: '3-5 days'
      },
      {
        title: 'Legal Notice',
        description: 'Draft legal notice, send to illegal occupants, wait for response period, document non-compliance',
        duration: '1 week'
      },
      {
        title: 'Court Filing',
        description: 'Prepare case documents, file suit in relevant court, pay court fees, get case number, serve notice to defendants',
        duration: '1-2 weeks'
      },
      {
        title: 'Court Proceedings',
        description: 'Attend hearings (via POA), present evidence, cross-examination, arguments presentation, interim orders if applicable',
        duration: '6-18 months'
      },
      {
        title: 'Judgment & Execution',
        description: 'Obtain court judgment, execute decree, police assistance for possession, hand over property, update records',
        duration: '2-6 months'
      }
    ],
    documentCategories: [
      { id: 'property', name: 'Property Documents', description: 'Ownership and title proof', order: 1 },
      { id: 'evidence', name: 'Evidence', description: 'Proof of illegal possession or dispute', order: 2 },
      { id: 'legal', name: 'Legal Documents', description: 'Previous legal actions', order: 3 },
      { id: 'client', name: 'Client Documents', description: 'Your identification', order: 4 }
    ],
    requiredDocuments: [
      {
        id: 'property-ownership',
        name: 'Property Ownership Documents',
        description: 'Documents proving your ownership of the property',
        required: true,
        category: 'property',
        formats: ['PDF'],
        alternatives: ['Sale deed', 'Gift deed', 'Inheritance documents', 'Registry'],
        notes: 'All documents establishing your legal ownership'
      },
      {
        id: 'fard-registry',
        name: 'Fard/Registry',
        description: 'Current land registry record',
        required: true,
        category: 'property',
        formats: ['PDF'],
        notes: 'Recent Fard from revenue office showing ownership'
      },
      {
        id: 'title-documents',
        name: 'Sale Deed/Title Documents',
        description: 'Original title and chain documents',
        required: true,
        category: 'property',
        formats: ['PDF'],
        notes: 'Complete chain of title showing how property came into your ownership'
      },
      {
        id: 'property-tax',
        name: 'Property Tax Receipts',
        description: 'Proof of paid property taxes',
        required: true,
        category: 'property',
        formats: ['PDF', 'JPG'],
        notes: 'Shows you have been paying taxes, supporting ownership claim'
      },
      {
        id: 'occupation-photos',
        name: 'Photographs of Illegal Occupation',
        description: 'Visual evidence of illegal possession',
        required: true,
        category: 'evidence',
        formats: ['JPG', 'PNG'],
        notes: 'Date-stamped photos showing illegal occupants and their actions'
      },
      {
        id: 'witness-statements',
        name: 'Witness Statements',
        description: 'Written statements from witnesses',
        required: false,
        category: 'evidence',
        formats: ['PDF', 'DOC', 'DOCX'],
        notes: 'Affidavits from neighbors or others who witnessed the illegal occupation'
      },
      {
        id: 'police-complaint',
        name: 'Police Complaint (if filed)',
        description: 'Copy of FIR or complaint filed with police',
        required: false,
        category: 'legal',
        formats: ['PDF'],
        notes: 'If you have already approached police about the illegal possession'
      },
      {
        id: 'previous-notices',
        name: 'Previous Legal Notices',
        description: 'Copies of any legal notices sent to occupants',
        required: false,
        category: 'legal',
        formats: ['PDF'],
        notes: 'Any prior  communication or legal action taken'
      },
      {
        id: 'client-nicop',
        name: 'Your NICOP/Passport',
        description: 'Your identification document',
        required: true,
        category: 'client',
        copies: 2,
        formats: ['PDF', 'JPG', 'PNG'],
        notes: 'For overseas Pakistanis: NICOP or Passport'
      },
      {
        id: 'power-of-attorney',
        name: 'Power of Attorney (attested)',
        description: 'Attested POA if using representative',
        required: false,
        category: 'client',
        condition: {
          field: 'Representation',
          operator: 'equals',
          value: 'attorney'
        },
        formats: ['PDF'],
        notes: 'Required if you are overseas. Must be attested by Pakistan Embassy.'
      }
    ],
    timeline: '12-24 months',
    formSections: [
      {
        title: 'Property Details',
        fields: [
          {
            label: 'Property Address',
            type: 'textarea',
            required: true
          },
          {
            label: 'Property Type',
            type: 'select',
            required: true,
            options: ['Residential', 'Commercial', 'Agricultural']
          },
          {
            label: 'Size',
            type: 'text',
            required: true
          },
          {
            label: 'Your Ownership Since',
            type: 'date',
            required: true
          },
          {
            label: 'Registration Details',
            type: 'text',
            required: true
          }
        ]
      },
      {
        title: 'Dispute Nature',
        fields: [
          {
            label: 'Type of Dispute',
            type: 'select',
            required: true,
            options: ['Illegal possession/occupation', 'Land grabbing', 'Boundary dispute', 'Fraudulent sale', 'Family dispute', 'Tenant not vacating', 'Encroachment', 'Other']
          }
        ]
      },
      {
        title: 'Illegal Occupant Details',
        fields: [
          {
            label: 'Name (if known)',
            type: 'text',
            required: false
          },
          {
            label: 'CNIC (if available)',
            type: 'text',
            required: false
          },
          {
            label: 'Since When Occupying',
            type: 'date',
            required: false
          },
          {
            label: 'Number of Occupants',
            type: 'number',
            required: false
          },
          {
            label: 'Their Claim (if any)',
            type: 'textarea',
            required: false
          },
          {
            label: 'Armed/Aggressive?',
            type: 'select',
            required: true,
            options: ['Yes', 'No']
          }
        ]
      },
      {
        title: 'Your Ownership Proof',
        fields: [
          {
            label: 'How Acquired',
            type: 'select',
            required: true,
            options: ['Purchase', 'Inheritance', 'Gift', 'Allotment']
          },
          {
            label: 'Registration Date',
            type: 'date',
            required: true
          },
          {
            label: 'Mutation Status',
            type: 'select',
            required: true,
            options: ['Done', 'Pending', 'Not done']
          },
          {
            label: 'Last Visit to Property',
            type: 'date',
            required: false
          }
        ]
      },
      {
        title: 'Previous Actions Taken',
        fields: [
          {
            label: 'Actions Already Taken',
            type: 'checkbox',
            required: false,
            options: ['Verbal warning', 'Written notice', 'Police complaint', 'Court case', 'None']
          }
        ]
      },
      {
        title: 'Evidence Available',
        fields: [
          {
            label: 'Evidence You Have',
            type: 'checkbox',
            required: true,
            options: ['Property documents', 'Photographs', 'Video evidence', 'Witness statements', 'Correspondence with occupant', 'Police report']
          }
        ]
      },
      {
        title: 'Urgency & Outcome',
        fields: [
          {
            label: 'Risk Level',
            type: 'select',
            required: true,
            options: ['High (property being damaged)', 'Medium (occupation strengthening)', 'Low (recent occupation)']
          },
          {
            label: 'Desired Outcome',
            type: 'checkbox',
            required: true,
            options: ['Vacant possession', 'Compensation', 'Criminal action', 'Injunction']
          }
        ]
      }
    ],
    faqs: [
      {
        question: 'How long do property cases take?',
        answer: 'Typically 12-24 months, depends on case complexity and court schedule.'
      },
      {
        question: 'Do I need to come to Pakistan?',
        answer: 'No, we handle everything via Power of Attorney.'
      },
      {
        question: 'What if occupants are dangerous?',
        answer: 'We coordinate with police and seek court protection orders.'
      }
    ]
  },

  // 22. POWER OF ATTORNEY (POA) SERVICES
  {
    slug: 'power-of-attorney-services',
    title: 'Power of Attorney (POA) Services',
    tagline: 'Legal authorization documents for overseas Pakistanis',
    deliverables: [
      'Customized POA drafting',
      'Legal safeguards included',
      'Embassy attestation guidance',
      'Registration in Pakistan',
      'POA cancellation (if needed)',
      'Revocation documentation'
    ],
    processSteps: [
      {
        title: 'Requirement Discussion',
        description: 'Understand purpose of POA, define scope and powers, identify POA holder, draft customized document',
        duration: '1-2 days'
      },
      {
        title: 'POA Drafting',
        description: 'Prepare comprehensive POA, include protective clauses, specify limitations, your review and approval',
        duration: '2-3 days'
      },
      {
        title: 'Execution Abroad',
        description: 'Sign before notary public, Pakistani embassy attestation, legalization/apostille, send to Pakistan',
        duration: '1-2 weeks'
      },
      {
        title: 'Pakistan Registration',
        description: 'Register with sub-registrar, pay stamp duty, obtain registered POA, provide to POA holder',
        duration: '1 week'
      },
      {
        title: 'Activation & Monitoring',
        description: 'POA holder uses as needed, we monitor usage, regular reporting, revoke if misused',
        duration: 'Ongoing'
      }
    ],
    documentCategories: [
      { id: 'principal', name: 'Principal Documents', description: 'Your identification documents', order: 1 },
      { id: 'attorney', name: 'Attorney Documents', description: 'POA holder identification', order: 2 },
      { id: 'purpose', name: 'Purpose Documents', description: 'Documents related to POA purpose', order: 3 }
    ],
    requiredDocuments: [
      {
        id: 'principal-passport',
        name: 'Your Passport/NICOP Copy',
        description: 'Your identification document',
        required: true,
        category: 'principal',
        copies: 2,
        formats: ['PDF', 'JPG', 'PNG'],
        notes: 'Passport or NICOP. Must be valid.'
      },
      {
        id: 'attorney-cnic',
        name: 'CNIC of POA Holder',
        description: 'National identity card of person you are authorizing',
        required: true,
        category: 'attorney',
        copies: 2,
        formats: ['PDF', 'JPG', 'PNG'],
        notes: 'Both sides. Must be valid.'
      },
      {
        id: 'purpose-documentation',
        name: 'Purpose Documentation',
        description: 'Documents related to matters POA will handle',
        required: false,
        category: 'purpose',
        formats: ['PDF'],
        notes: 'Property papers for property matters, etc.'
      },
      {
        id: 'address-proof',
        name: 'Address Proof',
        description: 'Proof of your overseas address',
        required: true,
        category: 'principal',
        formats: ['PDF'],
        alternatives: ['Utility bill', 'Bank statement'],
        notes: 'Document showing current address abroad'
      },
      {
        id: 'relationship-proof',
        name: 'Relationship Proof with POA Holder',
        description: 'Document showing relationship',
        required: false,
        category: 'attorney',
        formats: ['PDF'],
        notes: 'If POA holder is family member'
      },
      {
        id: 'previous-poa',
        name: 'Previous POA (if replacing)',
        description: 'Copy of old POA',
        required: false,
        category: 'purpose',
        formats: ['PDF'],
        notes: 'Only if replacing existing POA'
      }
    ],
    timeline: '3-4 weeks',
    formSections: [
      {
        title: 'Your Details',
        fields: [
          {
            label: 'Full Name (as per Passport)',
            type: 'text',
            required: true
          },
          {
            label: 'Passport/NICOP Number',
            type: 'text',
            required: true
          },
          {
            label: "Father's Name",
            type: 'text',
            required: true
          },
          {
            label: 'Date of Birth',
            type: 'date',
            required: true
          },
          {
            label: 'Current Country',
            type: 'text',
            required: true
          },
          {
            label: 'Full Address Abroad',
            type: 'textarea',
            required: true
          },
          {
            label: 'Contact',
            type: 'tel',
            required: true
          },
          {
            label: 'Email',
            type: 'email',
            required: true
          }
        ]
      },
      {
        title: 'POA Holder Details',
        fields: [
          {
            label: 'Full Name',
            type: 'text',
            required: true
          },
          {
            label: 'CNIC Number',
            type: 'text',
            required: true
          },
          {
            label: "Father's Name",
            type: 'text',
            required: true
          },
          {
            label: 'Relationship with You',
            type: 'text',
            required: true
          },
          {
            label: 'Address in Pakistan',
            type: 'textarea',
            required: true
          },
          {
            label: 'Contact Number',
            type: 'tel',
            required: true
          },
          {
            label: 'Occupation',
            type: 'text',
            required: false
          }
        ]
      },
      {
        title: 'Purpose of POA',
        fields: [
          {
            label: 'Main Purpose',
            type: 'select',
            required: true,
            options: ['Property sale', 'Property purchase', 'Property management', 'Bank transactions', 'Legal representation', 'Business operations', 'NADRA/government matters', 'General (multiple purposes)', 'Other']
          }
        ]
      },
      {
        title: 'Specific Powers to Grant',
        fields: [
          {
            label: 'Powers',
            type: 'checkbox',
            required: true,
            options: ['Sign documents', 'Sell property', 'Purchase property', 'Receive/pay money', 'Appear in court', 'Sign agreements', 'File applications', 'Collect documents', 'Open/close bank accounts', 'File tax returns']
          }
        ]
      },
      {
        title: 'Limitations/Restrictions',
        fields: [
          {
            label: 'Maximum Transaction Value (PKR)',
            type: 'number',
            required: false
          },
          {
            label: 'Specific Properties Only',
            type: 'text',
            required: false,
            placeholder: 'List specific properties if limited'
          },
          {
            label: 'Time Limit',
            type: 'text',
            required: false,
            placeholder: 'months/years'
          },
          {
            label: 'Require Approval For',
            type: 'text',
            required: false
          },
          {
            label: 'Cannot Do',
            type: 'textarea',
            required: false,
            placeholder: 'List prohibited actions'
          }
        ]
      },
      {
        title: 'Safeguards Needed',
        fields: [
          {
            label: 'Select Safeguards',
            type: 'checkbox',
            required: false,
            options: ['Require written approval for major decisions', 'Limited to specific property', 'Monetary limits', 'Time-bound validity', 'Revocable anytime', 'Regular reporting required']
          }
        ]
      },
      {
        title: 'POA Duration',
        fields: [
          {
            label: 'Duration Type',
            type: 'select',
            required: true,
            options: ['Until specific purpose completed', 'Time-bound (specify years)', 'Indefinite (revocable)']
          }
        ]
      },
      {
        title: 'Property Details (if applicable)',
        fields: [
          {
            label: 'Address',
            type: 'textarea',
            required: false
          },
          {
            label: 'Khasra Number',
            type: 'text',
            required: false
          },
          {
            label: 'Size',
            type: 'text',
            required: false
          }
        ]
      },
      {
        title: 'Attestation Information',
        fields: [
          {
            label: 'Will Get Attested At',
            type: 'select',
            required: true,
            options: ['Embassy', 'Consulate', 'Notary']
          },
          {
            label: 'Expected Attestation Date',
            type: 'date',
            required: false
          }
        ]
      },
      {
        title: 'Existing POA',
        fields: [
          {
            label: 'Have You Given POA Before?',
            type: 'select',
            required: true,
            options: ['Yes', 'No']
          },
          {
            label: 'If Yes, to Whom',
            type: 'text',
            required: false
          },
          {
            label: 'Status',
            type: 'select',
            required: false,
            options: ['Active', 'Cancelled', 'Expired']
          }
        ]
      }
    ],
    faqs: [
      {
        question: 'Can I limit POA powers?',
        answer: 'Yes, we draft specific, limited POAs with safeguards.'
      },
      {
        question: 'How to cancel POA?',
        answer: 'We prepare revocation deed and publish notice.'
      },
      {
        question: 'Is embassy attestation mandatory?',
        answer: 'Yes, for POAs executed abroad to be valid in Pakistan.'
      }
    ]
  },

  // 23. FAMILY LAW (DIVORCE, CUSTODY, MAINTENANCE)
  {
    slug: 'family-law-divorce-custody-maintenance',
    title: 'Family Law (Divorce, Custody, Maintenance)',
    tagline: 'Legal representation for family matters',
    deliverables: [
      'Legal notice drafting',
      'Court filing',
      'Representation at hearings',
      'Negotiation with other party',
      'Custody arrangements',
      'Maintenance orders',
      'Final decree/judgment'
    ],
    processSteps: [
      {
        title: 'Consultation & Strategy',
        description: 'Understand your situation, assess legal position, explain Pakistani law implications, strategy formulation, Power of Attorney preparation',
        duration: '3-5 days'
      },
      {
        title: 'Legal Notice',
        description: 'Draft legal notice, send to other party, wait for response, document their response',
        duration: '1-2 weeks'
      },
      {
        title: 'Court Filing',
        description: 'Prepare petition/suit, file in family court, pay court fees, serve notice to other party',
        duration: '2-3 weeks'
      },
      {
        title: 'Proceedings',
        description: 'Attend hearings (via lawyer), settlement attempts, evidence presentation, mediation/arbitration, interim orders (custody/maintenance)',
        duration: '4-12 months'
      },
      {
        title: 'Final Order',
        description: 'Final judgment, custody determination, maintenance amount fixed, decree issuance',
        duration: '1-3 months'
      }
    ],
    documentCategories: [
      { id: 'marriage', name: 'Marriage Documents', description: 'Marriage proof and identification', order: 1 },
      { id: 'children', name: 'Children Documents', description: 'Documents related to children', order: 2 },
      { id: 'financial', name: 'Financial Documents', description: 'Income and financial records', order: 3 },
      { id: 'legal', name: 'Legal Documents', description: 'Authorization and references', order: 4 }
    ],
    requiredDocuments: [
      {
        id: 'nikah-nama',
        name: 'Nikah Nama (Marriage Certificate)',
        description: 'Original marriage certificate',
        required: true,
        category: 'marriage',
        formats: ['PDF', 'JPG', 'PNG'],
        notes: 'Computerized or handwritten nikah nama from union council'
      },
      {
        id: 'cnic-both-parties',
        name: 'CNIC/Passport Copies (Both Parties)',
        description: 'ID documents of husband and wife',
        required: true,
        category: 'marriage',
        copies: 2,
        formats: ['PDF', 'JPG', 'PNG'],
        notes: 'Both sides for CNICs. For overseas: Also with NICOP/Passport.'
      },
      {
        id: 'proof-residence',
        name: 'Proof of Residence',
        description: 'Address verification documents',
        required: true,
        category: 'marriage',
        formats: ['PDF'],
        alternatives: ['Utility bills', 'Rent agreement', 'Residency proof'],
        notes: 'For both parties if available'
      },
      {
        id: 'children-birth-certs',
        name: "Children's Birth Certificates",
        description: 'B-Forms or birth certificates of all children',
        required: false,
        category: 'children',
        condition: {
          field: 'Matter Type',
          operator: 'includes',
          value: 'custody'
        },
        formats: ['PDF', 'JPG', 'PNG'],
        notes: 'Required for custody matters. All children from the marriage.'
      },
      {
        id: 'children-documents',
        name: "Children's Documents",
        description: 'Additional documentation about children',
        required: false,
        category: 'children',
        formats: ['PDF'],
        alternatives: ['School records', 'Medical records', 'Vaccination cards'],
        notes: 'Helpful for custody decisions'
      },
      {
        id: 'financial-records',
        name: 'Financial Records',
        description: 'Income and financial documentation',
        required: false,
        category: 'financial',
        condition: {
          field: 'Matter Type',
          operator: 'includes',
          value: 'maintenance'
        },
        formats: ['PDF'],
        alternatives: ['Salary slips', 'Bank statements', 'Business income records', 'Tax returns'],
        notes: 'Required for  maintenance claims. Shows ability to pay or need for maintenance.'
      },
      {
        id: 'income-proof',
        name: 'Income Proof',
        description: 'Documentation of monthly/annual income',
        required: false,
        category: 'financial',
        formats: ['PDF'],
        notes: 'For both parties if available. Determines maintenance amount.'
      },
      {
        id: 'power-of-attorney',
        name: 'Power of Attorney (Attested)',
        description: 'POA for overseas client representation',
        required: false,
        category: 'legal',
        condition: {
          field: 'Current Location',
          operator: 'equals',
          value: 'Overseas'
        },
        formats: ['PDF'],
        notes: 'Required for overseas clients. Must be attested by Pakistan Embassy.'
      },
      {
        id: 'character-references',
        name: 'Character References',
        description: 'Letters from credible persons',
        required: false,
        category: 'legal',
        formats: ['PDF'],
        notes: 'Helpful for custody cases. From employers, teachers, community leaders.'
      }
    ],
    timeline: '6-18 months',
    formSections: [
      {
        title: 'Your Details',
        fields: [
          {
            label: 'Full Name',
            type: 'text',
            required: true
          },
          {
            label: 'NICOP/Passport Number',
            type: 'text',
            required: true
          },
          {
            label: 'Current Country',
            type: 'text',
            required: true
          },
          {
            label: 'Address Abroad',
            type: 'textarea',
            required: true
          },
          {
            label: 'Contact (WhatsApp)',
            type: 'tel',
            required: true
          },
          {
            label: 'Email',
            type: 'email',
            required: true
          }
        ]
      },
      {
        title: 'Spouse Details',
        fields: [
          {
            label: 'Full Name',
            type: 'text',
            required: true
          },
          {
            label: 'CNIC (if available)',
            type: 'text',
            required: false
          },
          {
            label: 'Current Location',
            type: 'text',
            required: false
          },
          {
            label: 'Contact (if available)',
            type: 'tel',
            required: false
          },
          {
            label: 'Occupation',
            type: 'text',
            required: false
          }
        ]
      },
      {
        title: 'Marriage Details',
        fields: [
          {
            label: 'Marriage Date (as per Nikah Nama)',
            type: 'date',
            required: true
          },
          {
            label: 'Place of Marriage',
            type: 'text',
            required: true
          },
          {
            label: 'Marriage Registration Number',
            type: 'text',
            required: false
          },
          {
            label: 'Years Married',
            type: 'number',
            required: true
          }
        ]
      },
      {
        title: 'Matter Type',
        fields: [
          {
            label: 'Select Matter',
            type: 'checkbox',
            required: true,
            options: ['Divorce (Khula)', 'Divorce (Talaq confirmation)', 'Child custody', 'Maintenance/alimony']
          }
        ]
      },
      {
        title: 'Children',
        fields: [
          {
            label: 'Child Name',
            type: 'text',
            required: false
          },
          {
            label: 'Age',
            type: 'number',
            required: false
          },
          {
            label: 'Gender',
            type: 'select',
            required: false,
            options: ['Male', 'Female']
          },
          {
            label: 'Currently With',
            type: 'select',
            required: false,
            options: ['You', 'Spouse', 'Other']
          },
          {
            label: 'School/Education',
            type: 'text',
            required: false
          }
        ]
      },
      {
        title: 'Current Situation',
        fields: [
          {
            label: 'Living Status',
            type: 'select',
            required: true,
            options: ['Separated', 'Together but divorcing', 'Already divorced (confirming)']
          },
          {
            label: 'Separation Date (if any)',
            type: 'date',
            required: false
          },
          {
            label: 'Communication with Spouse',
            type: 'select',
            required: true,
            options: ['Ongoing', 'Stopped', 'Hostile']
          }
        ]
      },
      {
        title: 'Grounds/Reasons',
        fields: [
          {
            label: 'Brief Description of Main Issues',
            type: 'textarea',
            required: true,
            placeholder: 'Confidential - describe situation'
          }
        ]
      },
      {
        title: 'Previous Actions',
        fields: [
          {
            label: 'Previous Actions Taken',
            type: 'checkbox',
            required: false,
            options: ['Family mediation attempted', 'Lawyer consultation', 'Court case filed', 'Police involvement', 'Nothing yet']
          }
        ]
      },
      {
        title: 'Desired Outcome',
        fields: [
          {
            label: 'For Divorce',
            type: 'checkbox',
            required: false,
            options: ['Quick divorce', 'Divorce with custody', 'Divorce with maintenance', 'Divorce with property settlement']
          },
          {
            label: 'For Custody',
            type: 'select',
            required: false,
            options: ['Full custody', 'Joint custody', 'Visitation rights']
          },
          {
            label: 'For Maintenance - Amount Sought (PKR monthly)',
            type: 'number',
            required: false
          },
          {
            label: 'Maintenance For',
            type: 'select',
            required: false,
            options: ['Self', 'Children', 'Both']
          }
        ]
      },
      {
        title: 'Urgency & Special Circumstances',
        fields: [
          {
            label: 'Urgency Level',
            type: 'select',
            required: true,
            options: ['Very urgent (abuse/danger)', 'Urgent (children affected)', 'Standard process']
          },
          {
            label: 'Special Circumstances',
            type: 'checkbox',
            required: false,
            options: ['Domestic violence', 'Child abuse concerns', 'International custody issues', 'Spouse in Pakistan, you abroad', 'Both parties abroad']
          }
        ]
      }
    ],
    faqs: [
      {
        question: 'Can I get divorce while living abroad?',
        answer: 'Yes, through Power of Attorney representation.'
      },
      {
        question: 'How long does divorce take?',
        answer: 'Khula: 2-4 months, Talaq confirmation: 6-12 months.'
      },
      {
        question: 'Can I get child custody if abroad?',
        answer: 'Yes, but practically challenging - courts consider child\'s welfare.'
      }
    ]
  },

  // 24. INHERITANCE & SUCCESSION MATTERS
  {
    slug: 'inheritance-succession-matters',
    title: 'Inheritance & Succession Matters',
    tagline: 'Islamic inheritance calculation and estate distribution',
    deliverables: [
      'Succession certificate',
      'Inheritance calculation per Islamic law',
      'Distribution documentation',
      'Legal heir certificates',
      'Asset transfer documentation',
      'Family settlement deeds'
    ],
    processSteps: [
      {
        title: 'Documentation',
        description: 'Collect death certificate, identify all legal heirs, list all assets/liabilities, gather property documents, NADRA verification',
        duration: '1-2 weeks'
      },
      {
        title: 'Succession Certificate (if needed)',
        description: 'File petition in court, publish newspaper notice, attend hearings, obtain succession certificate',
        duration: '3-6 months'
      },
      {
        title: 'Inheritance Calculation',
        description: 'Calculate shares per Islamic law, prepare distribution chart, identify each heir\'s entitlement, account for debts/liabilities',
        duration: '1 week'
      },
      {
        title: 'Asset Distribution',
        description: 'Transfer bank accounts, property mutation/transfer, share certificates transfer, other asset distribution',
        duration: '2-4 months'
      },
      {
        title: 'Documentation',
        description: 'Family settlement deed, release deeds, final accounts, record updates',
        duration: '2-4 weeks'
      }
    ],
    documentCategories: [
      { id: 'deceased', name: 'Deceased Documents', description: 'Death and identification of deceased', order: 1 },
      { id: 'heirs', name: 'Heirs Documents', description: 'Identification and relationship of heirs', order: 2 },
      { id: 'estate', name: 'Estate Documents', description: 'Assets and liabilities', order: 3 },
      { id: 'legal', name: 'Legal Documents', description: 'Will and legal papers', order: 4 }
    ],
    requiredDocuments: [
      {
        id: 'death-certificate',
        name: 'Death Certificate (Original)',
        description: 'Original death certificate',
        required: true,
        category: 'deceased',
        formats: ['PDF', 'Original physical document'],
        notes: 'From NADRA or union council'
      },
      {
        id: 'deceased-cnic',
        name: 'CNIC of Deceased',
        description: 'Copy of deceased CNIC',
        required: true,
        category: 'deceased',
        formats: ['PDF', 'JPG', 'PNG'],
        notes: 'Both sides if available'
      },
      {
        id: 'frc',
        name: 'Family Registration Certificate',
        description: 'FRC showing family members',
        required: true,
        category: 'heirs',
        formats: ['PDF'],
        notes: 'Shows all legal heirs and relationships'
      },
      {
        id: 'heirs-cnics',
        name: 'CNICs of All Heirs',
        description: 'Identity documents of all legal heirs',
        required: true,
        category: 'heirs',
        copies: 2,
        formats: ['PDF', 'JPG', 'PNG'],
        notes: 'Both sides for all heirs'
      },
      {
        id: 'relationship-proof',
        name: "Heir's Relationship Proof",
        description: 'Documents proving relationship to deceased',
        required: true,
        category: 'heirs',
        formats: ['PDF'],
        alternatives: ['Birth certificates', 'Marriage certificates', 'Family tree'],
        notes: 'For all claimants'
      },
      {
        id: 'property-documents',
        name: 'Property Documents',
        description: 'All property title documents',
        required: false,
        category: 'estate',
        formats: ['PDF'],
        notes: 'Sale deeds, Fard, registry of all properties owned'
      },
      {
        id: 'bank-details',
        name: 'Bank Account Details',
        description: 'Details of all bank accounts',
        required: true,
        category: 'estate',
        formats: ['PDF'],
        notes: 'Statements showing  balances at time of death'
      },
      {
        id: 'investment-certificates',
        name: 'Investment Certificates',
        description: 'Investment and securities documents',
        required: false,
        category: 'estate',
        formats: ['PDF'],
        alternatives: ['Share certificates', 'Prize bonds', 'NSS certificates'],
        notes: 'All investments owned by deceased'
      },
      {
        id: 'will',
        name: 'Will (if exists)',
        description: 'Last will and testament',
        required: false,
        category: 'legal',
        formats: ['PDF'],
        notes: 'If deceased left a will, must be verified'
      },
      {
        id: 'debt-documents',
        name: 'Debt Documents',
        description: 'Records of any debts or liabilities',
        required: false,
        category: 'estate',
        formats: ['PDF'],
        notes: 'Loans, pending bills, outstanding debts'
      },
      {
        id: 'client-nicop',
        name: 'Your NICOP/Passport',
        description: 'Your identification if overseas',
        required: false,
        category: 'heirs',
        condition: {
          field: 'Heir Location',
          operator: 'equals',
          value: 'overseas'
        },
        formats: ['PDF'],
        notes: 'For overseas heirs'
      },
      {
        id: 'power-of-attorney',
        name: 'Power of Attorney',
        description: 'POA for representation',
        required: false,
        category: 'legal',
        condition: {
          field: 'Heir Location',
          operator: 'equals',
          value: 'overseas'
        },
        formats: ['PDF'],
        notes: 'Attested POA for overseas heirs'
      }
    ],
    timeline: '6-12 months',
    formSections: [
      {
        title: 'Deceased Details',
        fields: [
          {
            label: 'Full Name',
            type: 'text',
            required: true
          },
          {
            label: 'CNIC',
            type: 'text',
            required: true
          },
          {
            label: "Father's Name",
            type: 'text',
            required: true
          },
          {
            label: 'Date of Death',
            type: 'date',
            required: true
          },
          {
            label: 'Place of Death',
            type: 'text',
            required: true
          },
          {
            label: 'Last Address',
            type: 'textarea',
            required: true
          },
          {
            label: 'Religion',
            type: 'text',
            required: true
          },
          {
            label: 'Marital Status at Death',
            type: 'select',
            required: true,
            options: ['Single', 'Married', 'Widowed', 'Divorced']
          }
        ]
      },
      {
        title: 'Your Details (Applicant)',
        fields: [
          {
            label: 'Full Name',
            type: 'text',
            required: true
          },
          {
            label: 'Relationship to Deceased',
            type: 'select',
            required: true,
            options: ['Son', 'Daughter', 'Spouse', 'Father', 'Mother', 'Brother', 'Sister', 'Other']
          },
          {
            label: 'NICOP/Passport',
            type: 'text',
            required: true
          },
          {
            label: 'Current Country',
            type: 'text',
            required: true
          },
          {
            label: 'Contact',
            type: 'tel',
            required: true
          },
          {
            label: 'Email',
            type: 'email',
            required: true
          }
        ]
      },
      {
        title: 'All Legal Heirs - Spouse',
        fields: [
          {
            label: 'Name',
            type: 'text',
            required: false
          },
          {
            label: 'CNIC',
            type: 'text',
            required: false
          },
          {
            label: 'Living In',
            type: 'text',
            required: false
          }
        ]
      },
      {
        title: 'All Legal Heirs - Children',
        fields: [
          {
            label: 'Child Name',
            type: 'text',
            required: false
          },
          {
            label: 'Gender',
            type: 'select',
            required: false,
            options: ['Son', 'Daughter']
          },
          {
            label: 'Age',
            type: 'number',
            required: false
          },
          {
            label: 'CNIC (if adult)',
            type: 'text',
            required: false
          },
          {
            label: 'Location',
            type: 'text',
            required: false
          }
        ]
      },
      {
        title: 'All Legal Heirs - Parents',
        fields: [
          {
            label: 'Father',
            type: 'select',
            required: true,
            options: ['Alive', 'Deceased']
          },
          {
            label: 'Mother',
            type: 'select',
            required: true,
            options: ['Alive', 'Deceased']
          }
        ]
      },
      {
        title: 'Deceased\'s Assets - Property',
        fields: [
          {
            label: 'Property Type',
            type: 'text',
            required: false
          },
          {
            label: 'Address',
            type: 'textarea',
            required: false
          },
          {
            label: 'Size',
            type: 'text',
            required: false
          },
          {
            label: 'Estimated Value (PKR)',
            type: 'number',
            required: false
          }
        ]
      },
      {
        title: 'Deceased\'s Assets - Bank',
        fields: [
          {
            label: 'Bank Name',
            type: 'text',
            required: false
          },
          {
            label: 'Account Number',
            type: 'text',
            required: false
          },
          {
            label: 'Approximate Balance (PKR)',
            type: 'number',
            required: false
          }
        ]
      },
      {
        title: 'Deceased\'s Assets - Other',
        fields: [
          {
            label: 'Investment Type',
            type: 'text',
            required: false
          },
          {
            label: 'Value (PKR)',
            type: 'number',
            required: false
          },
          {
            label: 'Business Name',
            type: 'text',
            required: false
          },
          {
            label: 'Business Value (PKR)',
            type: 'number',
            required: false
          },
          {
            label: 'Total Estate Value (PKR)',
            type: 'number',
            required: true
          }
        ]
      },
      {
        title: 'Liabilities',
        fields: [
          {
            label: 'Creditor Name',
            type: 'text',
            required: false
          },
          {
            label: 'Amount Owed (PKR)',
            type: 'number',
            required: false
          },
          {
            label: 'Documentation Available',
            type: 'select',
            required: false,
            options: ['Yes', 'No']
          },
          {
            label: 'Total Liabilities (PKR)',
            type: 'number',
            required: false
          }
        ]
      },
      {
        title: 'Will Status',
        fields: [
          {
            label: 'Did Deceased Leave a Will?',
            type: 'select',
            required: true,
            options: ['Yes', 'No', 'Don\'t know']
          },
          {
            label: 'If Yes, Is It Registered?',
            type: 'select',
            required: false,
            options: ['Yes', 'No']
          },
          {
            label: 'Will Executor',
            type: 'text',
            required: false
          }
        ]
      },
      {
        title: 'Disputes & Documentation',
        fields: [
          {
            label: 'Disputes Expected',
            type: 'select',
            required: true,
            options: ['No disputes expected', 'Some family disagreement', 'Major disputes likely']
          },
          {
            label: 'Details',
            type: 'textarea',
            required: false
          },
          {
            label: 'Succession Certificate',
            type: 'select',
            required: true,
            options: ['Have', 'Need', 'Not sure']
          },
          {
            label: 'Property Mutation',
            type: 'select',
            required: false,
            options: ['Done', 'Pending']
          }
        ]
      },
      {
        title: 'Your Role',
        fields: [
          {
            label: 'Your Role in This Matter',
            type: 'select',
            required: true,
            options: ['Administrator for all heirs', 'Representing only yourself', 'Representing minor children', 'Executor of will']
          }
        ]
      }
    ],
    faqs: [
      {
        question: 'What is succession certificate?',
        answer: 'Court document authorizing heirs to claim deceased\'s assets.'
      },
      {
        question: 'How are shares calculated?',
        answer: 'Per Islamic inheritance law (Shariah) for Muslims.'
      },
      {
        question: 'Can I claim from abroad?',
        answer: 'Yes, through Power of Attorney.'
      }
    ]
  },

  // 25. CIVIL LITIGATION & COURT REPRESENTATION
  {
    slug: 'civil-litigation-court-representation',
    title: 'Civil Litigation & Court Representation',
    tagline: 'Complete legal representation for civil disputes',
    deliverables: [
      'Complete court representation',
      'Case filing and documentation',
      'Attendance at all hearings',
      'Legal argument preparation',
      'Evidence management',
      'Regular case updates',
      'Final judgment execution'
    ],
    processSteps: [
      {
        title: 'Case Assessment',
        description: 'Review all documents, assess legal merit, research precedents, strategy formulation, cost estimation',
        duration: '3-5 days'
      },
      {
        title: 'Case Filing',
        description: 'Draft plaint/petition, prepare evidence affidavits, file in appropriate court, pay court fees, serve notice to defendant',
        duration: '1-2 weeks'
      },
      {
        title: 'Written Pleadings',
        description: 'Defendant\'s reply, your rejoinder, framing of issues, evidence listing',
        duration: '1-3 months'
      },
      {
        title: 'Trial Proceedings',
        description: 'Plaintiff\'s evidence, cross-examination, defendant\'s evidence, cross-examination, written arguments',
        duration: '6-18 months'
      },
      {
        title: 'Judgment',
        description: 'Court decision, decree preparation, appeal options if needed',
        duration: '1-3 months'
      },
      {
        title: 'Execution',
        description: 'Execute decree, recovery proceedings, final compliance',
        duration: '3-12 months'
      }
    ],
    documentCategories: [
      { id: 'case', name: 'Case Documents', description: 'Core case supporting documents', order: 1 },
      { id: 'evidence', name: 'Evidence', description: 'Proof and supporting evidence', order: 2 },
      { id: 'communication', name: 'Communication', description: 'Correspondence and notices', order: 3 },
      { id: 'client', name: 'Client Documents', description: 'Your identification and authorization', order: 4 }
    ],
    requiredDocuments: [
      {
        id: 'relevant-documents',
        name: 'All Relevant Documents Supporting Your Case',
        description: 'Complete set of documents related to the dispute',
        required: true,
        category: 'case',
        formats: ['PDF'],
        notes: 'Everything that supports your claim or defense. We will review and identify key documents.'
      },
      {
        id: 'agreements-contracts',
        name: 'Agreements/Contracts (if applicable)',
        description: 'Any contracts or agreements with other party',
        required: false,
        category: 'case',
        formats: ['PDF'],
        notes: 'Sale agreements, service contracts, partnership deeds, etc.'
      },
      {
        id: 'correspondence',
        name: 'Correspondence with Other Party',
        description: 'All communications with opposing party',
        required: false,
        category: 'communication',
        formats: ['PDF', 'MSG', 'EML'],
        notes: 'Emails, letters, WhatsApp messages, SMS - shows attempt to resolve amicably'
      },
      {
        id: 'payment-proofs',
        name: 'Payment Receipts/Proofs',
        description: 'Proof of payments made or received',
        required: false,
        category: 'evidence',
        formats: ['PDF', 'JPG'],
        notes: 'Bank transfers, cheque copies, cash receipts, invoices'
      },
      {
        id: 'witness-statements',
        name: 'Witness Statements',
        description: 'Written statements from witnesses',
        required: false,
        category: 'evidence',
        formats: ['PDF', 'DOC', 'DOCX'],
        notes: 'Affidavits or signed statements from people who witnessed events'
      },
      {
        id: 'legal-notices',
        name: 'Previous Legal Notices',
        description: 'Any notices sent or received',
        required: false,
        category: 'communication',
        formats: ['PDF'],
        notes: 'Prior legal notices, demand letters, or responses'
      },
      {
        id: 'expert-reports',
        name: 'Expert Reports (if any)',
        description: 'Reports from experts or professionals',
        required: false,
        category: 'evidence',
        formats: ['PDF'],
        alternatives: ['Engineer reports', 'Valuation reports', 'Medical reports', 'Forensic reports'],
        notes: 'Expert opinions that support your case'
      },
      {
        id: 'client-nicop',
        name: 'Your NICOP/Passport',
        description: 'Your identification document',
        required: true,
        category: 'client',
        copies: 2,
        formats: ['PDF', 'JPG', 'PNG'],
        notes: 'For overseas clients: NICOP or Passport'
      },
      {
        id: 'power-of-attorney',
        name: 'Power of Attorney (Attested)',
        description: 'POA for legal representation',
        required: false,
        category: 'client',
        condition: {
          field: 'Client Location',
          operator: 'equals',
          value: 'overseas'
        },
        formats: ['PDF'],
        notes: 'Required for overseas clients. Must be attested by Pakistan Embassy.'
      }
    ],
    timeline: '12-36 months',
    formSections: [
      {
        title: 'Your Details',
        fields: [
          {
            label: 'Full Name',
            type: 'text',
            required: true
          },
          {
            label: 'NICOP/Passport',
            type: 'text',
            required: true
          },
          {
            label: 'Current Country',
            type: 'text',
            required: true
          },
          {
            label: 'Address Abroad',
            type: 'textarea',
            required: true
          },
          {
            label: 'Contact',
            type: 'tel',
            required: true
          },
          {
            label: 'Email',
            type: 'email',
            required: true
          }
        ]
      },
      {
        title: 'Case Type',
        fields: [
          {
            label: 'Type of Case',
            type: 'select',
            required: true,
            options: ['Contract dispute', 'Recovery of money', 'Property dispute', 'Partnership dissolution', 'Specific performance', 'Injunction', 'Declaration', 'Damages claim', 'Other']
          }
        ]
      },
      {
        title: 'Opponent Details',
        fields: [
          {
            label: 'Name',
            type: 'text',
            required: true
          },
          {
            label: 'CNIC (if known)',
            type: 'text',
            required: false
          },
          {
            label: 'Address',
            type: 'textarea',
            required: true
          },
          {
            label: 'Contact (if available)',
            type: 'tel',
            required: false
          }
        ]
      },
      {
        title: 'Case Summary',
        fields: [
          {
            label: 'Brief Description of Dispute',
            type: 'textarea',
            required: true,
            placeholder: 'Explain what happened and what you are claiming'
          },
          {
            label: 'Amount in Dispute (PKR)',
            type: 'number',
            required: false
          },
          {
            label: 'Date Dispute Arose',
            type: 'date',
            required: true
          }
        ]
      },
      {
        title: 'Evidence & Documents',
        fields: [
          {
            label: 'Evidence You Have',
            type: 'checkbox',
            required: true,
            options: ['Written contract/agreement', 'Payment receipts', 'Correspondence', 'Witness statements', 'Expert reports', 'Photographs', 'Other documents']
          }
        ]
      },
      {
        title: 'Previous Legal Action',
        fields: [
          {
            label: 'Legal Notice Sent?',
            type: 'select',
            required: true,
            options: ['Yes', 'No']
          },
          {
            label: 'Previous Court Case?',
            type: 'select',
            required: true,
            options: ['Yes', 'No']
          },
          {
            label: 'If Yes, Case Details',
            type: 'textarea',
            required: false
          }
        ]
      },
      {
        title: 'Your Claim',
        fields: [
          {
            label: 'What Are You Seeking',
            type: 'checkbox',
            required: true,
            options: ['Money recovery', 'Property possession', 'Specific performance', 'Injunction', 'Declaration', 'Damages', 'Other relief']
          },
          {
            label: 'Specific Relief Details',
            type: 'textarea',
            required: true,
            placeholder: 'Describe exactly what you want the court to order'
          }
        ]
      },
      {
        title: 'Urgency',
        fields: [
          {
            label: 'Urgency Level',
            type: 'select',
            required: true,
            options: ['Very urgent (interim relief needed)', 'Urgent (file soon)', 'Standard']
          },
          {
            label: 'Why Urgent',
            type: 'textarea',
            required: false
          }
        ]
      }
    ],
    faqs: [
      {
        question: 'How long do civil cases take?',
        answer: 'Typically 12-36 months, varies by case complexity and court.'
      },
      {
        question: 'Do I need to attend hearings?',
        answer: 'No, we represent you via Power of Attorney.'
      },
      {
        question: 'What if I lose the case?',
        answer: 'Appeal options available within specified time periods.'
      }
    ]
  }
];

// Helper function to get service by slug
export const getServiceBySlug = (slug: string): FacilitationService | undefined => {
  return facilitationServices.find(service => service.slug === slug);
};

// Helper function to get all service slugs
export const getAllServiceSlugs = (): string[] => {
  return facilitationServices.map(service => service.slug);
};
