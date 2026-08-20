export interface CivicIssue {
  id: string;
  title: string;
  description: string;
  category: "Roads" | "Water" | "Sanitation" | "Electricity" | "Waste" | "Traffic" | "Parks";
  status: "Reported" | "AI Verified" | "Assigned" | "In Progress" | "Resolved";
  urgency: "Critical" | "High" | "Moderate" | "Low";
  location: {
    address: string;
    ward: string;
    wardNumber: number;
    lat: number;
    lng: number;
  };
  reporter: {
    name: string;
    username: string;
    avatar: string;
    isVerified: boolean;
    karma: number;
  };
  images: {
    reported: string;
    resolved?: string;
  };
  aiAnalysis: {
    detectedObject: string;
    confidence: number;
    estimatedSeverity: string;
    predictedDepartment: string;
    suggestedSlaHours: number;
    summary: string;
  };
  assignedDepartment: string;
  assignedOfficer?: {
    name: string;
    role: string;
    avatar: string;
    phone: string;
  };
  timeline: {
    stage: string;
    timestamp: string;
    note: string;
    actor: string;
  }[];
  upvotes: number;
  isUpvoted?: boolean;
  commentsCount: number;
  verificationVotes: {
    yes: number;
    no: number;
    userVoted?: "yes" | "no";
  };
  createdAt: string;
  updatedAt: string;
}

export interface WardInfo {
  name: string;
  number: number;
  city: string;
  corporator: {
    name: string;
    party: string;
    office: string;
    phone: string;
    email: string;
    avatar: string;
  };
  healthScore: number;
  metrics: {
    cleanliness: number;
    roads: number;
    water: number;
    lighting: number;
  };
  budget: {
    allocatedCr: number;
    spentCr: number;
    activeProjects: number;
  };
  stats: {
    totalReports: number;
    resolvedReports: number;
    activeOfficers: number;
    avgResolutionHours: number;
  };
  announcements: {
    id: string;
    title: string;
    date: string;
    category: string;
    content: string;
  }[];
  activePoll: {
    id: string;
    question: string;
    totalVotes: number;
    options: {
      id: string;
      text: string;
      votes: number;
    }[];
  };
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "status" | "upvote" | "ward" | "badge" | "officer";
  timestamp: string;
  read: boolean;
  issueId?: string;
  actionUrl?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  gender?: string;
  avatar: string;
  ward: string;
  wardNumber: number;
  department?: string;
  role: "citizen" | "officer" | "corporator";
  karmaXP: number;
  level: number;
  levelTitle: string;
  verifiedCitizen: boolean;
  aadhaarLinked: boolean;
  stats: {
    issuesReported: number;
    issuesResolved: number;
    upvotesGiven: number;
    verificationVotes: number;
    civicImpactScore: number;
  };
  badges: {
    id: string;
    name: string;
    icon: string;
    description: string;
    unlockedAt: string;
  }[];
}



export const WARD_42_DATA: WardInfo = {
  name: "Ward 63",
  number: 42,
  city: "Bhubaneswar",
  corporator: {
    name: "Smt. Rajeshwari N.",
    party: "Ward Citizen Council",
    office: "Ward 63 Municipal Office, 80ft Road, Ward 63",
    phone: "+91 80 2297 5500",
    email: "corporator.ward63@bmc.gov.in",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
  },
  healthScore: 84,
  metrics: {
    cleanliness: 91,
    roads: 76,
    water: 88,
    lighting: 94,
  },
  budget: {
    allocatedCr: 12.5,
    spentCr: 8.9,
    activeProjects: 7,
  },
  stats: {
    totalReports: 342,
    resolvedReports: 298,
    activeOfficers: 12,
    avgResolutionHours: 18.4,
  },
  announcements: [
    {
      id: "ann-1",
      title: "Ward Town Hall Meeting: Monsoon Drainage Upgrades",
      date: "Sunday, Aug 23, 2026 at 10:00 AM",
      category: "Public Forum",
      content: "All citizens are invited to review the stormwater drainage reconstruction plan for 4th to 9th Cross.",
    },
    {
      id: "ann-2",
      title: "Special Wet & E-Waste Mega Drive this Weekend",
      date: "Saturday & Sunday, Aug 22-23",
      category: "Sanitation",
      content: "Door-to-door collection of obsolete electronics and tree trimmings across all residential sectors.",
    },
  ],
  activePoll: {
    id: "poll-42",
    question: "Should the 5th Cross Road be converted into a Pedestrian-First Green Zone on weekends?",
    totalVotes: 482,
    options: [
      { id: "opt-1", text: "Yes, great for families and air quality", votes: 342 },
      { id: "opt-2", text: "No, need regular vehicle access", votes: 110 },
      { id: "opt-3", text: "Only on Sunday evenings (4 PM - 9 PM)", votes: 30 },
    ],
  },
};

