/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Pet, CountryRule } from './types';

export const INITIAL_PETS: Pet[] = [
  {
    id: 'luna-de',
    name: 'Luna',
    species: 'dog',
    breed: 'Golden Retriever',
    gender: 'Female',
    dateOfBirth: '2021-04-12',
    microchipNumber: '276098106234581',
    passportNumber: 'DE-0941829',
    ownerName: 'Sarah Müller',
    countryOfOrigin: 'Germany',
    avatarUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=300&h=300&q=80',
    notes: 'Very friendly, likes peanut butter. Slightly nervous during vet stamps.',
    vaccinationRecords: [
      {
        id: 'vac-1',
        vaccineName: 'Nobivac Rabies',
        dateAdministered: '2025-05-10',
        dateDue: '2026-05-10',
        batchNumber: 'A918B22',
        veterinarianName: 'Dr. Thomas Weber',
        countryOfAdministration: 'Germany',
        notes: 'Official EU sticker attached',
        status: 'active'
      },
      {
        id: 'vac-2',
        vaccineName: 'Nobivac DHPPi (Distemper/Hep/Parvo)',
        dateAdministered: '2025-05-10',
        dateDue: '2026-05-10',
        batchNumber: 'C224C10',
        veterinarianName: 'Dr. Thomas Weber',
        countryOfAdministration: 'Germany',
        notes: 'Annual core combo',
        status: 'active'
      },
      {
        id: 'vac-3',
        vaccineName: 'Leptospirosis (L4)',
        dateAdministered: '2024-05-12',
        dateDue: '2025-05-12',
        batchNumber: 'L88231',
        veterinarianName: 'Dr. Thomas Weber',
        countryOfAdministration: 'Germany',
        notes: 'Annual booster',
        status: 'overdue'
      }
    ],
    medicalVisits: [
      {
        id: 'med-1',
        date: '2025-05-10',
        purpose: 'Annual Health Check',
        findings: 'Heart and lungs clear. Teeth in excellent condition. Weight: 28.5 kg.',
        treatment: 'Administered Rabies + DHPPi boosters.',
        veterinarianName: 'Dr. Thomas Weber',
        facilityName: 'Tierarztpraxis Weber, Berlin'
      },
      {
        id: 'med-2',
        date: '2024-05-12',
        purpose: 'Nail Trim & Grooming Inspection',
        findings: 'Clean pads, slight skin dryness near hips.',
        treatment: 'Soothed skin with coconut oil supplement recommendations.',
        veterinarianName: 'Dr. Thomas Weber',
        facilityName: 'Tierarztpraxis Weber, Berlin'
      }
    ],
    scanHistory: [
      {
        id: 'scan-1',
        date: '2025-05-10',
        documentType: 'EU Pet Passport (Germany)',
        countryDetected: 'Germany',
        extractedFieldsCount: 14
      }
    ]
  },
  {
    id: 'milo-us',
    name: 'Milo',
    species: 'cat',
    breed: 'Ragdoll',
    gender: 'Male',
    dateOfBirth: '2022-09-18',
    microchipNumber: '985112003948571',
    passportNumber: 'US-H-99214',
    ownerName: 'James Carter',
    countryOfOrigin: 'United States',
    avatarUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=300&h=300&q=80',
    notes: 'Indoor cat. Extremely calm, loves chin scratches. Weighs 5.2kg.',
    vaccinationRecords: [
      {
        id: 'vac-4',
        vaccineName: 'Purevax Feline Rabies 1-Yr',
        dateAdministered: '2026-02-15',
        dateDue: '2027-02-15',
        batchNumber: 'PV-5521',
        veterinarianName: 'Dr. Emily Rogers, DVM',
        countryOfAdministration: 'United States',
        notes: 'Right hind leg subcutaneous injection',
        status: 'active'
      },
      {
        id: 'vac-5',
        vaccineName: 'Purevax FVRCP',
        dateAdministered: '2026-02-15',
        dateDue: '2027-02-15',
        batchNumber: 'PV-9912',
        veterinarianName: 'Dr. Emily Rogers, DVM',
        countryOfAdministration: 'United States',
        notes: 'Triple protection feline combo',
        status: 'active'
      }
    ],
    medicalVisits: [
      {
        id: 'med-3',
        date: '2026-02-15',
        purpose: 'Wellness Examination & Vaccines',
        findings: 'Healthy body mass. Shiny coat. Mild ear wax but no infection.',
        treatment: 'Ears cleaned, routine boosters administered.',
        veterinarianName: 'Dr. Emily Rogers, DVM',
        facilityName: 'Brooklyn Feline Hospital, NYC'
      }
    ],
    scanHistory: [
      {
        id: 'scan-2',
        date: '2026-02-15',
        documentType: 'US Veterinary Health Certificate',
        countryDetected: 'United States',
        extractedFieldsCount: 11
      }
    ]
  }
];

