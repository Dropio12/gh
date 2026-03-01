export interface QuebecStay {
  type: string;
  startDate: string;
  endDate: string;
}

export interface AbsenceDate {
  startDate: string;
  endDate: string;
}

export interface FamilyMember {
  name: string;
  gender: string;
  dob: string;
  birthPlace: string;
  relationship: string;
}

export interface Education {
  institution: string;
  country: string;
  diploma: string;
  field: string;
  startDate: string;
  endDate: string;
}

export interface Experience {
  company: string;
  city: string;
  country: string;
  jobTitle: string;
  hoursPerWeek: string;
  startDate: string;
  endDate: string;
  tasks: string;
}

export interface FormData {
  // Personal Info
  lastName: string;
  firstName: string;
  gender: string;
  passportNumber: string;
  passportIssueDate: string;
  passportExpiryDate: string;
  nationalId: string;
  citizenship: string;
  dob: string;
  birthCity: string;
  birthState: string;
  birthCountry: string;
  
  // Contact & Address
  residenceAddress: string;
  residenceCity: string;
  residenceState: string;
  residenceZip: string;
  residenceCountry: string;
  phone: string;
  email: string;
  residesInQuebec: boolean;
  quebecStatus: string;
  
  differentMailingAddress: boolean;
  mailingAddress: string;
  mailingCity: string;
  mailingState: string;
  mailingZip: string;
  mailingCountry: string;
  mailingPhone: string;
  mailingEmail: string;
  mailingResidentName: string;
  mailingRelationship: string;
  
  // Immigration History
  previousApplication: boolean;
  previousAppNumber: string;
  quebecStays: QuebecStay[];
  absentTwoYears: boolean;
  absenceDates: AbsenceDate[];

  // Family
  accompanyingFamily: FamilyMember[];

  // Employment
  tfwpStream: string;
  simplifiedProcessing: boolean;
  companyName: string;
  reqNumber: string;
  companyAddress: string;
  controlOverCompany: boolean;
  jobTitle: string;
  nocName: string;
  nocCode: string;
  regulatedProfession: boolean;
  regulationStatus: string;
  regulationBody: string;
  jobTasks: string;
  jobAddress: string;
  currentlyEmployed: boolean;
  currentEmploymentStartDate: string;
  currentHourlyWage: string;
  currentHoursPerWeek: string;
  commitToStay: boolean;

  // Education & Experience
  education: Education[];
  experience: Experience[];

  // Representation
  paidRep: boolean;
  repType: string;
  repName: string;
  repRegNumber: string;
  repAddress: string;
  repPhone: string;
  repEmail: string;
  authorizeEmployer: boolean;
  employerRepName: string;

  // Documents
  documents: Record<string, File | null>;
}

export const initialFormData: FormData = {
  lastName: '', firstName: '', gender: '', passportNumber: '', passportIssueDate: '', passportExpiryDate: '', nationalId: '', citizenship: '', dob: '', birthCity: '', birthState: '', birthCountry: '',
  residenceAddress: '', residenceCity: '', residenceState: '', residenceZip: '', residenceCountry: '', phone: '', email: '', residesInQuebec: false, quebecStatus: '',
  differentMailingAddress: false, mailingAddress: '', mailingCity: '', mailingState: '', mailingZip: '', mailingCountry: '', mailingPhone: '', mailingEmail: '', mailingResidentName: '', mailingRelationship: '',
  previousApplication: false, previousAppNumber: '', quebecStays: [], absentTwoYears: false, absenceDates: [],
  accompanyingFamily: [],
  tfwpStream: '', simplifiedProcessing: false, companyName: '', reqNumber: '', companyAddress: '', controlOverCompany: false, jobTitle: '', nocName: '', nocCode: '', regulatedProfession: false, regulationStatus: '', regulationBody: '', jobTasks: '', jobAddress: '', currentlyEmployed: false, currentEmploymentStartDate: '', currentHourlyWage: '', currentHoursPerWeek: '', commitToStay: false,
  education: [], experience: [],
  paidRep: false, repType: '', repName: '', repRegNumber: '', repAddress: '', repPhone: '', repEmail: '', authorizeEmployer: false, employerRepName: '',
  documents: {}
};

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'date' | 'select' | 'checkbox' | 'textarea' | 'number';
  options?: { value: string; label: string }[];
  required?: boolean;
}

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
}

export interface DocumentRequirement {
  id: string;
  title: string;
  description: string;
}

export interface DynamicFormSchema {
  title: string;
  subtitle: string;
  steps: FormStep[];
  documents: DocumentRequirement[];
}
