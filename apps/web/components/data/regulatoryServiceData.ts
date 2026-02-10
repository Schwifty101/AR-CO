export interface RegulatoryFAQ {
  question: string;
  answer: string;
}

export interface ProcessStep {
  title: string;
  description: string;
  duration: string;
}

export interface RegulatoryService {
  id: string;
  title: string;
  tagline: string;
  whatWeDo: string[];
  processSteps: ProcessStep[];
  whyYouNeedIt: string;
  whyChooseUs: string;
  faqs: RegulatoryFAQ[];
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'tel' | 'email' | 'select' | 'textarea' | 'checkbox' | 'file';
  required: boolean;
  placeholder?: string;
  options?: string[];
  hint?: string;
}

export interface FormSection {
  title: string;
  fields: FormField[];
}

export const regulatoryServices: RegulatoryService[] = [
  {
    id: 'hec-matters',
    title: 'HEC Matters & Degree Attestation Issues',
    tagline: 'Your Education, Properly Recognized',
    whatWeDo: [
      'Complete HEC degree attestation',
      'Resolve objections and delays',
      'File and pursue HEC complaints',
      'Continuous follow-up until completion',
    ],
    processSteps: [
      {
        title: 'Case Assessment',
        description: 'Review your degree documents, HEC application status, and identify the specific issue — attestation delay, objection, or verification hold',
        duration: '1 day',
      },
      {
        title: 'Document Preparation',
        description: 'Compile required documents including degree, transcripts, CNIC, equivalence letters (if foreign degree), and draft any required applications or objection replies',
        duration: '2-3 days',
      },
      {
        title: 'HEC Submission & Filing',
        description: 'Submit application or reply to HEC through proper channels — online portal, regional office, or head office in Islamabad as required',
        duration: '1-2 days',
      },
      {
        title: 'Follow-Up & Tracking',
        description: 'Regular follow-ups with HEC attestation branch, verification cell, or complaint cell until the matter is resolved',
        duration: '1-4 weeks',
      },
      {
        title: 'Attestation Completion',
        description: 'Collect attested degree and verify attestation stamp, ensuring records are updated in HEC system',
        duration: '1-2 days',
      },
    ],
    whyYouNeedIt: 'HEC attestation is mandatory for jobs, higher education, immigration, and professional licensing.',
    whyChooseUs: 'End-to-end handling, objection resolution, and continuous follow-up until completion.',
    faqs: [
      {
        question: 'Can you help if my degree is stuck or objected?',
        answer: 'Yes, we handle objections, missing records, and verification delays.',
      },
      {
        question: 'Do I need to appear personally at HEC?',
        answer: 'In most cases, no — we manage representation and follow-ups.',
      },
    ],
  },
  {
    id: 'nadra-services',
    title: 'NADRA Services & Complaint Resolution',
    tagline: 'Identity Issues, Resolved Properly',
    whatWeDo: [
      'Correct CNIC/NICOP data errors',
      'Resolve duplicate records',
      'Expedite delayed applications',
      'Rectify B-Form issues',
      'File NADRA complaints',
    ],
    processSteps: [
      {
        title: 'Issue Identification',
        description: 'Review your CNIC/NICOP/B-Form and identify the exact data discrepancy, delay reason, or duplicate record issue from NADRA system',
        duration: '1 day',
      },
      {
        title: 'Application Drafting',
        description: 'Prepare correction application (Form-A for modifications), gather supporting documents — CNIC, old records, FRC, Nikahnama, affidavits as required',
        duration: '2-3 days',
      },
      {
        title: 'NADRA Submission',
        description: 'Submit application at the relevant NADRA Registration Center (NRC) or NADRA Mega Center with all supporting documentation',
        duration: '1 day',
      },
      {
        title: 'Complaint Escalation',
        description: 'If standard timelines are exceeded, file formal complaint through NADRA complaint portal or escalate to Regional Head Office',
        duration: '3-7 days',
      },
      {
        title: 'Verification & Collection',
        description: 'Track application status via NADRA token system, verify corrections in updated document, and collect corrected CNIC/NICOP/B-Form',
        duration: '2-4 weeks',
      },
    ],
    whyYouNeedIt: 'Incorrect or delayed NADRA records can block banking, travel, inheritance, and legal matters.',
    whyChooseUs: 'Accurate documentation, complaint escalation, and liaison with NADRA authorities.',
    faqs: [
      {
        question: 'Can NADRA data errors be corrected?',
        answer: 'Yes, through proper applications and follow-ups.',
      },
      {
        question: 'Do you assist overseas Pakistanis?',
        answer: 'Yes, including NICOP and record correction cases.',
      },
    ],
  },
  {
    id: 'cda-matters',
    title: 'CDA Matters & Development Authority Issues',
    tagline: 'Islamabad Property & Civic Matters, Professionally Handled',
    whatWeDo: [
      'Secure plot allotments',
      'Complete transfers and mutations',
      'Obtain NOCs and construction approvals',
      'Respond to violation notices',
      'Resolve civic complaints',
    ],
    processSteps: [
      {
        title: 'Matter Review',
        description: 'Assess your CDA-related matter — plot file, transfer status, NOC requirement, violation notice, or civic complaint — and determine the relevant CDA wing',
        duration: '1-2 days',
      },
      {
        title: 'Documentation',
        description: 'Prepare required documents including allotment letter, sale deed, NOC applications, site plans, CNIC copies, power of attorney (if applicable), and CDA prescribed forms',
        duration: '3-5 days',
      },
      {
        title: 'CDA Filing',
        description: 'Submit application to the relevant CDA directorate — Estate Management, Building Control, Planning Wing, or Environment Wing as appropriate',
        duration: '1-2 days',
      },
      {
        title: 'Departmental Liaison',
        description: 'Regular follow-up with concerned CDA officers, attend hearings if required, respond to any queries or additional document requests',
        duration: '2-6 weeks',
      },
      {
        title: 'Resolution & Delivery',
        description: 'Secure approval, transfer letter, mutation entry, NOC, or complaint resolution and collect all processed documents from CDA',
        duration: '1-3 days',
      },
    ],
    whyYouNeedIt: 'CDA procedures are technical, time-consuming, and delays are common without proper documentation and follow-up.',
    whyChooseUs: 'Dedicated CDA-focused handling, strong documentation, and continuous liaison with relevant CDA departments until resolution.',
    faqs: [
      {
        question: 'Can you help with delayed CDA plot transfers or allotments?',
        answer: 'Yes, including objections, pending verifications, and follow-ups.',
      },
      {
        question: 'Do you handle civil complaints in Islamabad?',
        answer: 'Yes.',
      },
    ],
  },
  {
    id: 'fbr-tax',
    title: 'FBR & Tax Authority Complaints',
    tagline: 'Tax Issues, Legally Addressed',
    whatWeDo: [
      'Respond to tax notices',
      'Expedite refund processing',
      'Challenge incorrect assessments',
      'Resolve filer status issues',
      'File FBR complaints',
    ],
    processSteps: [
      {
        title: 'Tax Matter Assessment',
        description: 'Review the tax notice, assessment order, refund status, or filer issue through FBR IRIS portal and identify the exact discrepancy or action required',
        duration: '1-2 days',
      },
      {
        title: 'Response Preparation',
        description: 'Draft reply to tax notice, prepare refund application, compile evidence for incorrect assessment, or prepare filer status correction request with supporting documents',
        duration: '3-5 days',
      },
      {
        title: 'FBR Filing',
        description: 'Submit response through FBR IRIS portal, Regional Tax Office (RTO), or Large Taxpayer Unit (LTU) as applicable under the Income Tax Ordinance, 2001',
        duration: '1-2 days',
      },
      {
        title: 'Follow-Up & Escalation',
        description: 'Track case progress, attend hearings before tax officers if scheduled, and escalate through FBR complaint mechanisms or Federal Tax Ombudsman if needed',
        duration: '2-8 weeks',
      },
      {
        title: 'Resolution',
        description: 'Obtain revised assessment order, refund issuance, filer status correction, or complaint disposal order from FBR',
        duration: '1-3 days',
      },
    ],
    whyYouNeedIt: 'Unresolved FBR matters can lead to penalties and legal exposure.',
    whyChooseUs: 'Correct representation and escalation through lawful channels.',
    faqs: [
      {
        question: 'Can you help with delayed tax refunds?',
        answer: 'Yes, including complaint filing and follow-ups.',
      },
      {
        question: 'Do you represent salaried individuals as well?',
        answer: 'Yes.',
      },
    ],
  },
  {
    id: 'utility-authorities',
    title: 'Utility Authorities (WAPDA, K-Electric etc.)',
    tagline: 'Essential Services, Without Hassle',
    whatWeDo: [
      'Resolve billing disputes',
      'Secure new connections',
      'Address wrongful disconnections',
      'Rectify meter issues',
      'File utility complaints',
    ],
    processSteps: [
      {
        title: 'Issue Assessment',
        description: 'Review billing records, connection applications, meter readings, or disconnection notice and identify the specific utility authority (IESCO, LESCO, K-Electric, SNGPL, SSGC, etc.)',
        duration: '1 day',
      },
      {
        title: 'Complaint Drafting',
        description: 'Prepare formal complaint with supporting evidence — previous bills, meter photos, application receipts, and relevant consumer protection references',
        duration: '2-3 days',
      },
      {
        title: 'Authority Submission',
        description: 'File complaint with the utility company customer service center, SDO/XEN office, or through NEPRA/OGRA online complaint portals as applicable',
        duration: '1 day',
      },
      {
        title: 'Regulatory Escalation',
        description: 'If unresolved, escalate to NEPRA (electricity), OGRA (gas), or Federal/Provincial Ombudsman under relevant consumer protection laws',
        duration: '1-4 weeks',
      },
      {
        title: 'Resolution & Verification',
        description: 'Obtain corrected bill, new connection approval, reconnection order, or meter replacement and verify the issue is fully resolved',
        duration: '1-2 weeks',
      },
    ],
    whyYouNeedIt: 'Utility disputes often remain unresolved without proper escalation.',
    whyChooseUs: 'Documentation-based follow-ups and authority coordination.',
    faqs: [
      {
        question: 'Can wrong bills be challenged?',
        answer: 'Yes, through formal complaint procedures.',
      },
      {
        question: 'Do you assist with commercial connections?',
        answer: 'Yes, residential and commercial both.',
      },
    ],
  },
  {
    id: 'excise-taxation',
    title: 'Excise & Taxation Department Matters',
    tagline: 'Records Corrected, Ownership Secured',
    whatWeDo: [
      'Complete vehicle ownership transfers',
      'Correct excise records',
      'Update tax records',
      'File departmental complaints',
    ],
    processSteps: [
      {
        title: 'Record Review',
        description: 'Check existing excise & taxation records, vehicle registration details, or ownership documents and identify discrepancies or transfer requirements',
        duration: '1 day',
      },
      {
        title: 'Document Preparation',
        description: 'Compile transfer deed, sale agreement, CNIC copies, token tax receipts, vehicle fitness certificate, and authority letter (for overseas clients)',
        duration: '2-3 days',
      },
      {
        title: 'Departmental Filing',
        description: 'Submit application at the relevant Excise & Taxation Office, Motor Registration Authority, or through e-Pay Punjab / e-Excise portal as applicable',
        duration: '1-2 days',
      },
      {
        title: 'Processing & Follow-Up',
        description: 'Track application status, attend inspection if required, respond to department queries, and follow up for timely processing',
        duration: '1-3 weeks',
      },
      {
        title: 'Transfer Completion',
        description: 'Collect updated registration book, ownership certificate, corrected record, or token tax receipt from the Excise & Taxation office',
        duration: '1-2 days',
      },
    ],
    whyYouNeedIt: 'Incorrect excise records can block sale, transfer, or compliance.',
    whyChooseUs: 'Accurate filings and timely processing.',
    faqs: [
      {
        question: 'Can overseas owners transfer vehicles?',
        answer: 'Yes, with authorization.',
      },
      {
        question: 'Do you handle old record corrections?',
        answer: 'Yes.',
      },
    ],
  },
  {
    id: 'public-authority-complaints',
    title: 'Public Authority Complaint Drafting & Follow-Ups',
    tagline: 'Your Complaint, Properly Heard',
    whatWeDo: [
      'Draft legally sound complaints',
      'File with appropriate authorities',
      'Structured follow-ups and escalation',
      'Ensure proper response',
    ],
    processSteps: [
      {
        title: 'Matter Assessment',
        description: 'Understand the grievance, identify the responsible public authority, and determine the correct legal basis and forum for complaint',
        duration: '1-2 days',
      },
      {
        title: 'Complaint Drafting',
        description: 'Draft a properly structured complaint citing relevant laws, rules, and regulations — including facts, grounds, and specific relief sought',
        duration: '2-4 days',
      },
      {
        title: 'Filing & Submission',
        description: 'File complaint with the concerned authority, government department, or relevant Ombudsman (Federal, Provincial, or Wafaqi Mohtasib) through proper channels',
        duration: '1-2 days',
      },
      {
        title: 'Follow-Up & Escalation',
        description: 'Track complaint status, attend hearings if scheduled, submit additional documents if requested, and escalate if the authority fails to respond within prescribed time',
        duration: '2-6 weeks',
      },
    ],
    whyYouNeedIt: 'Poorly drafted complaints are often ignored or rejected.',
    whyChooseUs: 'Legally sound drafting and structured follow-ups.',
    faqs: [],
  },
  {
    id: 'regulatory-delay',
    title: 'Regulatory Delay & Maladministration Cases',
    tagline: 'When Delay Becomes Injustice',
    whatWeDo: [
      'Challenge regulatory delays',
      'Address misuse of authority',
      'Pursue negligence cases',
      'Secure lawful remedies',
    ],
    processSteps: [
      {
        title: 'Delay Documentation',
        description: 'Document the timeline of delay or maladministration — collect all correspondence, application receipts, and evidence of inaction by the authority',
        duration: '1-3 days',
      },
      {
        title: 'Legal Analysis',
        description: 'Identify applicable legal remedies under relevant laws including the Federal Ombudsman Institutional Reforms Act, 2013 or provincial ombudsman laws',
        duration: '2-3 days',
      },
      {
        title: 'Formal Representation',
        description: 'File complaint with Wafaqi Mohtasib (Federal Ombudsman), Provincial Ombudsman, or submit representation to the concerned authority with legal notice',
        duration: '1-2 days',
      },
      {
        title: 'Hearing & Pursuit',
        description: 'Attend hearings, submit evidence and written arguments, pursue the matter through prescribed legal channels until resolution or order is passed',
        duration: '4-12 weeks',
      },
      {
        title: 'Implementation',
        description: 'Ensure the order or directive is implemented by the concerned authority, and follow up if compliance is delayed',
        duration: '1-4 weeks',
      },
    ],
    whyYouNeedIt: 'Protects your legal and constitutional rights.',
    whyChooseUs: 'Strategic escalation and lawful remedies.',
    faqs: [],
  },
];

