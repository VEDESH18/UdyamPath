export const SECTOR_DATA = {
  Education: {
    icon: '📚',
    theme: '#3b82f6', // blue-500
    overview: 'The Indian EdTech sector is massive but highly unequal. While urban students have access to AI tutors, millions in Tier 2/3 cities lack basic digital access or vernacular content. Your challenge is balancing impact with a sustainable revenue model.',
    keyPlayers: ['Pratham (NGO)', 'PhysicsWallah', 'Diksha (Govt)'],
    failureModes: [
      'Building tech that requires high bandwidth (fails in rural areas)',
      'Ignoring the role of parents/teachers in the adoption cycle',
      'Priced out of the target demographic'
    ],
    caseStudy: {
      name: 'RuraLearn Hubs',
      story: 'Started by offering free tablets, ran out of funds in 6 months. Pivoted to partnering with local panchayats to set up single smart-TV classrooms, reducing hardware costs by 90% and reaching sustainability.'
    }
  },
  Health: {
    icon: '🏥',
    theme: '#f43f5e', // rose-500
    overview: 'India has 1 doctor for every 1,456 people, with severe shortages in rural areas. Social health startups must navigate strict medical regulations (Telemedicine Guidelines 2020) and deep-rooted community trust issues.',
    keyPlayers: ['Practo', 'Pharmeasy', 'Aravind Eye Care (Impact Model)'],
    failureModes: [
      'Violating patient data privacy laws',
      'Assuming rural patients will trust an app over a local quack without community hand-holding',
      'High operational costs of physical last-mile delivery'
    ],
    caseStudy: {
      name: 'AshaCare Tech',
      story: 'Tried to replace local health workers (ASHAs) with an app and failed. Pivoted to empowering ASHA workers with the app instead, increasing their efficiency and winning community trust instantly.'
    }
  },
  Agriculture: {
    icon: '🌾',
    theme: '#f59e0b', // amber-500
    overview: 'Over 50% of India relies on agriculture, but supply chains are fragmented. Farmers face climate risks and predatory middlemen. Building trust takes seasons, not weeks.',
    keyPlayers: ['DeHaat', 'Ninjacart', 'Kisan Network'],
    failureModes: [
      "Forcing farmers to change generational habits overnight",
      "Ignoring the reality of poor internet connectivity in fields",
      "Cash flow issues due to crop cycle delays"
    ],
    caseStudy: {
      name: 'KisanConnect',
      story: 'Built a fancy marketplace app but farmers didn\'t trust digital payments. Added a physical "village champion" model to handle cash and build trust, leading to 10x adoption.'
    }
  },
  'Women Empowerment': {
    icon: '👩🏽‍🔧',
    theme: '#a855f7', // purple-500
    overview: 'Female labor force participation in India is alarmingly low. Social enterprises here must navigate patriarchal social structures, safety concerns, and mobility restrictions to create sustainable livelihoods.',
    keyPlayers: ['SEWA', 'Sheroes', 'Urban Company (Impact initiatives)'],
    failureModes: [
      'Ignoring the "double burden" of household chores when setting work hours',
      'Not engaging male family members, leading to resistance',
      'Focusing only on skills training without guaranteed market linkages'
    ],
    caseStudy: {
      name: 'Silai Network',
      story: 'Trained 500 women in tailoring but they couldn\'t find buyers. Pivoted to securing B2B corporate uniform contracts first, then training women to fulfill them, guaranteeing income.'
    }
  },
  Environment: {
    icon: '🌱',
    theme: '#10b981', // emerald-500
    overview: 'From air pollution to solid waste management, India faces severe climate challenges. Cleantech and circular economy models require heavy initial capex and changing deep-rooted consumer behaviors.',
    keyPlayers: ['Phool.co', 'Banyan Nation', 'Lucia'],
    failureModes: [
      'Creating "green premium" products that rural/middle-class Indians cannot afford',
      'Underestimating the complexity of unorganized waste picker networks',
      'Relying solely on grants without a commercial revenue stream'
    ],
    caseStudy: {
      name: 'EcoBricks India',
      story: 'Competed directly with cheap red bricks and lost. Pivoted to selling to corporate CSR projects for eco-friendly office builds, finding a market willing to pay the green premium.'
    }
  },
  "Skill Development": {
    icon: '🛠️',
    theme: '#0ea5e9', // sky-500
    overview: 'Millions enter the Indian workforce every year, but very few are employable. Providing "skilling" is easy, but achieving "employment" is the real metric of success in this sector.',
    keyPlayers: ['NSDC', 'Masai School (ISA Model)', 'NavGurukul'],
    failureModes: [
      'Teaching outdated curriculum disconnected from industry needs',
      'Relying on upfront fees from students who cannot afford them',
      'Failing to partner with hiring companies on Day 1'
    ],
    caseStudy: {
      name: 'CodeRural',
      story: 'Charged upfront for coding bootcamps but dropout rates hit 80%. Switched to an Income Share Agreement (ISA) where students only pay if they get a job, aligning incentives beautifully.'
    }
  },
  Other: {
    icon: '🚀',
    theme: '#f97316', // saffron-500
    overview: 'Social entrepreneurship requires balancing the "Mission" (impact) with the "Margin" (profit). You must solve real problems for underserved communities while building a financially viable engine.',
    keyPlayers: ['Amul (Co-op)', 'Goonj', 'SELCO'],
    failureModes: [
      'Treating beneficiaries as passive recipients rather than active customers',
      'Scaling too fast before achieving product-market fit',
      'Founder burnout from trying to solve everything alone'
    ],
    caseStudy: {
      name: 'Generic Social Co.',
      story: 'Started as a charity model constantly begging for grants. Converted to a cross-subsidy model: charging premium prices to urban customers to subsidize the service for rural customers.'
    }
  }
};

export function getSectorInfo(sectorName) {
  if (!sectorName) return SECTOR_DATA.Other;
  
  if (SECTOR_DATA[sectorName]) return SECTOR_DATA[sectorName];
  
  const match = Object.keys(SECTOR_DATA).find(k => 
    sectorName.toLowerCase().includes(k.toLowerCase())
  );
  
  return match ? SECTOR_DATA[match] : SECTOR_DATA.Other;
}