export const COUNTRY_RULES_DATABASE: CountryRule[] = [
  {
    id: 'jp',
    countryName: 'Japan',
    flag: '🇯🇵',
    rules: {
      microchip: {
        required: true,
        details: 'ISO 11784/11785 standard microchip must be implanted before the 1st Rabies vaccine.'
      },
      rabiesVaccine: {
        required: true,
        details: 'Requires 2 Rabies vaccinations after microchipping. Active booster must be valid upon entry.',
        validityPeriodDays: 365
      },
      otherVaccines: ['DHPP (Dogs)', 'FVRCP (Cats)'],
      waitingPeriodDays: 180, // 180 days wait after Rabies blood titer test before entry
      quarantineRequired: true,
      quarantineDetails: 'Up to 12 hours if all rules (incl. 180-day wait) are met, otherwise up to 180 days in government facility.',
      documentationRequired: ['Form A (Owner Declaration)', 'Form B (Veterinary Endorsement)', 'FAVN Blood Titer Report']
    }
  },
  {
    id: 'au',
    countryName: 'Australia',
    flag: '🇦🇺',
    rules: {
      microchip: {
        required: true,
        details: 'ISO 11784/11785 compliant microchip required.'
      },
      rabiesVaccine: {
        required: true,
        details: 'Must have a Rabies vaccine administered between 30 and 365 days prior to travel, backed by RNATT blood test.',
        validityPeriodDays: 365
      },
      otherVaccines: ['Leptospirosis', 'Lyme Disease', 'Distemper', 'Feline Enteritis'],
      waitingPeriodDays: 180,
      quarantineRequired: true,
      quarantineDetails: 'Mandatory 10 to 30 days quarantine at Mickleham Post-Entry Quarantine facility in Melbourne.',
      documentationRequired: ['Import Permit', 'RNATT Declaration', 'Official Health Certificate']
    }
  },
  {
    id: 'gb',
    countryName: 'United Kingdom',
    flag: '🇬🇧',
    rules: {
      microchip: {
        required: true,
        details: 'Microchip must be read before or at the same time as the Rabies vaccination.'
      },
      rabiesVaccine: {
        required: true,
        details: 'Rabies vaccine must be given at least 21 days before traveling. 1, 2, or 3 year validity certificates accepted.',
        validityPeriodDays: 365
      },
      otherVaccines: ['Tapeworm (Echinococcus multilocularis) treatment required for dogs (24-120h before entry)'],
      waitingPeriodDays: 21,
      quarantineRequired: false,
      quarantineDetails: 'No quarantine if coming from listed compliant countries with active pet passport.',
      documentationRequired: ['Great Britain Pet Health Certificate', 'Tapeworm treatment endorsement']
    }
  },
  {
    id: 'de',
    countryName: 'Germany / European Union',
    flag: '🇪🇺',
    rules: {
      microchip: {
        required: true,
        details: 'ISO 11784/11785 microchip mandatory before rabies vaccination.'
      },
      rabiesVaccine: {
        required: true,
        details: 'Given at least 21 days before entry. Booster must have been administered within valid intervals.',
        validityPeriodDays: 365
      },
      otherVaccines: ['Core vaccines highly recommended but not strictly legally required for entry.'],
      waitingPeriodDays: 21,
      quarantineRequired: false,
      documentationRequired: ['EU Pet Passport', 'EU Non-Commercial Health Certificate (if non-EU country of origin)']
    }
  },
  {
    id: 'sg',
    countryName: 'Singapore',
    flag: '🇸🇬',
    rules: {
      microchip: {
        required: true,
        details: 'ISO 11784/11785 microchip mandatory.'
      },
      rabiesVaccine: {
        required: true,
        details: 'Vaccine administered at least 30 days and not more than 12 months before export.',
        validityPeriodDays: 365
      },
      otherVaccines: ['Dog combo (Distemper, Hepatitis, Parvovirus)', 'Cat combo (FVRCP)'],
      waitingPeriodDays: 30,
      quarantineRequired: true,
      quarantineDetails: 'Category-dependent quarantine. 10 days to 30 days at Sembawang Animal Quarantine Station.',
      documentationRequired: ['NParks Import License', 'Veterinary Health Certificate', 'Rabies Serology Report']
    }
  }
];

export const DEMO_PRESETS = [
  {
    id: 'germany_passport',
    title: '🇩🇪 Germany: Official EU Pet Passport',
    petName: 'Luna',
    species: 'Dog (Golden Retriever)',
    notes: 'Contains microchip sticker, German veterinary signature, and official Nobivac Rabies booster sticker.'
  },
  {
    id: 'us_certificate',
    title: '🇺🇸 USA: Vet Health & Vaccination Certificate',
    petName: 'Milo',
    species: 'Cat (Ragdoll)',
    notes: 'Official Brooklyn vet certificate with Purevax feline vaccines & DVM stamps.'
  },
  {
    id: 'japan_booklet',
    title: '🇯🇵 Japan: Prefectural Health booklet',
    petName: 'Sakura',
    species: 'Dog (Shiba Inu)',
    notes: 'Japanese language vaccination log with Canine 6-Way and Rabies stamps from Tokyo clinic.'
  }
];
