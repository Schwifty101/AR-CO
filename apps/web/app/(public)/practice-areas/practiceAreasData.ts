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
  description?: string
  image: string
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
    image: '/practic-areas/intellectual_property.jpg',
    overview:
      'The Islamabad office operates one of the most active intellectual property practices in Pakistan\'s capital, handling all types of trademark, copyright, and patent matters.',
    description:
      'In today\'s knowledge-driven economy, intellectual property represents one of the most valuable assets a business can possess. Our IP practice combines deep technical knowledge with strategic legal insight to protect your innovations, brands, and creative works across Pakistan and internationally. We understand that IP rights are not just legal instruments—they are competitive advantages that can define market leadership. Our team works closely with inventors, entrepreneurs, and multinational corporations to develop comprehensive IP strategies that align with business objectives while ensuring robust protection against infringement.',
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
    image: '/practic-areas/power_generation.jpg',
    overview:
      'The firm has extensive experience in power generation and distribution regulation through direct involvement with regulatory authorities.',
    description:
      'Pakistan\'s power sector has undergone significant transformation over the past two decades, creating complex regulatory frameworks that require specialized legal expertise. Our firm has been at the forefront of this evolution, with partners who have served in key regulatory positions at NEPRA and understand the sector from both regulatory and commercial perspectives. We guide clients through the intricacies of generation licensing, grid connectivity, tariff determination, and compliance requirements. Whether you\'re developing a new power project or navigating regulatory disputes, our team provides the strategic counsel needed to succeed in Pakistan\'s dynamic energy market.',
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
    title: 'Petroleum & Energy',
    image: '/practic-areas/petroleum.jpg',
    overview:
      'The firm delivers comprehensive services in petroleum/oil, gas, and energy sectors. Pioneer in arranging seminars on natural gas shortage and LNG transportation importance.',
    description:
      'As Pakistan continues to develop its oil and gas resources while addressing energy security challenges, the legal landscape has become increasingly sophisticated. Our petroleum and energy practice stands at the intersection of complex regulatory frameworks, international investment, and strategic national interests. We have played pivotal roles in landmark projects including the establishment of Pakistan LNG Terminals and have advised major international players like Tullow Petroleum. Our expertise spans the entire value chain—from upstream exploration and production to midstream transportation and downstream marketing. We understand the unique challenges of operating in Pakistan\'s energy sector and provide practical solutions that address both commercial objectives and regulatory compliance.',
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
    image: '/practic-areas/renewable_energy.jpg',
    overview:
      'A.R. & Co. is recognized as Pakistan\'s leading renewable energy and environmental law firm, providing specialized services from deal-making negotiations to project execution and regulatory compliance.',
    description:
      'Climate change and sustainable development have become defining challenges of our era, and Pakistan\'s commitment to renewable energy represents both an environmental imperative and an economic opportunity. Our firm has established itself as the preeminent legal advisor in this rapidly evolving space, working closely with the Alternate Energy Development Board and international carbon finance specialists. We bring together expertise in environmental law, project finance, and regulatory compliance to support wind, solar, hydro, and biomass projects across Pakistan. From navigating the Clean Development Mechanism under the Kyoto Protocol to structuring Emission Reduction Purchase Agreements, our team provides the specialized knowledge essential for success in the green energy transition.',
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
    title: 'Dispute Resolution',
    image: '/practic-areas/arbitration.jpg',
    overview:
      'The firm provides legal representation in international and domestic arbitrations with extensive experience in civil and criminal litigation. Recognized as Pakistan\'s leading deal-making negotiations firm.',
    description:
      'Effective dispute resolution requires not just legal expertise but strategic vision and unwavering commitment to client interests. Our litigation and ADR practice has earned recognition for handling some of Pakistan\'s most consequential cases—from landmark constitutional petitions that have shaped media freedom and civil liberties to high-stakes commercial arbitrations involving international parties. Our team includes Chartered Arbitrators certified by the Institute of Chartered Arbitrators, London, and faculty members at the Federal Judicial Academy, bringing academic rigor to practical advocacy. We have successfully represented clients before the Supreme Court of Pakistan, High Courts, regulatory tribunals, and international arbitration forums. Whether through negotiation, mediation, arbitration, or litigation, we pursue the most effective path to protect our clients\' rights and interests.',
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
    title: 'Financial Institutions',
    image: '/practic-areas/banking.jpg',
    overview:
      'The financial sector forms part of the firm\'s core legal practice with wide-ranging experience in specialized legal services.',
    description:
      'The banking and financial services sector operates within one of the most heavily regulated environments in Pakistan\'s economy, requiring legal advisors who understand both the letter of the law and the practical realities of financial transactions. Our practice serves major domestic and international financial institutions including China Development Bank, MCB Bank, and Askari Bank. We provide comprehensive support across the full spectrum of banking activities—from structuring complex syndicated loans and Islamic finance products to handling recovery proceedings and regulatory compliance matters. Our team combines deep knowledge of the State Bank of Pakistan\'s regulatory framework with practical experience in commercial lending, trade finance, and financial restructuring, enabling us to deliver solutions that meet both business objectives and regulatory requirements.',
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
    image: '/practic-areas/corporate.jpg',
    overview:
      'Corporate and commercial law forms part of the firm\'s core practice with particular expertise in a broad range of corporate commercial matters for both Pakistan-based and foreign corporations.',
    description:
      'In an increasingly interconnected global economy, businesses require legal partners who can navigate complex corporate structures, regulatory requirements, and cross-border transactions with precision and foresight. Our corporate and commercial practice has advised multinational giants like China Development Bank, Holiday Inn Hotels, and China Construction on their Pakistani operations, while supporting domestic enterprises in their growth and expansion. We bring together specialists in company law, securities regulation, foreign investment, and commercial contracts to provide holistic counsel that addresses every aspect of corporate life—from incorporation and governance to mergers, acquisitions, and restructuring. Our client-focused approach ensures that legal strategies align with business goals while maintaining full compliance with SECP regulations and corporate governance standards.',
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
    title: 'Telecommunication',
    image: '/practic-areas/telecom.jpg',
    overview:
      'One of the most progressive specialties of the firm, acting for various market leaders in telecom and media sectors.',
    description:
      'The convergence of telecommunications, technology, and media has created one of the most dynamic and rapidly evolving legal landscapes in Pakistan. Our practice sits at this exciting intersection, representing industry leaders including PTCL, Ufone, ARY Digital, BOL Media Group, and Ten Sports. We understand that success in these sectors requires not just legal knowledge but deep industry insight and the ability to anticipate regulatory developments. From licensing and spectrum allocation to content regulation and interconnection disputes, we provide comprehensive support that enables our clients to innovate and compete effectively. Our experience before the Pakistan Telecommunication Authority and PEMRA, combined with our involvement in landmark media freedom cases, positions us uniquely to navigate the complex interplay between technology, regulation, and constitutional rights.',
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
    title: 'Construction',
    image: '/practic-areas/construction.jpg',
    overview:
      'A key specialty of the firm, delivering complete and comprehensive service to diverse sections of the industry, from international consortium companies to local property investors. Clients range from small transactions to multi-million dollar investments.',
    description:
      'Real estate and construction represent some of the most significant investments individuals and corporations make, requiring legal counsel that combines technical precision with commercial pragmatism. Our practice has been instrumental in landmark developments including the Grand Hyatt and Centaurus projects with China Construction, reflecting our capability to handle the most complex, high-value transactions in the market. We serve the full spectrum of industry participants—from international consortiums executing multi-million dollar projects to individual investors acquiring residential or commercial properties. Our services encompass thorough due diligence, title verification, construction contract negotiation, regulatory compliance, and dispute resolution. We understand the unique challenges of Pakistan\'s real estate market, including complex land records, regulatory requirements, and stakeholder dynamics, and we leverage this knowledge to protect our clients\' investments.',
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
    title: 'Charities & NGOs',
    image: '/practic-areas/corporate.jpg',
    overview:
      'The firm provides regulatory advising and compliance for international and local charities, from incorporation to ongoing operations.',
    description:
      'Non-profit organizations play a vital role in Pakistan\'s social development, yet they operate within an increasingly complex regulatory environment that requires specialized legal guidance. Our practice supports international and local charities, trusts, and NGOs through every stage of their operations—from initial incorporation and registration to ongoing compliance and programmatic expansion. We have particular expertise in navigating the requirements of international donor organizations and ensuring that charitable activities conform to both Pakistani law and global standards. Our work with the National Commission on the Status of Women, Human Rights Ministry, and Federal Ombudsman on Harassment demonstrates our commitment to organizations working for social justice and institutional reform. We help non-profits structure their operations efficiently while maintaining the transparency and accountability that donors and regulators require.',
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
    title: 'Engineering',
    image: '/practic-areas/construction.jpg',
    overview:
      'Engineering forms a key area of practice closely related to construction and real estate development, with specialized expertise developed independently.',
    description:
      'Large-scale engineering projects involve intricate contractual relationships, significant technical risks, and substantial financial stakes that demand legal advisors with specialized expertise. Our engineering practice has developed deep capabilities in handling Engineering, Procurement, and Construction (EPC) contracts, joint venture agreements, and technical dispute resolution. We represent leading engineering companies and multinational consortiums, including matters for the National Highway Authority on critical infrastructure projects. Our team understands the unique challenges of engineering projects—from managing employer-contractor relationships and subcontractor coordination to addressing performance guarantees and delay claims. We are experienced in FIDIC contract frameworks and international arbitration procedures, enabling us to support clients in both domestic and cross-border engineering ventures. When disputes arise, our combination of legal expertise and technical understanding allows us to effectively advocate for our clients\' interests.',
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
    image: '/practic-areas/corporate.jpg',
    overview:
      'The firm undertakes immigration matters to cater for specific client needs, reflecting global migration trends.',
    description:
      'In an era of global mobility, immigration matters affect individuals, families, and businesses with increasing frequency and complexity. Our immigration practice provides comprehensive support for clients navigating visa applications, work permits, residency requirements, and immigration proceedings across multiple jurisdictions. Through our network of associate offices and professional relationships, we offer in-depth legal coverage for immigration matters in Pakistan, the United Kingdom, Canada, Australia, and Switzerland. We work closely with educational institutions including David Game School and College in London, supporting students and professionals pursuing opportunities abroad. Our approach combines thorough case preparation with strategic presentation before immigration authorities, maximizing the prospects of favorable outcomes. Whether you\'re seeking to relocate for work, study, or family reunification, our team provides the guidance and advocacy needed to navigate complex immigration systems.',
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
    title: 'Nuclear Law',
    image: '/practic-areas/nuclear.jpg',
    overview:
      'ARC is one of the few pioneer firms to provide legal cover for the nuclear and radiation medicine sector and electric power generation.',
    description:
      'Nuclear law represents one of the most specialized and demanding areas of legal practice, requiring expertise that few firms possess. A.R. & Co. stands among the pioneering law firms in Pakistan providing comprehensive legal services for the nuclear energy sector and radiation medicine industry. Our practice addresses the full lifecycle of nuclear activities—from licensing and regulatory compliance to liability management and environmental protection. We understand the unique legal frameworks governing nuclear operations, including international conventions on nuclear safety and civil liability. Our clients include major medical institutions like Pakistan Institute of Medical Sciences and Shaheed Zulfiqar Ali Bhutto Medical University, for whom we navigate the complex regulations surrounding radioactive materials in healthcare settings. Whether advising on nuclear power plant operations, radiation safety compliance, or the transportation of nuclear materials, our team provides the specialized expertise that this critical sector demands.',
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
    title: 'Public International',
    image: '/practic-areas/corporate.jpg',
    overview:
      'The firm deals with various aspects of international law, with special focus on diplomatic organizations and international air law.',
    description:
      'Public international law governs the relationships between nations and affects everything from diplomatic immunity to international trade. Our practice has developed particular expertise in this sophisticated area, with partners serving on the visiting faculty at the Foreign Service Academy and participating in training programs for Pakistan\'s diplomatic corps. We advise on matters of diplomatic and consular immunity, state privileges, international humanitarian law, and the complex legal frameworks governing international aviation. Our European Union practice addresses trade quotas, regulatory compliance with EASA, competition law, and the movement of goods within the EU market. Through our associate office in Rome, we provide comprehensive coverage of international legal matters affecting our clients\' cross-border activities. For extradition cases, we combine deep knowledge of international treaties with effective advocacy to protect our clients\' rights.',
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
    image: '/practic-areas/banking.jpg',
    overview:
      'ARC maintains a diverse and comprehensive tax practice supporting other practice areas, with established reputation in advising both private sector and tax authorities.',
    description:
      'Taxation affects every aspect of business and personal financial planning, requiring advisors who combine technical expertise with strategic insight. Our tax practice brings together professionals with Big-4 experience (KPMG, PwC, Grant Thornton) and deep knowledge of Pakistan\'s tax system to deliver comprehensive solutions for domestic and multinational clients. We advise on the full spectrum of tax matters—from corporate tax planning and transfer pricing to VAT compliance and customs duties. Our team includes officially recognized trainers for the Federal Board of Revenue and has advised the Central Board of Revenue on tax regime reforms. For international clients, we provide guidance on double taxation treaties, BEPS compliance, and offshore tax structuring. Whether you\'re planning a major transaction, facing a tax audit, or seeking to optimize your tax position, our practice provides the expertise and advocacy needed to achieve favorable outcomes.',
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