export const regulatoryServiceForm: FormSection[] = [
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
        id: 'contactNumber',
        label: 'Contact Number (WhatsApp preferred)',
        type: 'tel',
        required: true,
        placeholder: 'Country code + number',
      },
      {
        id: 'email',
        label: 'Email Address',
        type: 'email',
        required: true,
        placeholder: 'your.email@example.com',
      },
      {
        id: 'city',
        label: 'City / Location',
        type: 'select',
        required: true,
        options: ['Islamabad', 'Rawalpindi', 'Lahore', 'Karachi', 'Overseas', 'Other'],
        placeholder: 'Select your city',
      },
    ],
  },
  {
    title: 'SERVICE REQUIRED',
    fields: [
      {
        id: 'serviceType',
        label: 'Select the Service You Need',
        type: 'checkbox',
        required: true,
        options: [
          'HEC Degree / Attestation Issue',
          'NADRA CNIC / NICOP / B-Form Issue',
          'CDA Plot / Property / Civic Issue',
          'FBR / Tax Authority Matter',
          'Utility Issue (Electricity / Gas / Water)',
          'Excise & Vehicle / Tax Matter',
          'Other Government Authority Issue',
        ],
      },
    ],
  },
  {
    title: 'ABOUT YOUR MATTER',
    fields: [
      {
        id: 'matterDescription',
        label: 'Briefly explain your issue',
        type: 'textarea',
        required: true,
        placeholder: 'e.g. My HEC degree is verified but attestation is delayed for 3 months',
        hint: 'Explain in simple words — no legal language needed',
      },
    ],
  },
  {
    title: 'DOCUMENTS (Optional at This Stage)',
    fields: [
      {
        id: 'documents',
        label: 'Upload documents (if available)',
        type: 'file',
        required: false,
        hint: 'CNIC / Application receipt / Letter / Screenshot',
      },
    ],
  },
  {
    title: 'CONSENT & SUBMISSION',
    fields: [
      {
        id: 'consentCorrectInfo',
        label: 'I confirm that the information provided is correct to the best of my knowledge.',
        type: 'checkbox',
        required: true,
      },
      {
        id: 'consentReview',
        label: 'I understand this form is for initial review and consultation purposes.',
        type: 'checkbox',
        required: true,
      },
    ],
  },
];

export const submissionMessage = {
  title: 'Thank you for submitting your matter.',
  message: 'Our team will review your case and contact you within 24–48 working hours.',
};
