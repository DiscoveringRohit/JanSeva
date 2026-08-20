export const DEFAULT_LOCATION = {
  state: "Odisha",
  city: "Bhubaneswar",
  ward: "Ward 63",
  wardNumber: 63,
  pincode: "751030",
  municipalBody: "BMC",
  departments: {
    roads: "BMC Road Infrastructure",
    water: "BMC Water Supply",
    sanitation: "BMC Sanitation",
    electricity: "BMC Public Lighting",
    parks: "BMC Parks & Gardens",
    police: "Bhubaneswar Traffic Police (BTP)"
  }
};

export const DEFAULT_USER_FALLBACK = {
  ward: DEFAULT_LOCATION.ward,
  wardNumber: DEFAULT_LOCATION.wardNumber,
  city: DEFAULT_LOCATION.city,
  avatar: ""
};

export const GUEST_USER = {
  name: "Guest Citizen",
  avatar: ""
};
