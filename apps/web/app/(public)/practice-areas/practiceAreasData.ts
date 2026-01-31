export interface KeyPersonnel {
  name: string
  role: string
  expertise: string
}

export interface PracticeArea {
  id: number
  slug: string
  title: string
  overview: string
  services?: string[]
  pastCases?: string[]
  clientPortfolio?: string[]
  keyPersonnel: KeyPersonnel[]
}

export const practiceAreas: PracticeArea[] = [
  {
    id: 1,
    slug: 'intellectual-property',
    title: 'Intellectual Property',
    overview:
      'The Islamabad office operates one of the most active intellectual property practices in Pakistan\'s capital, handling all types of trademark, copyright, and patent matters.',
    services: [
      'Creation and registration of intellectual property',
      'Licensing arrangements',
      'Local and international IP protection',
      'Enforcement and infringement actions',
      'Representations before registrars and court appearances',
      'Patent and trademark registration across South Asia-Middle East region and Europe',
    ],
    pastCases: [
      'Patent cases for Simbrella BV (represented by Barrister Jawad Khalid Niazi)',
      'Patent cases for Rockville International (represented by Barrister Jawad Khalid Niazi)',
    ],
    keyPersonnel: [
      {
        name: 'Barrister Jawad Khalid Niazi',
        role: 'Barrister-at-Law, Advocate High Court',
        expertise:
          'University of Leeds graduate. Represented patent cases for Simbrella and Rockville. Also represented before PTA, PEMRA, and Competition Commission of Pakistan.',
      },
      {
        name: 'Mian Sabir Sadla',
        role: 'Advocate',
        expertise:
          'University of London graduate (2017). Handles Intellectual Property matters, company incorporation, and property matters for diverse clientele.',
      },
    ],
  },
  {
    id: 2,
    slug: 'generation-sector',
    title: 'Generation Sector',
    overview:
      'The firm has extensive experience in power generation and distribution regulation through direct involvement with regulatory authorities.',
    services: [
      'Power generation licensing and compliance',
      'Distribution regulation advisory',
      'Regulatory framework development',
      'Safe, reliable, and efficient electric power compliance',
    ],
    keyPersonnel: [
      {
        name: 'Barrister Mohammad Shoaib Razzaq',
        role: 'Senior Partner, Former Director Legal at NEPRA',
        expertise:
          'Qualified Barrister from Lincoln\'s Inn with 25+ years of experience in regulatory law, constitutional litigation, and power sector matters.',
      },
    ],
  },
  {
    id: 3,
    slug: 'petroleum-energy-law',
    title: 'Petroleum & Energy Law',
    overview:
      'The firm delivers comprehensive services in petroleum/oil, gas, and energy sectors. Pioneer in arranging seminars on natural gas shortage and LNG transportation importance.',
    services: [
      'Legal and regulatory aspects of private power projects',
      'Negotiation and contractual framework preparation',
      'State incentives and policies',
      'Fuel Supply Agreements (FSA) and Power Purchase Agreements (PPA)',
      'Distribution Agreements (DA) and tariff-related matters',
      'Petroleum marketing law negotiation and advice',
      'Licensing and regulatory work of petroleum marketing',
      'On-shore and offshore exploration licensing',
      'Petroleum concession contracts/agreements formulation',
    ],
    pastCases: [
      'Pakistan LNG Terminals Ltd - Assisted Government of Pakistan and first MD Azam Soofi in company formation, bylaws, and licensing from regulators',
      'Arbitration cases involving terminal specifications and delayed damages due to contract non-performance',
      'Tullow Petroleum - Legal services',
      'Bureau of Geophysical Prospecting (BGP) Pakistan International - Legal services',
      'CNPC Chuanqing Drilling Engineering Company Ltd - Legal services',
    ],
    keyPersonnel: [
      {
        name: 'Syed Ali Naveed Arshad',
        role: 'Barrister-at-Law, Partner, Chartered Arbitrator',
        expertise:
          'University of London and Boston Law School graduate. Significant expertise in energy and environmental sectors. Leading ADR and deal-making negotiations team.',
      },
      {
        name: 'Barrister Mohammad Shoaib Razzaq',
        role: 'Senior Partner',
        expertise:
          'Extensive experience advising foreign investors in energy sector including Tullow Petroleum and Pakistan LNG Terminals.',
      },
    ],
  },
  {
    id: 4,
    slug: 'renewable-energy-environmental',
    title: 'Renewable Energy',
    overview:
      'A.R. & Co. is recognized as Pakistan\'s leading renewable energy and environmental law firm, providing specialized services from deal-making negotiations to project execution and regulatory compliance.',
    services: [
      'Advising on Kyoto Protocol and UN Framework Convention on Climate Change',
      'Carbon Financing',
      'Clean Development Mechanism',
      'Emission Reduction Purchase Agreements',
      'Statutory regulatory framework',
      'Alternative Energy Projects',
      'Environmental compliance and commercial aspects',
    ],
    clientPortfolio: [
      'Alternate Energy Development Board, Government of Pakistan',
      'Eco Securities Pakistan (Private) Limited',
    ],
    keyPersonnel: [
      {
        name: 'Syed Ali Naveed Arshad',
        role: 'Barrister-at-Law, Partner',
        expertise: 'Expert in environmental sector and alternative energy projects.',
      },
      {
        name: 'Barrister Mohammad Shoaib Razzaq',
        role: 'Senior Partner',
        expertise: 'Advisor to Alternate Energy Development Board.',
      },
    ],
  },
  {
    id: 5,
    slug: 'alternative-dispute-resolution',
    title: 'Dispute Resolution & Litigation',
    overview:
      'The firm provides legal representation in international and domestic arbitrations with extensive experience in civil and criminal litigation. Recognized as Pakistan\'s leading deal-making negotiations firm.',
    services: [
      'Constitutional & Public Interest Litigation',
      'Media freedom matters (freedom of speech and expression)',
      'Constitutional petitions concerning civil liberties, women\'s rights, and parliamentary accountability',
      'Supreme Court & High Court appearances',
      'Telecom licensing disputes',
      'Anti-competitive practice cases',
      'Tax law matters',
      'Energy regulation cases',
      'FICID framework arbitration and dispute resolution',
    ],
    pastCases: [
      'Landmark cases challenging PEMRA\'s regulatory overreach',
      'Cases representing Arshad Sharif (Martyred journalist), Moeed Pirzada, Sabir Shakir, and Shireen Mazari (Ex-MPA)',
      'Major arbitration proceedings involving high-value claims',
    ],
    clientPortfolio: [
      'Competition Commission of Pakistan',
      'Pakistan Electronic Media Regulatory Authority (PEMRA)',
      'Securities and Exchange Commission of Pakistan (SECP)',
      'National Accountability Bureau (NAB)',
      'Federal Ombudsman for Protection Against Harassment',
    ],
    keyPersonnel: [
      {
        name: 'Barrister Mohammad Shoaib Razzaq',
        role: 'Senior Partner',
        expertise:
          '25+ years experience in constitutional litigation and Supreme Court appearances. Counsel in landmark PEMRA cases and media freedom matters.',
      },
      {
        name: 'Syed Ali Naveed Arshad',
        role: 'Barrister-at-Law, Partner, Chartered Arbitrator',
        expertise:
          'Leads ADR and deal-making negotiations team. Member of visiting faculty at Federal Judicial Academy and Foreign Services Academy.',
      },
      {
        name: 'M. Attiq-ur-Rehman',
        role: 'Advocate',
        expertise:
          'University of Punjab graduate. Strong background in civil and criminal litigation with extensive trial experience.',
      },
      {
        name: 'Syed Naimat Ali Naqvi',
        role: 'Advocate',
        expertise:
          'Federal Urdu University graduate. Part of firm since 2017. Experienced in civil and criminal cases.',
      },
      {
        name: 'Muhammad Soban Hayat',
        role: 'Advocate',
        expertise:
          'University of BPP graduate. Part of firm since 2015. Specialized in constitutional petitions protecting client rights before statutory and regulatory bodies.',
      },
    ],
  },
  {
    id: 6,
    slug: 'banking-financial',
    title: 'Banking & Financial Institutions',
    overview:
      'The financial sector forms part of the firm\'s core legal practice with wide-ranging experience in specialized legal services.',
    services: [
      'Commercial lending',
      'Syndicated loans',
      'Subordinated loans',
      'Bankruptcy and insolvency',
      'Security arrangements and collateral bank guarantees',
      'Trade finance',
      'Banking compliance and due-diligence',
      'Banker-customer relationships',
      'Islamic banking and financing',
      'Financial restructuring and debt negotiation',
      'Recovery claims (initiating and defending)',
    ],
    clientPortfolio: ['China Development Bank', 'MCB Bank Limited', 'Askari Bank Limited'],
    pastCases: [
      'Acting for various banks in legal matters and recovery suits',
      'Agreement formulation, drafting, and vetting',
      'Finance facility arrangements, secured and unsecured loans, leasing',
    ],
    keyPersonnel: [
      {
        name: 'Syed Ali Naveed Arshad',
        role: 'Barrister-at-Law, Partner',
        expertise:
          'Significant expertise in banking. Acts for various banks in legal matters and recovery suits.',
      },
      {
        name: 'Barrister Mohammad Shoaib Razzaq',
        role: 'Senior Partner',
        expertise: 'Provided legal services to China Development Bank, MCB Bank, and Askari Bank.',
      },
    ],
  },
  {
    id: 7,
    slug: 'corporate-commercial',
    title: 'Corporate & Commercial',
    overview:
      'Corporate and commercial law forms part of the firm\'s core practice with particular expertise in a broad range of corporate commercial matters for both Pakistan-based and foreign corporations.',
    services: [
      'Regulatory advising and compliance under securities and exchange regulations',
      'Incorporation-related matters',
      'Collaboration agreements',
      'Shareholders agreements',
      'Mergers and acquisitions',
      'Corporate joint ventures, consortiums structuring and restructuring',
      'Foreign investment',
      'Public offerings',
      'Contract preparation, formulation, negotiation and interpretation advisory',
    ],
    clientPortfolio: [
      'China Development Bank',
      'MCB Bank',
      'Askari Bank',
      'Ufone',
      'Holiday Inn Hotels',
      'Murree Brewery',
      'China Construction (Centaurus, Grand Hyatt)',
      'DHA',
      'LMKR Group',
      'Worldcall',
      'Eco Securities',
    ],
    keyPersonnel: [
      {
        name: 'Syed Ali Naveed Arshad',
        role: 'Barrister-at-Law, Partner',
        expertise:
          'Advising, negotiating and formulating international joint venture agreements and consortiums for engineering, energy, and petroleum sector companies. Previously worked with Zong.',
      },
      {
        name: 'Sarah Hussain Kazmi',
        role: 'Barrister-at-Law, Associate',
        expertise:
          'Qualified from Lincoln\'s Inn. 10+ years as Corporate lawyer. Partner at Energy Resource Management. Member of Steering Committee for Young Arbitration Group, CIICA. Provides legal services in M&A, joint ventures, and representation before regulators.',
      },
      {
        name: 'Zainab Hayat',
        role: 'Advocate',
        expertise:
          'University of London graduate (2017). LLM in International Trade. Pioneer in firm\'s research department. Drafted and vetted numerous corporate contracts including concession agreements, TORs, and MOUs.',
      },
    ],
  },
  {
    id: 8,
    slug: 'telecommunication-technology-media',
    title: 'Telecommunication & Media',
    overview:
      'One of the most progressive specialties of the firm, acting for various market leaders in telecom and media sectors.',
    services: [
      'Complete regulatory work and licensing',
      'Advising on rights and obligations of substantial market powers',
      'Operation of payphones, non-voice SMS, and audiotext services',
      'Interconnect disputes',
      'Print and electronic media licensing',
      'Software production and hardware R&D advisory',
      'End-user relationships, piracy, and licensing matters',
      'Call-center and medical transcription company operations',
    ],
    clientPortfolio: [
      'Pakistan Telecommunication Company Limited (PTCL)',
      'Telemedia Pakistan (Private) Limited',
      'Ufone',
      'Worldcall Group',
      'Mobizone',
      'Pakistan Telecommunication Authority (PTA)',
      'Ten Sports',
      'ARY Digital Media Group',
      'BOL Media Group',
      'NEO Media Group',
      'Pakistan Electronic Media Regulatory Authority (PEMRA)',
    ],
    pastCases: [
      'PTCL - Various arbitrations, litigations, and disputes including LDI operations',
      'Telemedia Pakistan - Formulation of technical agreements and technology licensing contracts',
      'Acted on behalf of Mobilink in corporate and commercial negotiations',
    ],
    keyPersonnel: [
      {
        name: 'Syed Ali Naveed Arshad',
        role: 'Barrister-at-Law, Partner',
        expertise:
          'Significant expertise in telecommunication. Acting for PTCL in arbitrations, litigations and LDI operations. Advised Telemedia Pakistan on technical agreements and technology licensing.',
      },
      {
        name: 'Barrister Jawad Khalid Niazi',
        role: 'Barrister-at-Law, Advocate High Court',
        expertise: 'Represented clients before PTA, PEMRA, and Competition Commission of Pakistan.',
      },
      {
        name: 'Barrister Mohammad Shoaib Razzaq',
        role: 'Senior Partner',
        expertise:
          'Provided legal services to Ufone and Worldcall. Cases involving telecom licensing before Supreme Court and regulatory tribunals.',
      },
    ],
  },
  {
    id: 9,
    slug: 'construction-real-estate',
    title: 'Construction & Real Estate',
    overview:
      'A key specialty of the firm, delivering complete and comprehensive service to diverse sections of the industry, from international consortium companies to local property investors. Clients range from small transactions to multi-million dollar investments.',
    services: [
      'Due diligence',
      'Conveyancing',
      'Acquisition and financing including mortgage financing',
      'Construction contracts',
      'Regulatory and statutory compliance and approvals',
      'Contract preparation and negotiation',
      'Development schemes advisory',
      'Building rules and regulations',
      'Sub-contracting',
    ],
    clientPortfolio: [
      'China Construction - Grand Hyatt and Centaurus Projects',
      'Holiday Inn Hotels',
      'Uptown LA Entertainment Arena',
      'DHAI Amaris International Medical Centre Limited',
      'DHA (Defence Housing Authority)',
      'Green City Housing Society',
      'Pak-Zhong-Hua Limited',
    ],
    keyPersonnel: [
      {
        name: 'Syed Ali Naveed Arshad',
        role: 'Barrister-at-Law, Partner',
        expertise:
          'Significant expertise in real estate sector. Acting for DHAI Amaris International Medical Centre Limited involving advising stakeholder companies.',
      },
      {
        name: 'Zara Abbas Ali',
        role: 'LLM/ACIArb, Advocate High Court',
        expertise:
          'University of London and Kings College London graduate. Worked on Grand Hyatt and Centaurus Projects with China Construction. Attended and represented clients at hearings, depositions, settlement conferences, mediation, and trial.',
      },
      {
        name: 'Mian Sabir Sadla',
        role: 'Advocate',
        expertise: 'University of London graduate. Handles property matters for diverse clientele.',
      },
      {
        name: 'Muhammad Rohaan Shakir',
        role: 'Advocate',
        expertise:
          'University of London graduate. Focuses on civil and commercial litigation including real estate matters.',
      },
    ],
  },
  {
    id: 10,
    slug: 'charities-trusts-ngos',
    title: 'Charities, Trusts & NGOs',
    overview:
      'The firm provides regulatory advising and compliance for international and local charities, from incorporation to ongoing operations.',
    services: [
      'Incorporation of charitable and NGO entities',
      'Defining scope of work and legal perimeters',
      'Conformity with international donor requirements and regulations',
      'Application of local legislation to international charitable organizations',
      'Processing of personal information under information protection regime',
      'Beneficiaries\' relationship and rights',
    ],
    clientPortfolio: [
      'International and local charities',
      'National Commission on the Status of Women',
      'Human Rights Ministry',
      'Federal Ombudsman on Harassment at Workplace of Women',
    ],
    keyPersonnel: [
      {
        name: 'Barrister Mohammad Shoaib Razzaq',
        role: 'Senior Partner',
        expertise:
          'Counseled National Commission on the Status of Women and Human Rights Ministry, demonstrating commitment to justice and institutional reform.',
      },
      {
        name: 'Abdullah Nishtar',
        role: 'Advocate',
        expertise:
          'Extensive experience with special interest in Human Rights and Public Interest litigation.',
      },
    ],
  },
  {
    id: 11,
    slug: 'engineering-building',
    title: 'Engineering & Building',
    overview:
      'Engineering forms a key area of practice closely related to construction and real estate development, with specialized expertise developed independently.',
    services: [
      'Engineering Procurement and Construction (EPC) contracts',
      'Major engineering agreements',
      'Negligence and accident claims',
      'Employer-employee relationships in hazardous working conditions',
      'Joint venture agreements and company formation for engineering firms',
      'Technical engineering dispute resolution',
      'Performance-related matters',
      'FICID framework arbitration and dispute resolution',
    ],
    clientPortfolio: [
      'Several leading engineering companies',
      'Multinational engineering consortiums',
      'National Highway Authority, Government of Pakistan',
    ],
    keyPersonnel: [
      {
        name: 'Syed Ali Naveed Arshad',
        role: 'Barrister-at-Law, Partner, Chartered Arbitrator',
        expertise:
          'Acting for National Highway Authority in various disputes. Advising and formulating international joint venture agreements for engineering companies.',
      },
    ],
  },
  {
    id: 12,
    slug: 'immigration-law',
    title: 'Immigration Law',
    overview:
      'The firm undertakes immigration matters to cater for specific client needs, reflecting global migration trends.',
    services: [
      'Development of immigration and work permit cases',
      'Submission and representation before immigration authorities',
      'Support in immigration tribunals and courts through associate international offices',
    ],
    clientPortfolio: [
      'Pakistan',
      'United Kingdom (UK)',
      'Canada',
      'Australia',
      'Switzerland',
      'David Game School and College, London',
      'Westminster School and College, Islamabad',
    ],
    keyPersonnel: [
      {
        name: 'Abdullah Nishtar',
        role: 'Advocate',
        expertise:
          'Extensive experience in Immigration Law and Further Education Consulting. Adept in drafting and research work.',
      },
    ],
  },
  {
    id: 13,
    slug: 'nuclear-law',
    title: 'Nuclear Law & Civil Liability',
    overview:
      'ARC is one of the few pioneer firms to provide legal cover for the nuclear and radiation medicine sector and electric power generation.',
    services: [
      'Licensing and regulatory matters for nuclear plants, radioactive apparatus, and hospitals',
      'Health and safety legislation and legal regime',
      'Environmental protection against hazardous wastes',
      'Constant regulatory and statutory compliance and approvals',
      'Commissioning and decommissioning',
      'Transportation of material',
      'Risk of accident, extent of civil liability, and insurance',
      'Indemnification by the state and state liability for licensed plants',
      'Ancillary matters in power and distribution licensing, contracts, and tariffs',
    ],
    clientPortfolio: [
      'Pakistan Institute of Medical Sciences',
      'Shaheed Zulfiqar Ali Bhutto Medical University',
    ],
    keyPersonnel: [],
  },
  {
    id: 14,
    slug: 'public-international-extradition',
    title: 'Public International & Extradition',
    overview:
      'The firm deals with various aspects of international law, with special focus on diplomatic organizations and international air law.',
    services: [
      'Diplomatic and consular immunity',
      'State immunity, privileges, and status',
      'International humanitarian law',
      'International air law and right of passage',
      'Freedoms of the skies',
      'Extradition cases and requests for fugitives and accused persons',
      'Trade quota, tariffs, and general system of preference (EU)',
      'European Aviation Safety Agency and member states\' regulatory matters',
      'Competition and anti-trust',
      'WTO-related matters',
    ],
    clientPortfolio: [
      'Foreign Service Academy, Ministry of Foreign Affairs, Government of Pakistan',
      'Quaid-e-Azam University, Islamabad',
      'German Embassy (Training)',
      'International and diplomatic organizations',
    ],
    keyPersonnel: [
      {
        name: 'Syed Ali Naveed Arshad',
        role: 'Barrister-at-Law, Partner',
        expertise:
          'Member of visiting faculty at Foreign Services Academy. Involved with Ministry of Foreign Affairs in training members of Pakistan Foreign Service. Member of examination panel for Foreign Service Academy.',
      },
    ],
  },
  {
    id: 15,
    slug: 'taxation-customs',
    title: 'Taxation & Customs',
    overview:
      'ARC maintains a diverse and comprehensive tax practice supporting other practice areas, with established reputation in advising both private sector and tax authorities.',
    services: [
      'Transfer pricing',
      'Foreign investment (countries with double taxation arrangements)',
      'Corporate tax',
      'VAT matters (sales tax and federal excise duty)',
      'International tax treaties',
      'Customs duty and tariffs',
      'Tax adjustments and refunds including diplomatic refunds',
      'Importation of sensitive nuclear, hazardous, and radioactive material',
      'Tax issues relating to foreign investment and offshore tax structuring',
      'Tax regime reforms advisory',
      'Departmental representations and handling',
      'Legal representation before tax courts, tribunals, and High Court',
    ],
    clientPortfolio: [
      'Central Board of Revenue, Government of Pakistan',
      'Multinational companies on transaction tax strategy',
      'Tax authorities on tax regime reforms',
    ],
    keyPersonnel: [
      {
        name: 'Aquib Hussain',
        role: 'Tax and Contracts Advisory Specialist',
        expertise:
          '22+ years experience at Senior Manager/Director level with Big-4 (KPMG, PwC, Grant Thornton) in Kuwait and Pakistan. Expert in tax treaties, free trade agreements, corporate laws, and BEPS/CbC reporting. Officially recognized Trainer on Taxes for professional staff and Government\'s Inland Revenue Officers. Experienced in on-shore and off-shore tax structuring.',
      },
      {
        name: 'Syed Ali Naveed Arshad',
        role: 'Barrister-at-Law, Partner',
        expertise:
          'Member of visiting faculty at Directorate of Training and Research (Federal Board of Revenue).',
      },
    ],
  },
]
