export type Language = 'en' | 'bn';

export interface Translations {
  // Common
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    search: string;
    loading: string;
    noData: string;
    confirm: string;
    close: string;
    back: string;
    next: string;
    previous: string;
    submit: string;
    reset: string;
    clear: string;
    filter: string;
    export: string;
    import: string;
    download: string;
    upload: string;
    view: string;
    details: string;
    actions: string;
    status: string;
    date: string;
    time: string;
    name: string;
    phone: string;
    email: string;
    address: string;
    description: string;
    notes: string;
    total: string;
    amount: string;
    paid: string;
    pending: string;
    completed: string;
    active: string;
    inactive: string;
    all: string;
    today: string;
    yesterday: string;
    thisWeek: string;
    thisMonth: string;
    custom: string;
    from: string;
    to: string;
    select: string;
    selectAll: string;
    deselectAll: string;
    showing: string;
    of: string;
    results: string;
    page: string;
    perPage: string;
    sortBy: string;
    ascending: string;
    descending: string;
    yes: string;
    no: string;
    or: string;
    and: string;
    optional: string;
    required: string;
    success: string;
    error: string;
    warning: string;
    info: string;
    language: string;
    switchLanguage: string;
  };

  // Navigation
  nav: {
    home: string;
    dashboard: string;
    patients: string;
    queue: string;
    prescriptions: string;
    finances: string;
    analytics: string;
    settings: string;
    profile: string;
    integrations: string;
    support: string;
    logout: string;
    login: string;
    signup: string;
    features: string;
    pricing: string;
    about: string;
    queueStatus: string;
    startFreeTrial: string;
    myProfile: string;
    myTickets: string;
  };

  // Landing Page
  landing: {
    heroTitle: string;
    heroSubtitle: string;
    getStarted: string;
    learnMore: string;
    trustedBy: string;
    doctors: string;
  };

  // Auth
  auth: {
    welcomeBack: string;
    signInToAccount: string;
    emailAddress: string;
    password: string;
    confirmPassword: string;
    forgotPassword: string;
    rememberMe: string;
    signIn: string;
    signingIn: string;
    signUp: string;
    signingUp: string;
    createAccount: string;
    alreadyHaveAccount: string;
    dontHaveAccount: string;
    fullName: string;
    resetPassword: string;
    sendResetLink: string;
    checkEmail: string;
    backToLogin: string;
    passwordResetSent: string;
    newPassword: string;
    updatePassword: string;
    passwordUpdated: string;
  };

  // Dashboard
  dashboard: {
    welcome: string;
    overview: string;
    todayStats: string;
    totalPatients: string;
    todayAppointments: string;
    pendingPayments: string;
    totalRevenue: string;
    recentActivity: string;
    quickActions: string;
    newPatient: string;
    startSession: string;
    viewQueue: string;
    viewAnalytics: string;
    patientsThisMonth: string;
    revenueThisMonth: string;
    avgConsultationTime: string;
    minutes: string;
  };

  // Patients
  patients: {
    title: string;
    subtitle: string;
    addPatient: string;
    editPatient: string;
    patientDetails: string;
    patientName: string;
    patientPhone: string;
    patientAge: string;
    patientGender: string;
    patientAddress: string;
    bloodGroup: string;
    allergies: string;
    chronicConditions: string;
    visitHistory: string;
    lastVisit: string;
    totalVisits: string;
    male: string;
    female: string;
    other: string;
    years: string;
    noPatients: string;
    searchPatients: string;
    patientAdded: string;
    patientUpdated: string;
    patientDeleted: string;
    confirmDelete: string;
    deleteWarning: string;
  };

  // Queue
  queue: {
    title: string;
    subtitle: string;
    currentQueue: string;
    queueManagement: string;
    tokenNumber: string;
    serialNumber: string;
    currentToken: string;
    nextPatient: string;
    callNext: string;
    markComplete: string;
    skip: string;
    noActiveSession: string;
    startSession: string;
    endSession: string;
    pauseSession: string;
    resumeSession: string;
    sessionRunning: string;
    sessionPaused: string;
    sessionEnded: string;
    patientsWaiting: string;
    patientsCompleted: string;
    estimatedWait: string;
    avgTime: string;
    addToQueue: string;
    removeFromQueue: string;
    queueEmpty: string;
    chamber: string;
    selectChamber: string;
  };

  // Queue Status (Public)
  queueStatus: {
    title: string;
    subtitle: string;
    checkStatus: string;
    checking: string;
    currentRunning: string;
    yourSerial: string;
    patientsAhead: string;
    estimatedWait: string;
    approximately: string;
    hours: string;
    mins: string;
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
    queueWaiting: string;
    invalidSerial: string;
    invalidPhone: string;
    alreadySeen: string;
    networkError: string;
    notFound: string;
    retry: string;
    patientsRemaining: string;
    mobileNumber: string;
  };

  // Prescriptions
  prescriptions: {
    title: string;
    subtitle: string;
    newPrescription: string;
    editPrescription: string;
    viewPrescription: string;
    patientInfo: string;
    diagnosis: string;
    symptoms: string;
    medicines: string;
    dosage: string;
    duration: string;
    frequency: string;
    instructions: string;
    advice: string;
    investigations: string;
    nextVisit: string;
    print: string;
    share: string;
    downloadPdf: string;
    noPrescriptions: string;
    prescriptionSaved: string;
    prescriptionDeleted: string;
    addMedicine: string;
    removeMedicine: string;
    beforeMeal: string;
    afterMeal: string;
    morning: string;
    afternoon: string;
    evening: string;
    night: string;
    days: string;
    weeks: string;
    months: string;
    asNeeded: string;
  };

  // Finances
  finances: {
    title: string;
    subtitle: string;
    income: string;
    expense: string;
    balance: string;
    transactions: string;
    addTransaction: string;
    category: string;
    paymentMethod: string;
    cash: string;
    card: string;
    bkash: string;
    nagad: string;
    bankTransfer: string;
    consultationFee: string;
    followUpFee: string;
    otherIncome: string;
    rent: string;
    utilities: string;
    supplies: string;
    salary: string;
    otherExpense: string;
    dueCollection: string;
    collectDue: string;
    dueAmount: string;
    paidAmount: string;
    remainingDue: string;
  };

  // Analytics
  analytics: {
    title: string;
    subtitle: string;
    patientTrends: string;
    revenueTrends: string;
    visitsByDay: string;
    topDiagnoses: string;
    paymentMethods: string;
    genderDistribution: string;
    ageDistribution: string;
    exportReport: string;
    dateRange: string;
    compare: string;
    growth: string;
    decline: string;
  };

  // Settings
  settings: {
    title: string;
    subtitle: string;
    generalSettings: string;
    accountSettings: string;
    notificationSettings: string;
    prescriptionSettings: string;
    chamberSettings: string;
    clinicName: string;
    clinicAddress: string;
    clinicPhone: string;
    clinicEmail: string;
    clinicLogo: string;
    darkMode: string;
    lightMode: string;
    theme: string;
    changePassword: string;
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
    updatePassword: string;
    passwordChanged: string;
    notifications: string;
    emailNotifications: string;
    smsNotifications: string;
    pushNotifications: string;
  };

  // Profile
  profile: {
    title: string;
    subtitle: string;
    basicInfo: string;
    education: string;
    chambers: string;
    socialLinks: string;
    videos: string;
    customInfo: string;
    publicSettings: string;
    doctorName: string;
    specialization: string;
    bmdcNumber: string;
    experience: string;
    yearsExperience: string;
    bio: string;
    degrees: string;
    addDegree: string;
    institution: string;
    passingYear: string;
    addChamber: string;
    chamberName: string;
    chamberAddress: string;
    chamberContact: string;
    consultationFee: string;
    followUpFee: string;
    availableDays: string;
    timing: string;
    facebook: string;
    youtube: string;
    linkedin: string;
    twitter: string;
    website: string;
    addVideo: string;
    videoTitle: string;
    videoUrl: string;
    isPublic: string;
    profileUrl: string;
    preview: string;
    saveChanges: string;
    changesSaved: string;
  };

  // Support
  support: {
    title: string;
    subtitle: string;
    newTicket: string;
    ticketSubject: string;
    ticketMessage: string;
    ticketCategory: string;
    ticketPriority: string;
    low: string;
    medium: string;
    high: string;
    urgent: string;
    open: string;
    inProgress: string;
    resolved: string;
    closed: string;
    submitTicket: string;
    ticketSubmitted: string;
    viewTicket: string;
    reply: string;
    sendReply: string;
    noTickets: string;
    technicalIssue: string;
    billingQuestion: string;
    featureRequest: string;
    generalInquiry: string;
  };

  // Public Profile
  publicProfile: {
    bookAppointment: string;
    callNow: string;
    getDirections: string;
    aboutDoctor: string;
    servicesOffered: string;
    chamberLocations: string;
    educationQualifications: string;
    patientReviews: string;
    contactInfo: string;
    workingHours: string;
    closed: string;
    openNow: string;
    verified: string;
    experienceYears: string;
    patientsServed: string;
    rating: string;
    languages: string;
    viewAllVideos: string;
    watchIntro: string;
  };

  // Time
  time: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
    mon: string;
    tue: string;
    wed: string;
    thu: string;
    fri: string;
    sat: string;
    sun: string;
    am: string;
    pm: string;
  };

  // Errors & Messages
  messages: {
    somethingWentWrong: string;
    tryAgain: string;
    sessionExpired: string;
    pleaseLogin: string;
    noInternet: string;
    savedSuccessfully: string;
    deletedSuccessfully: string;
    updatedSuccessfully: string;
    confirmAction: string;
    areYouSure: string;
    cannotUndo: string;
    pleaseWait: string;
    loadingData: string;
    noDataFound: string;
    invalidInput: string;
    requiredField: string;
    invalidEmail: string;
    invalidPhone: string;
    passwordMismatch: string;
    passwordTooShort: string;
    fileTooLarge: string;
    unsupportedFormat: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    common: {
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      add: "Add",
      search: "Search",
      loading: "Loading...",
      noData: "No data available",
      confirm: "Confirm",
      close: "Close",
      back: "Back",
      next: "Next",
      previous: "Previous",
      submit: "Submit",
      reset: "Reset",
      clear: "Clear",
      filter: "Filter",
      export: "Export",
      import: "Import",
      download: "Download",
      upload: "Upload",
      view: "View",
      details: "Details",
      actions: "Actions",
      status: "Status",
      date: "Date",
      time: "Time",
      name: "Name",
      phone: "Phone",
      email: "Email",
      address: "Address",
      description: "Description",
      notes: "Notes",
      total: "Total",
      amount: "Amount",
      paid: "Paid",
      pending: "Pending",
      completed: "Completed",
      active: "Active",
      inactive: "Inactive",
      all: "All",
      today: "Today",
      yesterday: "Yesterday",
      thisWeek: "This Week",
      thisMonth: "This Month",
      custom: "Custom",
      from: "From",
      to: "To",
      select: "Select",
      selectAll: "Select All",
      deselectAll: "Deselect All",
      showing: "Showing",
      of: "of",
      results: "results",
      page: "Page",
      perPage: "Per page",
      sortBy: "Sort by",
      ascending: "Ascending",
      descending: "Descending",
      yes: "Yes",
      no: "No",
      or: "or",
      and: "and",
      optional: "Optional",
      required: "Required",
      success: "Success",
      error: "Error",
      warning: "Warning",
      info: "Info",
      language: "Language",
      switchLanguage: "বাংলা",
    },
    nav: {
      home: "Home",
      dashboard: "Dashboard",
      patients: "Patients",
      queue: "Queue",
      prescriptions: "Prescriptions",
      finances: "Finances",
      analytics: "Analytics",
      settings: "Settings",
      profile: "Profile",
      integrations: "Integrations",
      support: "Support",
      logout: "Logout",
      login: "Log in",
      signup: "Sign up",
      features: "Features",
      pricing: "Pricing",
      about: "About",
      queueStatus: "Queue Status",
      startFreeTrial: "Start Free Trial",
      myProfile: "My Profile",
      myTickets: "My Tickets",
    },
    landing: {
      heroTitle: "Modern Practice Management for Doctors",
      heroSubtitle: "Streamline your chamber with digital prescriptions, patient queue management, and smart analytics.",
      getStarted: "Get Started",
      learnMore: "Learn More",
      trustedBy: "Trusted by",
      doctors: "doctors",
    },
    auth: {
      welcomeBack: "Welcome back",
      signInToAccount: "Sign in to your ChamberBox account",
      emailAddress: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      forgotPassword: "Forgot password?",
      rememberMe: "Remember me",
      signIn: "Sign in",
      signingIn: "Signing in...",
      signUp: "Sign up",
      signingUp: "Signing up...",
      createAccount: "Create an account",
      alreadyHaveAccount: "Already have an account?",
      dontHaveAccount: "Don't have an account?",
      fullName: "Full Name",
      resetPassword: "Reset Password",
      sendResetLink: "Send Reset Link",
      checkEmail: "Check your email for the reset link",
      backToLogin: "Back to login",
      passwordResetSent: "Password reset email sent!",
      newPassword: "New Password",
      updatePassword: "Update Password",
      passwordUpdated: "Password updated successfully!",
    },
    dashboard: {
      welcome: "Welcome",
      overview: "Overview",
      todayStats: "Today's Statistics",
      totalPatients: "Total Patients",
      todayAppointments: "Today's Appointments",
      pendingPayments: "Pending Payments",
      totalRevenue: "Total Revenue",
      recentActivity: "Recent Activity",
      quickActions: "Quick Actions",
      newPatient: "New Patient",
      startSession: "Start Session",
      viewQueue: "View Queue",
      viewAnalytics: "View Analytics",
      patientsThisMonth: "Patients This Month",
      revenueThisMonth: "Revenue This Month",
      avgConsultationTime: "Avg. Consultation Time",
      minutes: "minutes",
    },
    patients: {
      title: "Patients",
      subtitle: "Manage your patient records",
      addPatient: "Add Patient",
      editPatient: "Edit Patient",
      patientDetails: "Patient Details",
      patientName: "Patient Name",
      patientPhone: "Phone Number",
      patientAge: "Age",
      patientGender: "Gender",
      patientAddress: "Address",
      bloodGroup: "Blood Group",
      allergies: "Allergies",
      chronicConditions: "Chronic Conditions",
      visitHistory: "Visit History",
      lastVisit: "Last Visit",
      totalVisits: "Total Visits",
      male: "Male",
      female: "Female",
      other: "Other",
      years: "years",
      noPatients: "No patients found",
      searchPatients: "Search patients...",
      patientAdded: "Patient added successfully",
      patientUpdated: "Patient updated successfully",
      patientDeleted: "Patient deleted successfully",
      confirmDelete: "Confirm Delete",
      deleteWarning: "This action cannot be undone.",
    },
    queue: {
      title: "Queue Management",
      subtitle: "Manage today's patient queue",
      currentQueue: "Current Queue",
      queueManagement: "Queue Management",
      tokenNumber: "Token",
      serialNumber: "Serial Number",
      currentToken: "Current Token",
      nextPatient: "Next Patient",
      callNext: "Call Next",
      markComplete: "Mark Complete",
      skip: "Skip",
      noActiveSession: "No Active Session",
      startSession: "Start Session",
      endSession: "End Session",
      pauseSession: "Pause Session",
      resumeSession: "Resume Session",
      sessionRunning: "Session Running",
      sessionPaused: "Session Paused",
      sessionEnded: "Session Ended",
      patientsWaiting: "Patients Waiting",
      patientsCompleted: "Patients Completed",
      estimatedWait: "Estimated Wait",
      avgTime: "Avg. Time",
      addToQueue: "Add to Queue",
      removeFromQueue: "Remove from Queue",
      queueEmpty: "Queue is empty",
      chamber: "Chamber",
      selectChamber: "Select Chamber",
    },
    queueStatus: {
      title: "Queue Status Tracker",
      subtitle: "Check your position in the queue",
      checkStatus: "Check Status",
      checking: "Checking...",
      currentRunning: "Current Running Serial",
      yourSerial: "Your Serial",
      patientsAhead: "patients ahead of you",
      estimatedWait: "Estimated Wait Time",
      approximately: "Approximately",
      hours: "hours",
      mins: "mins",
      lastUpdated: "Last updated",
      justNow: "Just now",
      secondsAgo: "seconds ago",
      refresh: "Refresh",
      doctorInfo: "Doctor Information",
      todaySchedule: "Today's Schedule",
      expectedCallTime: "Expected Call Time",
      noRush: "No need to rush, you have plenty of time",
      yourTurnSoon: "It's your turn soon! Please be ready",
      enableNotifications: "Notify me when 3 patients remaining",
      directions: "Get Directions",
      shareWhatsApp: "Share on WhatsApp",
      queueRunning: "Queue Running",
      queueBreak: "Doctor on Break",
      queueClosed: "Queue Closed",
      queueWaiting: "Session Not Started",
      invalidSerial: "Please enter a valid serial number",
      invalidPhone: "Please enter a valid mobile number",
      alreadySeen: "Your appointment has been completed",
      networkError: "Unable to fetch queue status. Please try again.",
      notFound: "No queue entry found for this mobile number today",
      retry: "Retry",
      patientsRemaining: "patients remaining",
      mobileNumber: "Mobile Number",
    },
    prescriptions: {
      title: "Prescriptions",
      subtitle: "Digital prescription management",
      newPrescription: "New Prescription",
      editPrescription: "Edit Prescription",
      viewPrescription: "View Prescription",
      patientInfo: "Patient Information",
      diagnosis: "Diagnosis",
      symptoms: "Symptoms",
      medicines: "Medicines",
      dosage: "Dosage",
      duration: "Duration",
      frequency: "Frequency",
      instructions: "Instructions",
      advice: "Advice",
      investigations: "Investigations",
      nextVisit: "Next Visit",
      print: "Print",
      share: "Share",
      downloadPdf: "Download PDF",
      noPrescriptions: "No prescriptions found",
      prescriptionSaved: "Prescription saved successfully",
      prescriptionDeleted: "Prescription deleted successfully",
      addMedicine: "Add Medicine",
      removeMedicine: "Remove Medicine",
      beforeMeal: "Before Meal",
      afterMeal: "After Meal",
      morning: "Morning",
      afternoon: "Afternoon",
      evening: "Evening",
      night: "Night",
      days: "days",
      weeks: "weeks",
      months: "months",
      asNeeded: "As needed",
    },
    finances: {
      title: "Finances",
      subtitle: "Track income and expenses",
      income: "Income",
      expense: "Expense",
      balance: "Balance",
      transactions: "Transactions",
      addTransaction: "Add Transaction",
      category: "Category",
      paymentMethod: "Payment Method",
      cash: "Cash",
      card: "Card",
      bkash: "bKash",
      nagad: "Nagad",
      bankTransfer: "Bank Transfer",
      consultationFee: "Consultation Fee",
      followUpFee: "Follow-up Fee",
      otherIncome: "Other Income",
      rent: "Rent",
      utilities: "Utilities",
      supplies: "Supplies",
      salary: "Salary",
      otherExpense: "Other Expense",
      dueCollection: "Due Collection",
      collectDue: "Collect Due",
      dueAmount: "Due Amount",
      paidAmount: "Paid Amount",
      remainingDue: "Remaining Due",
    },
    analytics: {
      title: "Analytics",
      subtitle: "Insights and reports",
      patientTrends: "Patient Trends",
      revenueTrends: "Revenue Trends",
      visitsByDay: "Visits by Day",
      topDiagnoses: "Top Diagnoses",
      paymentMethods: "Payment Methods",
      genderDistribution: "Gender Distribution",
      ageDistribution: "Age Distribution",
      exportReport: "Export Report",
      dateRange: "Date Range",
      compare: "Compare",
      growth: "Growth",
      decline: "Decline",
    },
    settings: {
      title: "Settings",
      subtitle: "Manage your preferences",
      generalSettings: "General Settings",
      accountSettings: "Account Settings",
      notificationSettings: "Notification Settings",
      prescriptionSettings: "Prescription Settings",
      chamberSettings: "Chamber Settings",
      clinicName: "Clinic Name",
      clinicAddress: "Clinic Address",
      clinicPhone: "Clinic Phone",
      clinicEmail: "Clinic Email",
      clinicLogo: "Clinic Logo",
      darkMode: "Dark Mode",
      lightMode: "Light Mode",
      theme: "Theme",
      changePassword: "Change Password",
      currentPassword: "Current Password",
      newPassword: "New Password",
      confirmNewPassword: "Confirm New Password",
      updatePassword: "Update Password",
      passwordChanged: "Password changed successfully",
      notifications: "Notifications",
      emailNotifications: "Email Notifications",
      smsNotifications: "SMS Notifications",
      pushNotifications: "Push Notifications",
    },
    profile: {
      title: "Profile Editor",
      subtitle: "Customize your public profile",
      basicInfo: "Basic Information",
      education: "Education",
      chambers: "Chambers",
      socialLinks: "Social Links",
      videos: "Videos",
      customInfo: "Custom Information",
      publicSettings: "Public Settings",
      doctorName: "Doctor Name",
      specialization: "Specialization",
      bmdcNumber: "BMDC Number",
      experience: "Experience",
      yearsExperience: "years of experience",
      bio: "Bio",
      degrees: "Degrees",
      addDegree: "Add Degree",
      institution: "Institution",
      passingYear: "Passing Year",
      addChamber: "Add Chamber",
      chamberName: "Chamber Name",
      chamberAddress: "Chamber Address",
      chamberContact: "Contact Number",
      consultationFee: "Consultation Fee (New)",
      followUpFee: "Follow-up Fee",
      availableDays: "Available Days",
      timing: "Timing",
      facebook: "Facebook",
      youtube: "YouTube",
      linkedin: "LinkedIn",
      twitter: "Twitter",
      website: "Website",
      addVideo: "Add Video",
      videoTitle: "Video Title",
      videoUrl: "YouTube URL",
      isPublic: "Public Profile",
      profileUrl: "Profile URL",
      preview: "Preview",
      saveChanges: "Save Changes",
      changesSaved: "Changes saved successfully",
    },
    support: {
      title: "Support",
      subtitle: "Get help and support",
      newTicket: "New Ticket",
      ticketSubject: "Subject",
      ticketMessage: "Message",
      ticketCategory: "Category",
      ticketPriority: "Priority",
      low: "Low",
      medium: "Medium",
      high: "High",
      urgent: "Urgent",
      open: "Open",
      inProgress: "In Progress",
      resolved: "Resolved",
      closed: "Closed",
      submitTicket: "Submit Ticket",
      ticketSubmitted: "Ticket submitted successfully",
      viewTicket: "View Ticket",
      reply: "Reply",
      sendReply: "Send Reply",
      noTickets: "No tickets found",
      technicalIssue: "Technical Issue",
      billingQuestion: "Billing Question",
      featureRequest: "Feature Request",
      generalInquiry: "General Inquiry",
    },
    publicProfile: {
      bookAppointment: "Book Appointment",
      callNow: "Call Now",
      getDirections: "Get Directions",
      aboutDoctor: "About Doctor",
      servicesOffered: "Services Offered",
      chamberLocations: "Chamber Locations",
      educationQualifications: "Education & Qualifications",
      patientReviews: "Patient Reviews",
      contactInfo: "Contact Information",
      workingHours: "Working Hours",
      closed: "Closed",
      openNow: "Open Now",
      verified: "Verified",
      experienceYears: "Years Experience",
      patientsServed: "Patients Served",
      rating: "Rating",
      languages: "Languages",
      viewAllVideos: "View All Videos",
      watchIntro: "Watch Introduction",
    },
    time: {
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
      sunday: "Sunday",
      mon: "Mon",
      tue: "Tue",
      wed: "Wed",
      thu: "Thu",
      fri: "Fri",
      sat: "Sat",
      sun: "Sun",
      am: "AM",
      pm: "PM",
    },
    messages: {
      somethingWentWrong: "Something went wrong",
      tryAgain: "Please try again",
      sessionExpired: "Session expired",
      pleaseLogin: "Please log in again",
      noInternet: "No internet connection",
      savedSuccessfully: "Saved successfully",
      deletedSuccessfully: "Deleted successfully",
      updatedSuccessfully: "Updated successfully",
      confirmAction: "Confirm Action",
      areYouSure: "Are you sure?",
      cannotUndo: "This action cannot be undone.",
      pleaseWait: "Please wait...",
      loadingData: "Loading data...",
      noDataFound: "No data found",
      invalidInput: "Invalid input",
      requiredField: "This field is required",
      invalidEmail: "Invalid email address",
      invalidPhone: "Invalid phone number",
      passwordMismatch: "Passwords do not match",
      passwordTooShort: "Password must be at least 6 characters",
      fileTooLarge: "File is too large",
      unsupportedFormat: "Unsupported file format",
    },
  },
  bn: {
    common: {
      save: "সংরক্ষণ করুন",
      cancel: "বাতিল",
      delete: "মুছুন",
      edit: "সম্পাদনা",
      add: "যোগ করুন",
      search: "খুঁজুন",
      loading: "লোড হচ্ছে...",
      noData: "কোনো তথ্য নেই",
      confirm: "নিশ্চিত করুন",
      close: "বন্ধ করুন",
      back: "পিছনে",
      next: "পরবর্তী",
      previous: "পূর্ববর্তী",
      submit: "জমা দিন",
      reset: "রিসেট",
      clear: "পরিষ্কার",
      filter: "ফিল্টার",
      export: "এক্সপোর্ট",
      import: "ইমপোর্ট",
      download: "ডাউনলোড",
      upload: "আপলোড",
      view: "দেখুন",
      details: "বিস্তারিত",
      actions: "অ্যাকশন",
      status: "স্ট্যাটাস",
      date: "তারিখ",
      time: "সময়",
      name: "নাম",
      phone: "ফোন",
      email: "ইমেইল",
      address: "ঠিকানা",
      description: "বিবরণ",
      notes: "নোট",
      total: "মোট",
      amount: "পরিমাণ",
      paid: "পরিশোধিত",
      pending: "বাকি",
      completed: "সম্পন্ন",
      active: "সক্রিয়",
      inactive: "নিষ্ক্রিয়",
      all: "সব",
      today: "আজ",
      yesterday: "গতকাল",
      thisWeek: "এই সপ্তাহ",
      thisMonth: "এই মাস",
      custom: "কাস্টম",
      from: "থেকে",
      to: "পর্যন্ত",
      select: "নির্বাচন করুন",
      selectAll: "সব নির্বাচন",
      deselectAll: "সব বাদ দিন",
      showing: "দেখাচ্ছে",
      of: "এর",
      results: "ফলাফল",
      page: "পৃষ্ঠা",
      perPage: "প্রতি পৃষ্ঠায়",
      sortBy: "সাজান",
      ascending: "ঊর্ধ্বক্রম",
      descending: "অধঃক্রম",
      yes: "হ্যাঁ",
      no: "না",
      or: "অথবা",
      and: "এবং",
      optional: "ঐচ্ছিক",
      required: "আবশ্যক",
      success: "সফল",
      error: "ত্রুটি",
      warning: "সতর্কতা",
      info: "তথ্য",
      language: "ভাষা",
      switchLanguage: "English",
    },
    nav: {
      home: "হোম",
      dashboard: "ড্যাশবোর্ড",
      patients: "রোগী",
      queue: "কিউ",
      prescriptions: "প্রেসক্রিপশন",
      finances: "আর্থিক হিসাব",
      analytics: "বিশ্লেষণ",
      settings: "সেটিংস",
      profile: "প্রোফাইল",
      integrations: "ইন্টিগ্রেশন",
      support: "সাপোর্ট",
      logout: "লগআউট",
      login: "লগইন",
      signup: "সাইন আপ",
      features: "ফিচার",
      pricing: "মূল্য",
      about: "সম্পর্কে",
      queueStatus: "কিউ স্ট্যাটাস",
      startFreeTrial: "বিনামূল্যে শুরু করুন",
      myProfile: "আমার প্রোফাইল",
      myTickets: "আমার টিকেট",
    },
    landing: {
      heroTitle: "ডাক্তারদের জন্য আধুনিক প্র্যাকটিস ম্যানেজমেন্ট",
      heroSubtitle: "ডিজিটাল প্রেসক্রিপশন, রোগী কিউ ম্যানেজমেন্ট এবং স্মার্ট বিশ্লেষণ দিয়ে আপনার চেম্বার পরিচালনা করুন।",
      getStarted: "শুরু করুন",
      learnMore: "আরও জানুন",
      trustedBy: "বিশ্বস্ত",
      doctors: "ডাক্তার",
    },
    auth: {
      welcomeBack: "স্বাগতম",
      signInToAccount: "আপনার ChamberBox অ্যাকাউন্টে সাইন ইন করুন",
      emailAddress: "ইমেইল",
      password: "পাসওয়ার্ড",
      confirmPassword: "পাসওয়ার্ড নিশ্চিত করুন",
      forgotPassword: "পাসওয়ার্ড ভুলে গেছেন?",
      rememberMe: "মনে রাখুন",
      signIn: "সাইন ইন",
      signingIn: "সাইন ইন হচ্ছে...",
      signUp: "সাইন আপ",
      signingUp: "সাইন আপ হচ্ছে...",
      createAccount: "একাউন্ট তৈরি করুন",
      alreadyHaveAccount: "ইতিমধ্যে অ্যাকাউন্ট আছে?",
      dontHaveAccount: "অ্যাকাউন্ট নেই?",
      fullName: "পুরো নাম",
      resetPassword: "পাসওয়ার্ড রিসেট",
      sendResetLink: "রিসেট লিংক পাঠান",
      checkEmail: "রিসেট লিংকের জন্য ইমেইল চেক করুন",
      backToLogin: "লগইনে ফিরে যান",
      passwordResetSent: "পাসওয়ার্ড রিসেট ইমেইল পাঠানো হয়েছে!",
      newPassword: "নতুন পাসওয়ার্ড",
      updatePassword: "পাসওয়ার্ড আপডেট করুন",
      passwordUpdated: "পাসওয়ার্ড সফলভাবে আপডেট হয়েছে!",
    },
    dashboard: {
      welcome: "স্বাগতম",
      overview: "সংক্ষিপ্ত বিবরণ",
      todayStats: "আজকের পরিসংখ্যান",
      totalPatients: "মোট রোগী",
      todayAppointments: "আজকের অ্যাপয়েন্টমেন্ট",
      pendingPayments: "বাকি পেমেন্ট",
      totalRevenue: "মোট আয়",
      recentActivity: "সাম্প্রতিক কার্যকলাপ",
      quickActions: "দ্রুত অ্যাকশন",
      newPatient: "নতুন রোগী",
      startSession: "সেশন শুরু",
      viewQueue: "কিউ দেখুন",
      viewAnalytics: "বিশ্লেষণ দেখুন",
      patientsThisMonth: "এই মাসে রোগী",
      revenueThisMonth: "এই মাসে আয়",
      avgConsultationTime: "গড় পরামর্শ সময়",
      minutes: "মিনিট",
    },
    patients: {
      title: "রোগী",
      subtitle: "রোগীদের রেকর্ড পরিচালনা করুন",
      addPatient: "রোগী যোগ করুন",
      editPatient: "রোগী সম্পাদনা",
      patientDetails: "রোগীর বিবরণ",
      patientName: "রোগীর নাম",
      patientPhone: "ফোন নম্বর",
      patientAge: "বয়স",
      patientGender: "লিঙ্গ",
      patientAddress: "ঠিকানা",
      bloodGroup: "রক্তের গ্রুপ",
      allergies: "অ্যালার্জি",
      chronicConditions: "দীর্ঘস্থায়ী রোগ",
      visitHistory: "ভিজিট ইতিহাস",
      lastVisit: "শেষ ভিজিট",
      totalVisits: "মোট ভিজিট",
      male: "পুরুষ",
      female: "মহিলা",
      other: "অন্যান্য",
      years: "বছর",
      noPatients: "কোনো রোগী পাওয়া যায়নি",
      searchPatients: "রোগী খুঁজুন...",
      patientAdded: "রোগী সফলভাবে যোগ করা হয়েছে",
      patientUpdated: "রোগীর তথ্য আপডেট হয়েছে",
      patientDeleted: "রোগী মুছে ফেলা হয়েছে",
      confirmDelete: "মুছে ফেলা নিশ্চিত করুন",
      deleteWarning: "এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।",
    },
    queue: {
      title: "কিউ ম্যানেজমেন্ট",
      subtitle: "আজকের রোগীদের কিউ পরিচালনা করুন",
      currentQueue: "বর্তমান কিউ",
      queueManagement: "কিউ ম্যানেজমেন্ট",
      tokenNumber: "টোকেন",
      serialNumber: "সিরিয়াল নম্বর",
      currentToken: "বর্তমান টোকেন",
      nextPatient: "পরবর্তী রোগী",
      callNext: "পরেরটি ডাকুন",
      markComplete: "সম্পন্ন করুন",
      skip: "বাদ দিন",
      noActiveSession: "কোনো সক্রিয় সেশন নেই",
      startSession: "সেশন শুরু করুন",
      endSession: "সেশন শেষ করুন",
      pauseSession: "সেশন বিরতি",
      resumeSession: "সেশন পুনরায় শুরু",
      sessionRunning: "সেশন চলছে",
      sessionPaused: "সেশন বিরতিতে",
      sessionEnded: "সেশন শেষ",
      patientsWaiting: "অপেক্ষারত রোগী",
      patientsCompleted: "সম্পন্ন রোগী",
      estimatedWait: "আনুমানিক অপেক্ষা",
      avgTime: "গড় সময়",
      addToQueue: "কিউতে যোগ করুন",
      removeFromQueue: "কিউ থেকে সরান",
      queueEmpty: "কিউ খালি",
      chamber: "চেম্বার",
      selectChamber: "চেম্বার নির্বাচন করুন",
    },
    queueStatus: {
      title: "কিউ স্ট্যাটাস ট্র্যাকার",
      subtitle: "কিউতে আপনার অবস্থান দেখুন",
      checkStatus: "স্ট্যাটাস দেখুন",
      checking: "চেক করা হচ্ছে...",
      currentRunning: "বর্তমান সিরিয়াল",
      yourSerial: "আপনার সিরিয়াল",
      patientsAhead: "জন আপনার আগে",
      estimatedWait: "আনুমানিক অপেক্ষার সময়",
      approximately: "প্রায়",
      hours: "ঘণ্টা",
      mins: "মিনিট",
      lastUpdated: "সর্বশেষ আপডেট",
      justNow: "এইমাত্র",
      secondsAgo: "সেকেন্ড আগে",
      refresh: "রিফ্রেশ",
      doctorInfo: "ডাক্তারের তথ্য",
      todaySchedule: "আজকের সময়সূচী",
      expectedCallTime: "আনুমানিক ডাকার সময়",
      noRush: "তাড়াহুড়োর দরকার নেই, আপনার হাতে সময় আছে",
      yourTurnSoon: "আপনার পালা প্রায় এসে গেছে! প্রস্তুত থাকুন",
      enableNotifications: "৩ জন বাকি থাকলে নোটিফাই করুন",
      directions: "দিকনির্দেশনা",
      shareWhatsApp: "হোয়াটসঅ্যাপে শেয়ার",
      queueRunning: "কিউ চলছে",
      queueBreak: "ডাক্তার বিরতিতে",
      queueClosed: "কিউ বন্ধ",
      queueWaiting: "সেশন শুরু হয়নি",
      invalidSerial: "সঠিক সিরিয়াল নম্বর দিন",
      invalidPhone: "সঠিক মোবাইল নম্বর দিন",
      alreadySeen: "আপনার অ্যাপয়েন্টমেন্ট সম্পন্ন হয়েছে",
      networkError: "স্ট্যাটাস লোড করতে সমস্যা। আবার চেষ্টা করুন।",
      notFound: "এই মোবাইল নম্বরে আজকের জন্য কোনো কিউ এন্ট্রি পাওয়া যায়নি",
      retry: "আবার চেষ্টা",
      patientsRemaining: "জন বাকি",
      mobileNumber: "মোবাইল নম্বর",
    },
    prescriptions: {
      title: "প্রেসক্রিপশন",
      subtitle: "ডিজিটাল প্রেসক্রিপশন ব্যবস্থাপনা",
      newPrescription: "নতুন প্রেসক্রিপশন",
      editPrescription: "প্রেসক্রিপশন সম্পাদনা",
      viewPrescription: "প্রেসক্রিপশন দেখুন",
      patientInfo: "রোগীর তথ্য",
      diagnosis: "রোগ নির্ণয়",
      symptoms: "উপসর্গ",
      medicines: "ওষুধ",
      dosage: "ডোজ",
      duration: "সময়কাল",
      frequency: "কতবার",
      instructions: "নির্দেশনা",
      advice: "পরামর্শ",
      investigations: "পরীক্ষা-নিরীক্ষা",
      nextVisit: "পরবর্তী ভিজিট",
      print: "প্রিন্ট",
      share: "শেয়ার",
      downloadPdf: "PDF ডাউনলোড",
      noPrescriptions: "কোনো প্রেসক্রিপশন নেই",
      prescriptionSaved: "প্রেসক্রিপশন সংরক্ষিত হয়েছে",
      prescriptionDeleted: "প্রেসক্রিপশন মুছে ফেলা হয়েছে",
      addMedicine: "ওষুধ যোগ করুন",
      removeMedicine: "ওষুধ সরান",
      beforeMeal: "খাবার আগে",
      afterMeal: "খাবার পরে",
      morning: "সকাল",
      afternoon: "দুপুর",
      evening: "সন্ধ্যা",
      night: "রাত",
      days: "দিন",
      weeks: "সপ্তাহ",
      months: "মাস",
      asNeeded: "প্রয়োজনমতো",
    },
    finances: {
      title: "আর্থিক হিসাব",
      subtitle: "আয় ও ব্যয় ট্র্যাক করুন",
      income: "আয়",
      expense: "ব্যয়",
      balance: "ব্যালেন্স",
      transactions: "লেনদেন",
      addTransaction: "লেনদেন যোগ করুন",
      category: "ক্যাটাগরি",
      paymentMethod: "পেমেন্ট পদ্ধতি",
      cash: "নগদ",
      card: "কার্ড",
      bkash: "বিকাশ",
      nagad: "নগদ",
      bankTransfer: "ব্যাংক ট্রান্সফার",
      consultationFee: "পরামর্শ ফি",
      followUpFee: "ফলো-আপ ফি",
      otherIncome: "অন্যান্য আয়",
      rent: "ভাড়া",
      utilities: "ইউটিলিটি",
      supplies: "সরবরাহ",
      salary: "বেতন",
      otherExpense: "অন্যান্য ব্যয়",
      dueCollection: "বকেয়া আদায়",
      collectDue: "বকেয়া আদায় করুন",
      dueAmount: "বকেয়া পরিমাণ",
      paidAmount: "পরিশোধিত পরিমাণ",
      remainingDue: "অবশিষ্ট বকেয়া",
    },
    analytics: {
      title: "বিশ্লেষণ",
      subtitle: "ইনসাইট এবং রিপোর্ট",
      patientTrends: "রোগীর প্রবণতা",
      revenueTrends: "আয়ের প্রবণতা",
      visitsByDay: "দিন অনুযায়ী ভিজিট",
      topDiagnoses: "শীর্ষ রোগ নির্ণয়",
      paymentMethods: "পেমেন্ট পদ্ধতি",
      genderDistribution: "লিঙ্গ বিতরণ",
      ageDistribution: "বয়স বিতরণ",
      exportReport: "রিপোর্ট এক্সপোর্ট",
      dateRange: "তারিখ পরিসর",
      compare: "তুলনা করুন",
      growth: "বৃদ্ধি",
      decline: "হ্রাস",
    },
    settings: {
      title: "সেটিংস",
      subtitle: "আপনার পছন্দ পরিচালনা করুন",
      generalSettings: "সাধারণ সেটিংস",
      accountSettings: "অ্যাকাউন্ট সেটিংস",
      notificationSettings: "নোটিফিকেশন সেটিংস",
      prescriptionSettings: "প্রেসক্রিপশন সেটিংস",
      chamberSettings: "চেম্বার সেটিংস",
      clinicName: "ক্লিনিকের নাম",
      clinicAddress: "ক্লিনিকের ঠিকানা",
      clinicPhone: "ক্লিনিকের ফোন",
      clinicEmail: "ক্লিনিকের ইমেইল",
      clinicLogo: "ক্লিনিকের লোগো",
      darkMode: "ডার্ক মোড",
      lightMode: "লাইট মোড",
      theme: "থিম",
      changePassword: "পাসওয়ার্ড পরিবর্তন",
      currentPassword: "বর্তমান পাসওয়ার্ড",
      newPassword: "নতুন পাসওয়ার্ড",
      confirmNewPassword: "নতুন পাসওয়ার্ড নিশ্চিত করুন",
      updatePassword: "পাসওয়ার্ড আপডেট করুন",
      passwordChanged: "পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে",
      notifications: "নোটিফিকেশন",
      emailNotifications: "ইমেইল নোটিফিকেশন",
      smsNotifications: "SMS নোটিফিকেশন",
      pushNotifications: "পুশ নোটিফিকেশন",
    },
    profile: {
      title: "প্রোফাইল এডিটর",
      subtitle: "আপনার পাবলিক প্রোফাইল কাস্টমাইজ করুন",
      basicInfo: "মৌলিক তথ্য",
      education: "শিক্ষা",
      chambers: "চেম্বার",
      socialLinks: "সোশ্যাল লিংক",
      videos: "ভিডিও",
      customInfo: "অতিরিক্ত তথ্য",
      publicSettings: "পাবলিক সেটিংস",
      doctorName: "ডাক্তারের নাম",
      specialization: "বিশেষত্ব",
      bmdcNumber: "BMDC নম্বর",
      experience: "অভিজ্ঞতা",
      yearsExperience: "বছরের অভিজ্ঞতা",
      bio: "সংক্ষিপ্ত পরিচিতি",
      degrees: "ডিগ্রি",
      addDegree: "ডিগ্রি যোগ করুন",
      institution: "প্রতিষ্ঠান",
      passingYear: "পাসের বছর",
      addChamber: "চেম্বার যোগ করুন",
      chamberName: "চেম্বারের নাম",
      chamberAddress: "চেম্বারের ঠিকানা",
      chamberContact: "যোগাযোগ নম্বর",
      consultationFee: "পরামর্শ ফি (নতুন)",
      followUpFee: "ফলো-আপ ফি",
      availableDays: "কার্যদিবস",
      timing: "সময়সূচী",
      facebook: "ফেসবুক",
      youtube: "ইউটিউব",
      linkedin: "লিংকডইন",
      twitter: "টুইটার",
      website: "ওয়েবসাইট",
      addVideo: "ভিডিও যোগ করুন",
      videoTitle: "ভিডিওর শিরোনাম",
      videoUrl: "ইউটিউব URL",
      isPublic: "পাবলিক প্রোফাইল",
      profileUrl: "প্রোফাইল URL",
      preview: "প্রিভিউ",
      saveChanges: "পরিবর্তন সংরক্ষণ করুন",
      changesSaved: "পরিবর্তন সফলভাবে সংরক্ষিত হয়েছে",
    },
    support: {
      title: "সাপোর্ট",
      subtitle: "সাহায্য নিন",
      newTicket: "নতুন টিকেট",
      ticketSubject: "বিষয়",
      ticketMessage: "বার্তা",
      ticketCategory: "ক্যাটাগরি",
      ticketPriority: "অগ্রাধিকার",
      low: "কম",
      medium: "মাঝারি",
      high: "বেশি",
      urgent: "জরুরি",
      open: "খোলা",
      inProgress: "প্রক্রিয়াধীন",
      resolved: "সমাধান হয়েছে",
      closed: "বন্ধ",
      submitTicket: "টিকেট জমা দিন",
      ticketSubmitted: "টিকেট সফলভাবে জমা হয়েছে",
      viewTicket: "টিকেট দেখুন",
      reply: "উত্তর",
      sendReply: "উত্তর পাঠান",
      noTickets: "কোনো টিকেট নেই",
      technicalIssue: "প্রযুক্তিগত সমস্যা",
      billingQuestion: "বিলিং প্রশ্ন",
      featureRequest: "ফিচার রিকোয়েস্ট",
      generalInquiry: "সাধারণ জিজ্ঞাসা",
    },
    publicProfile: {
      bookAppointment: "অ্যাপয়েন্টমেন্ট বুক করুন",
      callNow: "এখনই কল করুন",
      getDirections: "দিকনির্দেশনা নিন",
      aboutDoctor: "ডাক্তার সম্পর্কে",
      servicesOffered: "সেবাসমূহ",
      chamberLocations: "চেম্বারের অবস্থান",
      educationQualifications: "শিক্ষা ও যোগ্যতা",
      patientReviews: "রোগীদের মতামত",
      contactInfo: "যোগাযোগের তথ্য",
      workingHours: "কর্মঘণ্টা",
      closed: "বন্ধ",
      openNow: "এখন খোলা",
      verified: "যাচাইকৃত",
      experienceYears: "বছরের অভিজ্ঞতা",
      patientsServed: "রোগী সেবা দিয়েছেন",
      rating: "রেটিং",
      languages: "ভাষা",
      viewAllVideos: "সব ভিডিও দেখুন",
      watchIntro: "পরিচিতি দেখুন",
    },
    time: {
      monday: "সোমবার",
      tuesday: "মঙ্গলবার",
      wednesday: "বুধবার",
      thursday: "বৃহস্পতিবার",
      friday: "শুক্রবার",
      saturday: "শনিবার",
      sunday: "রবিবার",
      mon: "সোম",
      tue: "মঙ্গল",
      wed: "বুধ",
      thu: "বৃহঃ",
      fri: "শুক্র",
      sat: "শনি",
      sun: "রবি",
      am: "সকাল",
      pm: "বিকাল",
    },
    messages: {
      somethingWentWrong: "কিছু ভুল হয়েছে",
      tryAgain: "আবার চেষ্টা করুন",
      sessionExpired: "সেশনের মেয়াদ শেষ",
      pleaseLogin: "আবার লগইন করুন",
      noInternet: "ইন্টারনেট সংযোগ নেই",
      savedSuccessfully: "সফলভাবে সংরক্ষিত হয়েছে",
      deletedSuccessfully: "সফলভাবে মুছে ফেলা হয়েছে",
      updatedSuccessfully: "সফলভাবে আপডেট হয়েছে",
      confirmAction: "অ্যাকশন নিশ্চিত করুন",
      areYouSure: "আপনি কি নিশ্চিত?",
      cannotUndo: "এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।",
      pleaseWait: "অনুগ্রহ করে অপেক্ষা করুন...",
      loadingData: "তথ্য লোড হচ্ছে...",
      noDataFound: "কোনো তথ্য পাওয়া যায়নি",
      invalidInput: "অবৈধ ইনপুট",
      requiredField: "এই ফিল্ডটি আবশ্যক",
      invalidEmail: "অবৈধ ইমেইল ঠিকানা",
      invalidPhone: "অবৈধ ফোন নম্বর",
      passwordMismatch: "পাসওয়ার্ড মিলছে না",
      passwordTooShort: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে",
      fileTooLarge: "ফাইল অনেক বড়",
      unsupportedFormat: "অসমর্থিত ফাইল ফরম্যাট",
    },
  },
};
