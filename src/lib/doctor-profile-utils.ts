export const SPECIALIZATIONS = [
  "Cardiology",
  "Medicine",
  "Gynecology",
  "Pediatrics",
  "Orthopedics",
  "Dermatology",
  "Neurology",
  "Psychiatry",
  "Ophthalmology",
  "ENT",
  "Gastroenterology",
  "Urology",
  "Nephrology",
  "Pulmonology",
  "Endocrinology",
  "Oncology",
  "Hematology",
  "Rheumatology",
  "General Surgery",
  "Plastic Surgery",
  "Dental",
  "Physiotherapy",
  "Radiology",
  "Pathology",
  "Anesthesiology",
  "Emergency Medicine",
  "Family Medicine",
  "Sports Medicine",
] as const;

export const LANGUAGES = [
  "Bangla",
  "English",
  "Hindi",
  "Arabic",
  "Urdu",
] as const;

export const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday", short: "Sun" },
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" },
  { value: 6, label: "Saturday", short: "Sat" },
] as const;

export const COMMON_SERVICES = [
  "Hypertension",
  "Diabetes",
  "Pregnancy Care",
  "Heart Disease",
  "Thyroid",
  "Asthma",
  "Skin Problems",
  "Weight Management",
  "Mental Health",
  "Vaccination",
  "Health Checkup",
  "ECG",
  "Ultrasound",
  "Blood Tests",
  "X-Ray",
] as const;

export const generateSlug = (name: string, specialization?: string): string => {
  const cleanName = name
    .toLowerCase()
    .replace(/^dr\.?\s*/i, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  
  const cleanSpec = specialization
    ? specialization.toLowerCase().replace(/[^a-z]/g, "")
    : "";
  
  return cleanSpec ? `dr-${cleanName}-${cleanSpec}` : `dr-${cleanName}`;
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11 && cleaned.startsWith("01")) {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  }
  return phone;
};

export const validateBMDC = (bmdc: string): boolean => {
  // BMDC format: A followed by 5 digits (e.g., A12345)
  return /^[A-Za-z]\d{5}$/.test(bmdc);
};

export const generateTimeSlots = (
  startTime: string,
  endTime: string,
  durationMinutes: number = 15
): string[] => {
  const slots: string[] = [];
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);
  
  let currentMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  while (currentMinutes < endMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const mins = currentMinutes % 60;
    slots.push(`${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`);
    currentMinutes += durationMinutes;
  }
  
  return slots;
};

export const formatTime12Hour = (time24: string): string => {
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
};

export const toBengaliNumerals = (num: number | string): string => {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num.toString().replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
};

export const formatCurrency = (amount: number, useBengali: boolean = false): string => {
  if (useBengali) {
    return `৳${toBengaliNumerals(amount)}`;
  }
  return `৳${amount.toLocaleString()}`;
};
