export type Role = "Partner" | "OAK Staff" | "Coordination Team" | "Presenter" | "Observer";

export interface Attendee {
  id: string;
  qrCode: string; // e.g. OAK-2026-7842-XKPH
  firstName: string;
  lastName: string;
  organisation: string;
  subPartner?: string;
  role: Role;
  email: string;
  phone?: string;
  dietary?: string;
  accessibility?: string;
  travel?: string;
  consentAt: string;
  createdAt: string;
}

// Public-safe view of an attendee — never include contact/dietary/accessibility/travel.
export type PublicAttendee = Pick<
  Attendee,
  "id" | "qrCode" | "firstName" | "lastName" | "organisation" | "role"
>;

export interface CheckIn {
  id: string;
  attendeeId: string;
  day: 1 | 2 | 3;
  timestamp: string;
  venue: string;
}

export type SessionType = "Plenary" | "Breakout" | "Workshop" | "Social";

export interface Session {
  id: string;
  day: 1 | 2 | 3;
  start: string;
  end: string;
  title: string;
  speaker?: string;
  speakerOrg?: string;
  location: string;
  type: SessionType;
  featured?: boolean;
}

export interface SessionNote {
  id: string;
  day: 1 | 2 | 3;
  time: string;
  authorName: string;
  authorOrg: string;
  text: string;
}

export interface Photo {
  id: string;
  day: 1 | 2 | 3;
  url: string;
  alt: string;
}

export interface Resource {
  id: string;
  name: string;
  fileType: string;
  size: string;
  day: string;
  url?: string;
}

export interface Partner {
  id: string;
  code: string;
  name: string;
  region: "Global" | "Sub-Saharan Africa" | "Northern Europe" | "Middle East & North Africa" | "East Africa" | "Western Europe";
  category: string;
  tags: string[];
  partnerSince: number;
  website: string;
  about: string;
  contactName: string;
  contactEmail: string;
  isSubPartner?: boolean;
}

export interface AdminSession {
  email: string;
  signedInAt: string;
}
