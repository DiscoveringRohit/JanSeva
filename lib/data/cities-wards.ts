export interface WardOption {
  number: number;
  name: string;
  city: string;
}

export const CITIES_LIST = [
  "Bengaluru",
  "Mumbai",
  "Delhi NCR",
  "Hyderabad",
  "Pune",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
];

export const CITY_WARDS_MAP: Record<string, WardOption[]> = {
  Bengaluru: [
    { number: 42, name: "Ward 42 • Shanti Nagar", city: "Bengaluru" },
    { number: 150, name: "Ward 150 • Bellandur", city: "Bengaluru" },
    { number: 174, name: "Ward 174 • HSR Layout", city: "Bengaluru" },
    { number: 85, name: "Ward 85 • Koramangala", city: "Bengaluru" },
    { number: 112, name: "Ward 112 • Domlur / Indiranagar", city: "Bengaluru" },
    { number: 12, name: "Ward 12 • Malleshwaram", city: "Bengaluru" },
    { number: 93, name: "Ward 93 • Vasanth Nagar", city: "Bengaluru" },
    { number: 160, name: "Ward 160 • Raja Rajeshwari Nagar", city: "Bengaluru" },
  ],
  Mumbai: [
    { number: 1, name: "Ward A • Colaba & Fort", city: "Mumbai" },
    { number: 4, name: "Ward D • Malabar Hill & Grant Road", city: "Mumbai" },
    { number: 8, name: "Ward H-West • Bandra & Khar", city: "Mumbai" },
    { number: 11, name: "Ward K-West • Andheri West & Juhu", city: "Mumbai" },
    { number: 7, name: "Ward G-South • Worli & Lower Parel", city: "Mumbai" },
  ],
  "Delhi NCR": [
    { number: 12, name: "Ward 12 • Connaught Place & Janpath", city: "Delhi NCR" },
    { number: 45, name: "Ward 45 • Hauz Khas & Saket", city: "Delhi NCR" },
    { number: 88, name: "Ward 88 • Dwarka Sub-City", city: "Delhi NCR" },
    { number: 102, name: "Ward 102 • Rohini Sector 15", city: "Delhi NCR" },
  ],
  Hyderabad: [
    { number: 62, name: "Ward 62 • Jubilee Hills & Banjara Hills", city: "Hyderabad" },
    { number: 98, name: "Ward 98 • Gachibowli & HITEC City", city: "Hyderabad" },
    { number: 104, name: "Ward 104 • Madhapur", city: "Hyderabad" },
    { number: 35, name: "Ward 35 • Begumpet", city: "Hyderabad" },
  ],
  Pune: [
    { number: 15, name: "Ward 15 • Kothrud & Karve Nagar", city: "Pune" },
    { number: 21, name: "Ward 21 • Viman Nagar & Kalyani Nagar", city: "Pune" },
    { number: 28, name: "Ward 28 • Baner & Balewadi", city: "Pune" },
    { number: 8, name: "Ward 8 • Shivajinagar", city: "Pune" },
  ],
  Chennai: [
    { number: 114, name: "Ward 114 • T. Nagar & Mambalam", city: "Chennai" },
    { number: 173, name: "Ward 173 • Adyar & Besant Nagar", city: "Chennai" },
    { number: 128, name: "Ward 128 • Mylapore", city: "Chennai" },
    { number: 95, name: "Ward 95 • Anna Nagar", city: "Chennai" },
  ],
  Kolkata: [
    { number: 63, name: "Ward 63 • Park Street & Camac Street", city: "Kolkata" },
    { number: 86, name: "Ward 86 • Ballygunge & Gariahat", city: "Kolkata" },
    { number: 31, name: "Ward 31 • Salt Lake Sector V", city: "Kolkata" },
  ],
  Ahmedabad: [
    { number: 14, name: "Ward 14 • Navrangpura", city: "Ahmedabad" },
    { number: 22, name: "Ward 22 • Bodakdev & Satellite", city: "Ahmedabad" },
    { number: 29, name: "Ward 29 • Vastrapur", city: "Ahmedabad" },
  ],
};
