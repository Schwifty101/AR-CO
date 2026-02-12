export interface WomenDeskFAQ {
  question: string;
  answer: string;
}

export interface ProcessStep {
  title: string;
  description: string;
  duration: string;
}

export interface WomenDeskService {
  id: string;
  title: string;
  tagline: string;
  whatWeDo: string[];
  processSteps: ProcessStep[];
  whyYouNeedIt: string;
  whyChooseUs: string;
  faqs: WomenDeskFAQ[];
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'tel' | 'email' | 'select' | 'textarea' | 'checkbox' | 'file' | 'radio';
  required: boolean;
  placeholder?: string;
  options?: string[];
  hint?: string;
}

export interface FormSection {
  title: string;
  fields: FormField[];
}

export const womenDeskServices: WomenDeskService[] = [
  {
    id: 'harassment-cases',
    title: 'Harassment Cases',
    tagline: 'Your Rights, Properly Represented',
    whatWeDo: [
      'Draft harassment complaints',
      'File with harassment committees',
      'Provide legal representation',
      'Ensure confidential handling',
    ],
    processSteps: [
      {
        title: 'Confidential Consultation',
        description: 'Discuss incident details, collect evidence - messages, emails, witnesses',
        duration: '1-2 days',
      },
      {
        title: 'Complaint Drafting',
        description: 'Prepare formal complaint under Protection Against Harassment of Women at Workplace Act, 2010',
        duration: '2-3 days',
      },
      {
        title: 'Filing',
        description: 'Submit to employer\'s inquiry committee or Provincial Ombudsman for harassment',
        duration: '1 day',
      },
      {
        title: 'Inquiry & Hearings',
        description: 'Attend inquiry proceedings, present evidence, provide legal representation',
        duration: '4-8 weeks',
      },
      {
        title: 'Resolution',
        description: 'Receive inquiry report and recommendations, pursue implementation or appeal if needed',
        duration: '1-2 weeks',
      },
    ],
    whyYouNeedIt: 'To seek lawful protection and justice.',
    whyChooseUs: 'Sensitive, discreet, and professional support.',
    faqs: [
      {
        question: 'Is confidentiality maintained?',
        answer: 'Yes, all cases are handled with strict confidentiality.',
      },
      {
        question: 'What evidence is required?',
        answer: 'Any messages, witnesses, or supporting proof.',
      },
    ],
  },
  {
    id: 'khula-process',
    title: 'Khula Process',
    tagline: 'Legal Closure with Dignity',
    whatWeDo: [
      'File Khula petitions in Family Court',
      'Handle all court proceedings',
      'Ensure confidential representation',
      'Secure swift dissolution',
    ],
    processSteps: [
      {
        title: 'Confidential Consultation',
        description: 'Discuss grounds for Khula, marriage details, and gather marriage certificate (Nikahnama)',
        duration: '1-2 days',
      },
      {
        title: 'Khula Petition Filing',
        description: 'File Khula petition in Family Court under Dissolution of Muslim Marriages Act, 1939',
        duration: '2-3 days',
      },
      {
        title: 'Court Notices & Hearings',
        description: 'Court issues notice to husband, conducts hearings, attempts reconciliation through arbitration',
        duration: '2-4 months',
      },
      {
        title: 'Decree Issuance',
        description: 'Upon fulfillment of conditions, Family Court grants Khula decree',
        duration: '1-2 weeks',
      },
      {
        title: 'Post-Decree Matters',
        description: 'Advise on iddat period, dower return (if applicable), and finalization',
        duration: '1 week',
      },
    ],
    whyYouNeedIt: 'Ensures lawful separation and protection of rights under Pakistani law.',
    whyChooseUs: 'Confidential, respectful, and professional handling with minimal court appearances.',
    faqs: [
      {
        question: 'How long does the Khula process take?',
        answer: 'Usually 2–4 months, depending on court proceedings and reconciliation attempts.',
      },
      {
        question: 'Is personal appearance required?',
        answer: 'Limited appearances may be required, but we minimize your court visits.',
      },
    ],
  },
  {
    id: 'divorce-proceedings',
    title: 'Divorce Proceedings',
    tagline: 'Clear, Correct & Confidential',
    whatWeDo: [
      'Handle divorce documentation',
      'Issue legal notices through Union Council',
      'Complete mandatory procedures',
      'Ensure lawful dissolution',
    ],
    processSteps: [
      {
        title: 'Notice Preparation',
        description: 'Prepare divorce notice (Talaq notice) and supporting documentation',
        duration: '1-2 days',
      },
      {
        title: 'Union Council Filing',
        description: 'File notice with relevant Union Council, initiate arbitration council proceedings',
        duration: '2-3 days',
      },
      {
        title: 'Arbitration & Waiting Period',
        description: 'Arbitration council attempts reconciliation, mandatory 90-day waiting period begins',
        duration: '3 months',
      },
      {
        title: 'Divorce Certificate',
        description: 'After iddat completion, obtain divorce certificate from Union Council',
        duration: '1-2 weeks',
      },
      {
        title: 'Legal Finalization',
        description: 'Verify divorce registration, advise on rights and post-divorce matters',
        duration: '1 week',
      },
    ],
    whyYouNeedIt: 'Mandatory for lawful dissolution of marriage under Muslim Family Laws Ordinance, 1961.',
    whyChooseUs: 'Smooth process with full legal compliance and confidential handling.',
    faqs: [
      {
        question: 'Is notice mandatory in divorce cases?',
        answer: 'Yes, legal notice and council process is mandatory under Pakistani law.',
      },
      {
        question: 'When is divorce considered final?',
        answer: 'After completion of the statutory 90-day period (iddat).',
      },
    ],
  },
  {
    id: 'child-custody',
    title: 'Child Custody & Guardianship',
    tagline: 'Your Children, Your Rights',
    whatWeDo: [
      'File custody petitions in Family Court',
      'Represent mothers\' custody rights',
      'Handle guardianship certificates',
      'Secure visitation rights',
    ],
    processSteps: [
      {
        title: 'Custody Assessment',
        description: 'Evaluate custody situation, children\'s age, living arrangements, and mother\'s rights under Guardians Act',
        duration: '1-2 days',
      },
      {
        title: 'Petition Filing',
        description: 'File custody petition or guardianship certificate application in Family Court',
        duration: '2-3 days',
      },
      {
        title: 'Court Hearings',
        description: 'Attend hearings, present evidence of child\'s welfare, argue custody rights',
        duration: '2-6 months',
      },
      {
        title: 'Custody Order',
        description: 'Court grants custody order considering child\'s age and welfare (mother\'s right for young children)',
        duration: '2-4 weeks',
      },
      {
        title: 'Implementation',
        description: 'Ensure custody order implementation, advise on visitation arrangements and maintenance',
        duration: '1-2 weeks',
      },
    ],
    whyYouNeedIt: 'Protects mother\'s custody rights and ensures child\'s welfare under Pakistani law.',
    whyChooseUs: 'Strong advocacy for mothers\' rights with child-focused representation.',
    faqs: [
      {
        question: 'Until what age does a mother have custody rights?',
        answer: 'Mother has custody of sons until age 7 and daughters until puberty under Guardians Act.',
      },
      {
        question: 'Can custody be extended beyond these ages?',
        answer: 'Yes, courts can extend custody considering child\'s welfare and best interests.',
      },
    ],
  },
  {
    id: 'maintenance-claims',
    title: 'Maintenance & Financial Support',
    tagline: 'Secure Your Financial Rights',
    whatWeDo: [
      'File maintenance suits in Family Court',
      'Calculate and claim rightful amounts',
      'Enforce maintenance orders',
      'Handle post-divorce financial matters',
    ],
    processSteps: [
      {
        title: 'Financial Assessment',
        description: 'Evaluate husband\'s income, living expenses, and calculate maintenance entitlement',
        duration: '1-2 days',
      },
      {
        title: 'Maintenance Suit',
        description: 'File suit for maintenance of wife and/or children in Family Court under Family Courts Act, 1964',
        duration: '2-3 days',
      },
      {
        title: 'Court Proceedings',
        description: 'Present financial evidence, argue entitlement, attend hearings',
        duration: '3-6 months',
      },
      {
        title: 'Maintenance Order',
        description: 'Court orders monthly maintenance amount based on husband\'s means and wife\'s needs',
        duration: '2-4 weeks',
      },
      {
        title: 'Enforcement',
        description: 'If non-payment occurs, pursue enforcement through court or arrest warrants',
        duration: '2-8 weeks',
      },
    ],
    whyYouNeedIt: 'Ensures financial security for wife and children as per Islamic and Pakistani law.',
    whyChooseUs: 'Effective calculation, strong representation, and enforcement assistance.',
    faqs: [
      {
        question: 'Who is entitled to maintenance?',
        answer: 'Wife during marriage and iddat period, minor children until they are self-sufficient.',
      },
      {
        question: 'What if husband refuses to pay?',
        answer: 'Court can issue arrest warrants and attach property/salary for non-payment.',
      },
    ],
  },
  {
    id: 'domestic-violence',
    title: 'Domestic Violence Protection',
    tagline: 'Safety, Support, Legal Protection',
    whatWeDo: [
      'File protection orders under DV laws',
      'Secure residence orders',
      'Handle criminal complaints',
      'Provide emergency legal support',
    ],
    processSteps: [
      {
        title: 'Emergency Consultation',
        description: 'Assess immediate safety, document injuries/evidence, advise on protection options',
        duration: '1 day',
      },
      {
        title: 'Protection Order',
        description: 'File application for protection order under Protection Against Domestic Violence Act (provincial laws)',
        duration: '1-2 days',
      },
      {
        title: 'Interim Relief',
        description: 'Court may grant immediate interim protection order, residence order, or separation',
        duration: '1-2 weeks',
      },
      {
        title: 'Criminal Complaint',
        description: 'If violence caused injury, file FIR under PPC (assault, hurt, criminal intimidation)',
        duration: '1-2 days',
      },
      {
        title: 'Final Protection Order',
        description: 'After hearings, court grants long-term protection order with specific prohibitions',
        duration: '1-3 months',
      },
    ],
    whyYouNeedIt: 'Protects against physical, emotional, and economic abuse under Pakistani law.',
    whyChooseUs: 'Immediate action, 24/7 support, confidential handling, and strong legal protection.',
    faqs: [
      {
        question: 'What is considered domestic violence?',
        answer: 'Physical abuse, emotional abuse, economic abuse, and threats under DV laws.',
      },
      {
        question: 'Is immediate protection available?',
        answer: 'Yes, courts can grant interim protection orders within days.',
      },
    ],
  },
  {
    id: 'dower-recovery',
    title: 'Dower (Haq Mehr) Recovery',
    tagline: 'Claim What Is Rightfully Yours',
    whatWeDo: [
      'File dower recovery suits',
      'Verify Nikahnama dower amount',
      'Execute court decrees',
      'Recover deferred dower',
    ],
    processSteps: [
      {
        title: 'Dower Verification',
        description: 'Verify dower amount mentioned in Nikahnama (prompt and deferred)',
        duration: '1 day',
      },
      {
        title: 'Notice & Demand',
        description: 'Issue legal notice to husband demanding payment of unpaid dower',
        duration: '1-2 days',
      },
      {
        title: 'Suit Filing',
        description: 'If no payment, file dower recovery suit in Family Court',
        duration: '2-3 days',
      },
      {
        title: 'Court Decree',
        description: 'Court orders husband to pay dower amount as per Nikahnama',
        duration: '2-6 months',
      },
      {
        title: 'Execution',
        description: 'Execute decree through property attachment, salary garnishment, or arrest',
        duration: '1-3 months',
      },
    ],
    whyYouNeedIt: 'Dower is a legal right under Islamic and Pakistani law, often unpaid after divorce.',
    whyChooseUs: 'Strong recovery enforcement and experience with dower disputes.',
    faqs: [
      {
        question: 'When can dower be claimed?',
        answer: 'At any time during marriage, or after divorce/death of husband.',
      },
      {
        question: 'What if Nikahnama doesn\'t mention dower?',
        answer: 'Court can determine appropriate dower based on customary practices.',
      },
    ],
  },
];

