import { StaffRole } from "@/hooks/useStaff";

export interface StaffPermissions {
  canManageQueue: boolean;
  canViewPatientList: boolean;
  canAddPatients: boolean;
  canEditPatients: boolean;
  canViewPrescriptions: boolean;
  canViewFinances: boolean;
  canManageStaff: boolean;
}

/**
 * Returns the default permissions for a given staff role
 * 
 * Receptionist: Queue management only, basic patient viewing
 * Assistant: Queue + patients + view prescriptions
 * Manager: Full access including finances and staff management
 */
export function getPermissionsForRole(role: StaffRole): StaffPermissions {
  switch (role) {
    case "receptionist":
      return {
        canManageQueue: true,
        canViewPatientList: true,
        canAddPatients: false,
        canEditPatients: false,
        canViewPrescriptions: false,
        canViewFinances: false,
        canManageStaff: false,
      };
    case "assistant":
      return {
        canManageQueue: true,
        canViewPatientList: true,
        canAddPatients: true,
        canEditPatients: true,
        canViewPrescriptions: true,
        canViewFinances: false,
        canManageStaff: false,
      };
    case "manager":
      return {
        canManageQueue: true,
        canViewPatientList: true,
        canAddPatients: true,
        canEditPatients: true,
        canViewPrescriptions: true,
        canViewFinances: true,
        canManageStaff: true,
      };
    default:
      return {
        canManageQueue: false,
        canViewPatientList: false,
        canAddPatients: false,
        canEditPatients: false,
        canViewPrescriptions: false,
        canViewFinances: false,
        canManageStaff: false,
      };
  }
}

/**
 * Permission descriptions for UI display
 */
export const permissionDescriptions = {
  en: {
    receptionist: [
      "Manage queue (add/call patients)",
      "View patient list (basic info only)",
    ],
    assistant: [
      "Manage queue (add/call patients)",
      "View and add patients",
      "Edit patient records",
      "View prescriptions (read-only)",
    ],
    manager: [
      "All queue management",
      "Full patient management",
      "View prescriptions",
      "View financial data",
      "Manage other staff",
    ],
  },
  bn: {
    receptionist: [
      "কিউ ম্যানেজ করুন (রোগী যোগ/কল)",
      "রোগীর তালিকা দেখুন (শুধু বেসিক তথ্য)",
    ],
    assistant: [
      "কিউ ম্যানেজ করুন (রোগী যোগ/কল)",
      "রোগী দেখুন এবং যোগ করুন",
      "রোগীর তথ্য সম্পাদনা করুন",
      "প্রেসক্রিপশন দেখুন (শুধু পড়ার জন্য)",
    ],
    manager: [
      "সকল কিউ ম্যানেজমেন্ট",
      "সম্পূর্ণ রোগী ম্যানেজমেন্ট",
      "প্রেসক্রিপশন দেখুন",
      "আর্থিক তথ্য দেখুন",
      "অন্যান্য স্টাফ ম্যানেজ করুন",
    ],
  },
};
