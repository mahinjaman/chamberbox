export interface QueueData {
  currentSerial: number;
  patientSerial: number;
  patientName?: string;
  patientsAhead: number;
  estimatedWaitMinutes: number;
  avgConsultationTime: number;
  queueStatus: 'running' | 'break' | 'closed';
  doctorName: string;
  chamberName: string;
  chamberAddress: string;
  scheduleStart: string;
  scheduleEnd: string;
  lastUpdated: Date;
  expectedCallTime: Date;
}

export interface QueueStatusTranslations {
  title: string;
  subtitle: string;
  serialNumber: string;
  patientName: string;
  checkStatus: string;
  checking: string;
  currentRunning: string;
  yourSerial: string;
  patientsAhead: string;
  estimatedWait: string;
  approximately: string;
  hours: string;
  minutes: string;
  lastUpdated: string;
  justNow: string;
  secondsAgo: string;
  refresh: string;
  doctorInfo: string;
  todaySchedule: string;
  expectedCallTime: string;
  noRush: string;
  yourTurnSoon: string;
  enableNotifications: string;
  directions: string;
  shareWhatsApp: string;
  queueRunning: string;
  queueBreak: string;
  queueClosed: string;
  invalidSerial: string;
  alreadySeen: string;
  networkError: string;
  retry: string;
  patientsRemaining: string;
  darkMode: string;
  lightMode: string;
  language: string;
}

export const translations: Record<'en' | 'bn', QueueStatusTranslations> = {
  en: {
    title: 'Queue Status Tracker',
    subtitle: 'Check your position in the queue',
    serialNumber: 'Serial Number',
    patientName: 'Patient Name (Optional)',
    checkStatus: 'Check Status',
    checking: 'Checking...',
    currentRunning: 'Current Running Serial',
    yourSerial: 'Your Serial',
    patientsAhead: 'patients ahead of you',
    estimatedWait: 'Estimated Wait Time',
    approximately: 'Approximately',
    hours: 'hours',
    minutes: 'mins',
    lastUpdated: 'Last updated',
    justNow: 'Just now',
    secondsAgo: 'seconds ago',
    refresh: 'Refresh',
    doctorInfo: 'Doctor Information',
    todaySchedule: "Today's Schedule",
    expectedCallTime: 'Expected Call Time',
    noRush: 'No need to rush, you have plenty of time',
    yourTurnSoon: "It's your turn soon! Please be ready",
    enableNotifications: 'Notify me when 3 patients remaining',
    directions: 'Get Directions',
    shareWhatsApp: 'Share on WhatsApp',
    queueRunning: 'Queue Running',
    queueBreak: 'Doctor on Break',
    queueClosed: 'Queue Closed',
    invalidSerial: 'Please enter a valid serial number',
    alreadySeen: 'This serial has already been seen',
    networkError: 'Unable to fetch queue status. Please try again.',
    retry: 'Retry',
    patientsRemaining: 'patients remaining',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    language: 'বাংলা',
  },
  bn: {
    title: 'কিউ স্ট্যাটাস ট্র্যাকার',
    subtitle: 'কিউতে আপনার অবস্থান দেখুন',
    serialNumber: 'সিরিয়াল নম্বর',
    patientName: 'রোগীর নাম (ঐচ্ছিক)',
    checkStatus: 'স্ট্যাটাস দেখুন',
    checking: 'চেক করা হচ্ছে...',
    currentRunning: 'বর্তমান সিরিয়াল',
    yourSerial: 'আপনার সিরিয়াল',
    patientsAhead: 'জন আপনার আগে',
    estimatedWait: 'আনুমানিক অপেক্ষার সময়',
    approximately: 'প্রায়',
    hours: 'ঘণ্টা',
    minutes: 'মিনিট',
    lastUpdated: 'সর্বশেষ আপডেট',
    justNow: 'এইমাত্র',
    secondsAgo: 'সেকেন্ড আগে',
    refresh: 'রিফ্রেশ',
    doctorInfo: 'ডাক্তারের তথ্য',
    todaySchedule: 'আজকের সময়সূচী',
    expectedCallTime: 'আনুমানিক ডাকার সময়',
    noRush: 'তাড়াহুড়োর দরকার নেই, আপনার হাতে সময় আছে',
    yourTurnSoon: 'আপনার পালা প্রায় এসে গেছে! প্রস্তুত থাকুন',
    enableNotifications: '৩ জন বাকি থাকলে নোটিফাই করুন',
    directions: 'দিকনির্দেশনা',
    shareWhatsApp: 'হোয়াটসঅ্যাপে শেয়ার',
    queueRunning: 'কিউ চলছে',
    queueBreak: 'ডাক্তার বিরতিতে',
    queueClosed: 'কিউ বন্ধ',
    invalidSerial: 'সঠিক সিরিয়াল নম্বর দিন',
    alreadySeen: 'এই সিরিয়াল ইতিমধ্যে দেখা হয়েছে',
    networkError: 'স্ট্যাটাস লোড করতে সমস্যা। আবার চেষ্টা করুন।',
    retry: 'আবার চেষ্টা',
    patientsRemaining: 'জন বাকি',
    darkMode: 'ডার্ক মোড',
    lightMode: 'লাইট মোড',
    language: 'English',
  },
};
