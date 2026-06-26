/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PetSpecies = 'dog' | 'cat' | 'rabbit' | 'bird' | 'horse' | 'other';

export interface VaccinationRecord {
  id: string;
  vaccineName: string;
  dateAdministered: string;
  dateDue?: string;
  batchNumber?: string;
  veterinarianName?: string;
  countryOfAdministration?: string;
  notes?: string;
  status: 'active' | 'expiring_soon' | 'overdue';
}

export interface MedicalVisit {
  id: string;
  date: string;
  purpose: string;
  findings: string;
  treatment?: string;
  veterinarianName?: string;
  facilityName?: string;
}

export interface ScanHistoryItem {
  id: string;
  date: string;
  documentType: string;
  countryDetected: string;
  extractedFieldsCount: number;
}

export interface Pet {
  id: string;
  name: string;
  species: PetSpecies;
  breed: string;
  gender: 'Male' | 'Female' | 'Unknown';
  dateOfBirth: string;
  microchipNumber?: string;
  passportNumber?: string;
  ownerName?: string;
  countryOfOrigin: string;
  avatarUrl?: string;
  vaccinationRecords: VaccinationRecord[];
  medicalVisits: MedicalVisit[];
  notes?: string;
  scanHistory: ScanHistoryItem[];
}

export interface CountryRule {
  id: string;
  countryName: string;
  flag: string;
  rules: {
    microchip: {
      required: boolean;
      details: string;
    };
    rabiesVaccine: {
      required: boolean;
      details: string;
      validityPeriodDays: number;
    };
    otherVaccines: string[];
    waitingPeriodDays: number; // Waiting period after rabies vaccine before entry
    quarantineRequired: boolean;
    quarantineDetails?: string;
    documentationRequired: string[];
  };
}