export const INITIAL_ISSUES: CivicIssue[] = [
  {
    id: "JS-101",
    title: "Severe Overflowing Drainage & Stagnant Sewage on 4th Main",
    description: "The main drainage line has ruptured behind the public vegetable market, causing foul smelling wastewater to flood the pedestrian walkway and posing severe health risks.",
    category: "Sanitation",
    status: "In Progress",
    urgency: "Critical",
    location: {
      address: "4th Main Road, Behind City Market, Ward 63",
      ward: "Ward 63",
      wardNumber: 42,
      lat: 12.9611,
      lng: 77.5975,
    },
    reporter: {
      name: "Asmit Gupta",
      username: "asmit_g",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      isVerified: true,
      karma: 1450,
    },
    images: {
      reported: "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800&auto=format&fit=crop&q=80",
      resolved: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80",
    },
    aiAnalysis: {
      detectedObject: "Ruptured Underground Sewage Conduits",
      confidence: 96.8,
      estimatedSeverity: "Critical Bio-Hazard",
      predictedDepartment: "BMC Water Supply",
      suggestedSlaHours: 12,
      summary: "AI detected 15+ meters of high-risk sewage flooding. Automated alert dispatched to sanitary engineering rapid response unit.",
    },
    assignedDepartment: "BMC Water Supply Ward 63 Division",
    assignedOfficer: {
      name: "Er. Ramesh Kulkarni",
      role: "Senior Sanitary Inspector",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
      phone: "+91 94808 12345",
    },
    timeline: [
      {
        stage: "Reported",
        timestamp: "2026-08-15T09:15:00Z",
        note: "Issue submitted by citizen Asmit Gupta with verified geo-tagged photograph.",
        actor: "Citizen Reporter",
      },
      {
        stage: "AI Verified",
        timestamp: "2026-08-15T09:15:04Z",
        note: "AI Computer Vision classified as Critical Sewage Rupture. Priority escalated to Level 1 SLA.",
        actor: "JanSeva AI Engine",
      },
      {
        stage: "Assigned",
        timestamp: "2026-08-15T09:40:00Z",
        note: "Ticket assigned to BMC Ward 63 Senior Inspector Ramesh Kulkarni.",
        actor: "Municipal Dispatch",
      },
      {
        stage: "In Progress",
        timestamp: "2026-08-15T11:20:00Z",
        note: "Suction tanker and repair crew on site. Desilting pipeline.",
        actor: "Er. Ramesh Kulkarni (Officer)",
      },
    ],
    upvotes: 142,
    isUpvoted: true,
    commentsCount: 28,
    verificationVotes: {
      yes: 84,
      no: 6,
      userVoted: "yes",
    },
    createdAt: "2026-08-15T09:15:00Z",
    updatedAt: "2026-08-15T11:20:00Z",
  },
  {
    id: "JS-102",
    title: "Dangerous 1.5-Meter Pothole near Metro Pillar 142",
    description: "Deep crater formed right after yesterday's downpour in the right lane of 80ft Road. Two two-wheelers have already skidded. Requires immediate asphalt patch.",
    category: "Roads",
    status: "Assigned",
    urgency: "Critical",
    location: {
      address: "80 Feet Road, Near Metro Pillar 142, Ward 63",
      ward: "Ward 63",
      wardNumber: 42,
      lat: 12.9634,
      lng: 77.5998,
    },
    reporter: {
      name: "Pooja Hegde",
      username: "pooja_h",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
      isVerified: true,
      karma: 890,
    },
    images: {
      reported: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80",
    },
    aiAnalysis: {
      detectedObject: "Deep Asphalt Cavity / Road Hazard",
      confidence: 98.2,
      estimatedSeverity: "High Traffic Accident Risk",
      predictedDepartment: "BMC Road Infrastructure",
      suggestedSlaHours: 24,
      summary: "AI detected 1.5m diameter, ~15cm deep pothole located in fast lane. Immediate barricading recommended.",
    },
    assignedDepartment: "BMC Road Infrastructure",
    assignedOfficer: {
      name: "V. Somanna",
      role: "Assistant Executive Engineer",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
      phone: "+91 94808 67890",
    },
    timeline: [
      {
        stage: "Reported",
        timestamp: "2026-08-15T08:30:00Z",
        note: "Report logged via Mobile AI Quick Snap.",
        actor: "Pooja Hegde",
      },
      {
        stage: "AI Verified",
        timestamp: "2026-08-15T08:30:03Z",
        note: "Geo-fenced against Ward 63 road asset register. Duplicate check passed.",
        actor: "JanSeva AI Engine",
      },
      {
        stage: "Assigned",
        timestamp: "2026-08-15T09:00:00Z",
        note: "Assigned to rapid cold-mix asphalt patching squad #4.",
        actor: "Ward Operations",
      },
    ],
    upvotes: 98,
    isUpvoted: false,
    commentsCount: 15,
    verificationVotes: {
      yes: 0,
      no: 0,
    },
    createdAt: "2026-08-15T08:30:00Z",
    updatedAt: "2026-08-15T09:00:00Z",
  },
  {
    id: "JS-103",
    title: "12 LED Streetlights Non-Functioning along 8th Cross",
    description: "Entire 300m stretch of 8th Cross is pitch dark at night, causing safety concerns for women and senior citizens walking from the bus stop.",
    category: "Electricity",
    status: "Resolved",
    urgency: "High",
    location: {
      address: "8th Cross, Sector 3, Ward 63",
      ward: "Ward 63",
      wardNumber: 42,
      lat: 12.9589,
      lng: 77.5942,
    },
    reporter: {
      name: "Kiran Kumar",
      username: "kiran_k",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80",
      isVerified: true,
      karma: 620,
    },
    images: {
      reported: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&auto=format&fit=crop&q=80",
      resolved: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80",
    },
    aiAnalysis: {
      detectedObject: "Defective Streetlight Luminaires / Phase Fault",
      confidence: 94.5,
      estimatedSeverity: "Public Safety Risk",
      predictedDepartment: "BMC Public Lighting",
      suggestedSlaHours: 24,
      summary: "Feeder pillar circuit fault detected affecting 12 consecutive streetlights.",
    },
    assignedDepartment: "BMC Public Lighting",
    assignedOfficer: {
      name: "Suresh Babu",
      role: "Junior Electrical Engineer",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80",
      phone: "+91 94808 33221",
    },
    timeline: [
      {
        stage: "Reported",
        timestamp: "2026-08-14T19:00:00Z",
        note: "Report submitted with nighttime photo.",
        actor: "Kiran Kumar",
      },
      {
        stage: "Assigned",
        timestamp: "2026-08-14T20:15:00Z",
        note: "BMC night maintenance van dispatched.",
        actor: "Operations Center",
      },
      {
        stage: "In Progress",
        timestamp: "2026-08-14T22:30:00Z",
        note: "Replaced burnt MCB switch and 4 faulty LED drivers.",
        actor: "Suresh Babu",
      },
      {
        stage: "Resolved",
        timestamp: "2026-08-15T01:10:00Z",
        note: "All 12 lamps restored and verified by sensor telemetry.",
        actor: "Suresh Babu",
      },
    ],
    upvotes: 215,
    isUpvoted: true,
    commentsCount: 34,
    verificationVotes: {
      yes: 112,
      no: 3,
      userVoted: "yes",
    },
    createdAt: "2026-08-14T19:00:00Z",
    updatedAt: "2026-08-15T01:10:00Z",
  },
  {
    id: "JS-104",
    title: "Commercial Garbage Dump & Black Spot near Community Park Gate",
    description: "Unsegregated commercial waste from nearby eateries dumped outside park entry gate. Stray dogs and cows tearing bags, blocking park walkway.",
    category: "Waste",
    status: "AI Verified",
    urgency: "High",
    location: {
      address: "Main Gate, Ward 63 Community Park, 2nd Stage",
      ward: "Ward 63",
      wardNumber: 42,
      lat: 12.9655,
      lng: 77.5921,
    },
    reporter: {
      name: "Dr. Ananya Roy",
      username: "ananya_roy",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
      isVerified: true,
      karma: 1120,
    },
    images: {
      reported: "https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&auto=format&fit=crop&q=80",
    },
    aiAnalysis: {
      detectedObject: "Mixed Commercial Solid Waste / Black Spot",
      confidence: 97.4,
      estimatedSeverity: "Sanitary Violation & Nuisance",
      predictedDepartment: "BMC Sanitation",
      suggestedSlaHours: 8,
      summary: "AI recognized commercial packaging. Recommended immediate cleanup compactor and CCTV marshaling installation.",
    },
    assignedDepartment: "Solid Waste Management Cell",
    timeline: [
      {
        stage: "Reported",
        timestamp: "2026-08-15T07:45:00Z",
        note: "Reported with high-resolution evidence.",
        actor: "Dr. Ananya Roy",
      },
      {
        stage: "AI Verified",
        timestamp: "2026-08-15T07:45:02Z",
        note: "AI verified black spot violation. Automated fine notice generated for adjacent commercial vendors.",
        actor: "JanSeva AI Engine",
      },
    ],
    upvotes: 76,
    isUpvoted: false,
    commentsCount: 12,
    verificationVotes: {
      yes: 0,
      no: 0,
    },
    createdAt: "2026-08-15T07:45:00Z",
    updatedAt: "2026-08-15T07:45:02Z",
  },
  {
    id: "JS-105",
    title: "Major Drinking Water Pipeline Rupture Leaking Potable Water",
    description: "High pressure potable water line cracked near Substation #2. Clean drinking water gushing across the road for over 3 hours while local taps run dry.",
    category: "Water",
    status: "In Progress",
    urgency: "Critical",
    location: {
      address: "Opposite BMC Substation, 1st Cross, Ward 63",
      ward: "Ward 63",
      wardNumber: 42,
      lat: 12.9602,
      lng: 77.5961,
    },
    reporter: {
      name: "Mohit Deshmukh",
      username: "mohit_d",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
      isVerified: true,
      karma: 450,
    },
    images: {
      reported: "https://images.unsplash.com/photo-1584467735815-f778f274e296?w=800&auto=format&fit=crop&q=80",
    },
    aiAnalysis: {
      detectedObject: "Pressurized Potable Water Main Rupture",
      confidence: 99.1,
      estimatedSeverity: "High Resource Loss & Scarcity Risk",
      predictedDepartment: "BMC Water Supply",
      suggestedSlaHours: 6,
      summary: "AI calculated loss rate ~400 liters/min. Valve shutoff protocol initiated.",
    },
    assignedDepartment: "BMC Water Supply",
    assignedOfficer: {
      name: "Er. Manjunath Swamy",
      role: "Water Supply Engineer",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80",
      phone: "+91 94808 99887",
    },
    timeline: [
      {
        stage: "Reported",
        timestamp: "2026-08-15T10:00:00Z",
        note: "Citizen report logged with water pressure video.",
        actor: "Mohit Deshmukh",
      },
      {
        stage: "AI Verified",
        timestamp: "2026-08-15T10:00:03Z",
        note: "Emergency alert sent to BMC Central Control.",
        actor: "JanSeva AI Engine",
      },
      {
        stage: "Assigned",
        timestamp: "2026-08-15T10:15:00Z",
        note: "Engineer Manjunath dispatched with pipeline welding crew.",
        actor: "Control Room",
      },
      {
        stage: "In Progress",
        timestamp: "2026-08-15T10:45:00Z",
        note: "Main line isolation valve closed. Excavation and sleeve fitting ongoing.",
        actor: "Er. Manjunath Swamy",
      },
    ],
    upvotes: 184,
    isUpvoted: true,
    commentsCount: 42,
    verificationVotes: {
      yes: 18,
      no: 1,
    },
    createdAt: "2026-08-15T10:00:00Z",
    updatedAt: "2026-08-15T10:45:00Z",
  },
  {
    id: "JS-106",
    title: "Traffic Signal Failure Causing Gridlock at Double Road Junction",
    description: "Both north and south signals blinking orange simultaneously. High vehicle density creating 1.5km backlog during morning peak office hours.",
    category: "Traffic",
    status: "Resolved",
    urgency: "Critical",
    location: {
      address: "Double Road & Lalbagh Road Junction, Ward 63",
      ward: "Ward 63",
      wardNumber: 42,
      lat: 12.9554,
      lng: 77.5933,
    },
    reporter: {
      name: "Deepak Sharma",
      username: "deepak_sh",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
      isVerified: true,
      karma: 780,
    },
    images: {
      reported: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&auto=format&fit=crop&q=80",
      resolved: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop&q=80",
    },
    aiAnalysis: {
      detectedObject: "Traffic Light Controller Desynchronization",
      confidence: 96.0,
      estimatedSeverity: "Severe Congestion Hazard",
      predictedDepartment: "Bhubaneswar Traffic Police (BTP)",
      suggestedSlaHours: 2,
      summary: "Signal PLC controller rebooted remotely and traffic wardens deployed for manual override.",
    },
    assignedDepartment: "Traffic Management Center (BTP)",
    assignedOfficer: {
      name: "Inspector Srinivas Rao",
      role: "Traffic Sub-Inspector",
      avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80",
      phone: "+91 80 2294 2222",
    },
    timeline: [
      {
        stage: "Reported",
        timestamp: "2026-08-15T08:10:00Z",
        note: "Live report logged from commuter.",
        actor: "Deepak Sharma",
      },
      {
        stage: "In Progress",
        timestamp: "2026-08-15T08:18:00Z",
        note: "2 Traffic constables deployed on ground for manual regulation.",
        actor: "Inspector Srinivas Rao",
      },
      {
        stage: "Resolved",
        timestamp: "2026-08-15T08:45:00Z",
        note: "TMC recalibrated signal timing sequence. Traffic normalized.",
        actor: "Inspector Srinivas Rao",
      },
    ],
    upvotes: 160,
    isUpvoted: false,
    commentsCount: 19,
    verificationVotes: {
      yes: 94,
      no: 2,
    },
    createdAt: "2026-08-15T08:10:00Z",
    updatedAt: "2026-08-15T08:45:00Z",
  },
  {
    id: "JS-107",
    title: "Fallen Gulmohar Tree Branches Blocking Footpath & Electric Line",
    description: "Heavy branch snapped during thunderstorm and is hanging dangerously on telephone and secondary power cables, obstructing children walking to school.",
    category: "Parks",
    status: "In Progress",
    urgency: "Moderate",
    location: {
      address: "Near St. Joseph High School, 3rd Cross, Ward 63",
      ward: "Ward 63",
      wardNumber: 42,
      lat: 12.9641,
      lng: 77.5982,
    },
    reporter: {
      name: "Sneha Reddy",
      username: "sneha_r",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      isVerified: true,
      karma: 530,
    },
    images: {
      reported: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80",
    },
    aiAnalysis: {
      detectedObject: "Hazardous Tree Limb / Overhead Wire Entanglement",
      confidence: 95.7,
      estimatedSeverity: "Moderate Risk to Pedestrians",
      predictedDepartment: "BMC Parks & Gardens",
      suggestedSlaHours: 18,
      summary: "Tree pruning team with hydraulic lift scheduled.",
    },
    assignedDepartment: "BMC Parks & Gardens",
    assignedOfficer: {
      name: "Praveen Gowda",
      role: "Horticulture Supervisor",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
      phone: "+91 94808 55443",
    },
    timeline: [
      {
        stage: "Reported",
        timestamp: "2026-08-15T06:30:00Z",
        note: "Reported with photos of hanging branch.",
        actor: "Sneha Reddy",
      },
      {
        stage: "Assigned",
        timestamp: "2026-08-15T08:00:00Z",
        note: "Hydraulic sky-lift crew assigned.",
        actor: "Forest Cell",
      },
      {
        stage: "In Progress",
        timestamp: "2026-08-15T11:00:00Z",
        note: "Pruning branch in coordination with TPCODL power shutdown.",
        actor: "Praveen Gowda",
      },
    ],
    upvotes: 62,
    isUpvoted: false,
    commentsCount: 9,
    verificationVotes: {
      yes: 12,
      no: 0,
    },
    createdAt: "2026-08-15T06:30:00Z",
    updatedAt: "2026-08-15T11:00:00Z",
  },
  {
    id: "JS-108",
    title: "Broken Playground Swings & Rusted Slide at Children's Park",
    description: "Two child swings have broken chains with exposed sharp edges. Toddler slide has dangerous rusted base. Requires replacement before weekend.",
    category: "Parks",
    status: "Assigned",
    urgency: "Moderate",
    location: {
      address: "Rose Garden Park, 6th Cross, Ward 63",
      ward: "Ward 63",
      wardNumber: 42,
      lat: 12.9572,
      lng: 77.5958,
    },
    reporter: {
      name: "Asmit Gupta",
      username: "asmit_g",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      isVerified: true,
      karma: 1450,
    },
    images: {
      reported: "https://images.unsplash.com/photo-1575783970733-1aaedde1db74?w=800&auto=format&fit=crop&q=80",
    },
    aiAnalysis: {
      detectedObject: "Damaged Public Playground Equipment",
      confidence: 93.8,
      estimatedSeverity: "Child Injury Safety Hazard",
      predictedDepartment: "BMC Parks & Gardens",
      suggestedSlaHours: 48,
      summary: "Equipment replacement requisition auto-filed with parks maintenance budget.",
    },
    assignedDepartment: "BMC Parks & Gardens",
    timeline: [
      {
        stage: "Reported",
        timestamp: "2026-08-14T16:00:00Z",
        note: "Filed by parent with photo proof.",
        actor: "Asmit Gupta",
      },
      {
        stage: "Assigned",
        timestamp: "2026-08-15T09:30:00Z",
        note: "Requisition sent to playground equipment vendor.",
        actor: "Parks Division",
      },
    ],
    upvotes: 89,
    isUpvoted: true,
    commentsCount: 14,
    verificationVotes: {
      yes: 0,
      no: 0,
    },
    createdAt: "2026-08-14T16:00:00Z",
    updatedAt: "2026-08-15T09:30:00Z",
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Officer Dispatched to Your Report",
    message: "Senior Inspector Ramesh Kulkarni has been assigned to your report #JS-101 (Overflowing Drainage).",
    type: "officer",
    timestamp: "2026-08-15T11:20:00Z",
    read: false,
    issueId: "JS-101",
    actionUrl: "/issues/JS-101",
  },
  {
    id: "notif-2",
    title: "Community Upvote Milestone! 🔥",
    message: "Your report on 4th Main Drainage reached 140+ neighbor upvotes and has been boosted to Ward 63 Priority #1.",
    type: "upvote",
    timestamp: "2026-08-15T10:45:00Z",
    read: false,
    issueId: "JS-101",
    actionUrl: "/issues/JS-101",
  },
  {
    id: "notif-3",
    title: "Issue Resolved: Streetlights on 8th Cross",
    message: "BMC restored 12 streetlights. Please cast your citizen verification vote to confirm fix!",
    type: "status",
    timestamp: "2026-08-15T01:15:00Z",
    read: true,
    issueId: "JS-103",
    actionUrl: "/issues/JS-103",
  },
  {
    id: "notif-4",
    title: "New Civic Badge Unlocked: Ward Hero 🏆",
    message: "You've earned +250 Karma XP for active contributions to Ward 63 cleanliness metrics.",
    type: "badge",
    timestamp: "2026-08-14T18:00:00Z",
    read: true,
    actionUrl: "/profile",
  },
  {
    id: "notif-5",
    title: "Ward Town Hall Notice",
    message: "Smt. Rajeshwari N. announced Monsoon Drainage Review on Sunday at 10 AM.",
    type: "ward",
    timestamp: "2026-08-14T12:00:00Z",
    read: true,
    actionUrl: "/ward",
  }
];

export const TOP_LEADERBOARD = [
  { rank: 1, name: "Asmit Gupta", ward: "Ward 63", karma: 1450, badge: "Civic Champion", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" },
  { rank: 2, name: "Dr. Ananya Roy", ward: "Ward 63", karma: 1120, badge: "Green Guardian", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80" },
  { rank: 3, name: "Pooja Hegde", ward: "Ward 63", karma: 890, badge: "Urban Scout", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" },
  { rank: 4, name: "Deepak Sharma", ward: "Ward 41", karma: 780, badge: "Transit Ally", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80" },
  { rank: 5, name: "Kiran Kumar", ward: "Ward 63", karma: 620, badge: "Safety Pioneer", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80" },
];