export const womenDeskRegistrationForm: FormSection[] = [
  {
    title: 'CLIENT INFORMATION',
    fields: [
      {
        id: 'fullName',
        label: 'Full Name',
        type: 'text',
        required: true,
        placeholder: 'Enter your full name',
      },
      {
        id: 'email',
        label: 'Email Address',
        type: 'email',
        required: true,
        placeholder: 'your.email@example.com',
      },
      {
        id: 'contactNumber',
        label: 'Contact Number (WhatsApp preferred)',
        type: 'tel',
        required: true,
        placeholder: 'Country code + number',
        hint: 'e.g., +92 300 1234567',
      },
      {
        id: 'city',
        label: 'City / Location',
        type: 'select',
        required: true,
        options: ['Islamabad', 'Rawalpindi', 'Lahore', 'Karachi', 'Multan', 'Faisalabad', 'Other'],
        placeholder: 'Select your city',
      },
    ],
  },
  {
    title: 'CASE DETAILS',
    fields: [
      {
        id: 'caseDescription',
        label: 'Brief Description of Your Matter',
        type: 'textarea',
        required: true,
        placeholder: 'Please provide key facts',
        hint: 'Explain in simple words - complete confidentiality maintained',
      },
      {
        id: 'urgency',
        label: 'Is this matter urgent?',
        type: 'radio',
        required: false,
        options: ['Yes - Immediate assistance needed', 'No - Regular processing'],
      },
    ],
  },
  {
    title: 'DECLARATION & CONSENT',
    fields: [
      {
        id: 'consentAccurate',
        label: 'I confirm that the information provided is accurate to the best of my knowledge.',
        type: 'checkbox',
        required: true,
      },
      {
        id: 'consentConfidential',
        label: 'I understand this consultation will be handled with complete confidentiality.',
        type: 'checkbox',
        required: true,
      },
      {
        id: 'consentTerms',
        label: 'I agree to the Terms & Conditions and Privacy Policy of the firm.',
        type: 'checkbox',
        required: true,
      },
    ],
  },
];

export const womenDeskTrustPoints = [
  'Female lawyers available',
  'Complete confidentiality',
  'Sensitive & respectful handling',
  'Emergency support available',
  'No judgment, only support',
];

export const submissionResponse = {
  title: 'Thank you for reaching out to our Women\'s Desk.',
  message: 'Our team will review your matter and contact you within 12–24 hours. Your privacy and safety are our priority.',
  caseIdFormat: 'WD-2026-XXX',
};
