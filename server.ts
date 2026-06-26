/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Increase body payload limit for high-res base64 images
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// Shared Gemini Client variable (lazy initialized)
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (aiClient) return aiClient;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    console.warn('GEMINI_API_KEY is not configured or using placeholder. Running in Simulation / Demo mode.');
    return null;
  }
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    return aiClient;
  } catch (err) {
    console.error('Error initializing GoogleGenAI:', err);
    return null;
  }
}

// Demo dataset for simulation mode or fallback when no API key is available
const DEMO_EXTRACTIONS: Record<string, any> = {
  germany_passport: {
    documentType: "EU Pet Passport (Germany / DE)",
    countryDetected: "Germany",
    petDetails: {
      name: "Luna",
      species: "dog",
      breed: "Golden Retriever",
      gender: "Female",
      dateOfBirth: "2021-04-12",
      microchipNumber: "276098106234581",
      passportNumber: "DE-0941829",
      ownerName: "Sarah Müller",
      countryOfOrigin: "Germany"
    },
    vaccinationRecords: [
      {
        vaccineName: "Nobivac Rabies (Rabies)",
        dateAdministered: "2025-05-10",
        dateDue: "2026-05-10",
        batchNumber: "A918B22",
        veterinarianName: "Dr. Thomas Weber",
        countryOfAdministration: "Germany",
        notes: "Sticker & Official Stamp applied"
      },
      {
        vaccineName: "Nobivac DHPPi (Distemper, Hepatitis, Parvovirus, Parainfluenza)",
        dateAdministered: "2025-05-10",
        dateDue: "2026-05-10",
        batchNumber: "C224C10",
        veterinarianName: "Dr. Thomas Weber",
        countryOfAdministration: "Germany",
        notes: "Routine annual booster"
      }
    ],
    medicalVisits: [
      {
        date: "2025-05-10",
        purpose: "Annual Health Examination",
        findings: "Heart and lungs clear. Teeth in excellent condition. Weight: 28.5 kg.",
        treatment: "None required. Declared fit for travel.",
        veterinarianName: "Dr. Thomas Weber"
      }
    ]
  },
  us_certificate: {
    documentType: "US Veterinary Health Certificate",
    countryDetected: "United States",
    petDetails: {
      name: "Milo",
      species: "cat",
      breed: "Ragdoll",
      gender: "Male",
      dateOfBirth: "2022-09-18",
      microchipNumber: "985112003948571",
      passportNumber: "US-H-99214",
      ownerName: "James Carter",
      countryOfOrigin: "United States"
    },
    vaccinationRecords: [
      {
        vaccineName: "Purevax Feline Rabies 1-Yr",
        dateAdministered: "2026-02-15",
        dateDue: "2027-02-15",
        batchNumber: "PV-5521",
        veterinarianName: "Dr. Emily Rogers, DVM",
        countryOfAdministration: "United States",
        notes: "Right hind leg administration"
      },
      {
        vaccineName: "Purevax FVRCP",
        dateAdministered: "2026-02-15",
        dateDue: "2027-02-15",
        batchNumber: "PV-9912",
        veterinarianName: "Dr. Emily Rogers, DVM",
        countryOfAdministration: "United States",
        notes: "Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia booster"
      }
    ],
    medicalVisits: [
      {
        date: "2026-02-15",
        purpose: "Pre-Travel Rabies Titer Prep & Wellness Check",
        findings: "Healthy male, mild ear wax. Symmetrical build. Weight: 5.2 kg.",
        treatment: "Cleaned ears, administered routine vaccine boosters.",
        veterinarianName: "Dr. Emily Rogers, DVM"
      }
    ]
  },
  japan_booklet: {
    documentType: "Japan Pet Health Booklet (æ ç»å¹ / æ¥æ¬)",
    countryDetected: "Japan",
    petDetails: {
      name: "Sakura",
      species: "dog",
      breed: "Shiba Inu",
      gender: "Female",
      dateOfBirth: "2023-11-05",
      microchipNumber: "392248000123456",
      passportNumber: "JP-77123",
      ownerName: "Kenji Sato",
      countryOfOrigin: "Japan"
    },
    vaccinationRecords: [
      {
        vaccineName: "Canine 6-way Vaccine (Canigen)",
        dateAdministered: "2025-11-10",
        dateDue: "2026-11-10",
        batchNumber: "CG-88220",
        veterinarianName: "Dr. Akiko Tanaka, Sakura Vet Clinic",
        countryOfAdministration: "Japan",
        notes: "Approved domestic batch stamp"
      },
      {
        vaccineName: "Rabies Prevention Stamp",
        dateAdministered: "2026-04-12",
        dateDue: "2027-04-12",
        batchNumber: "JP-R-26-90",
        veterinarianName: "Dr. Akiko Tanaka, Sakura Vet Clinic",
        countryOfAdministration: "Japan",
        notes: "Annual mandatory prefecture registration"
      }
    ],
    medicalVisits: [
      {
        date: "2026-04-12",
        purpose: "Annual Rabies Registration & Health Screening",
        findings: "Excellent standard Shiba coat. Clear eyes. Joint mobility 100%. Weight: 9.1 kg.",
        treatment: "Prefectural vaccination & registration tag issued.",
        veterinarianName: "Dr. Akiko Tanaka"
      }
    ]
  }
};

// POST API Endpoint for scanning and extracting pet health books
app.post('/api/scan-book', async (req, res) => {
  const { image, selectedDemoTemplate, notes } = req.body;

  if (!image) {
    return res.status(400).json({ error: 'Missing image data' });
  }

  // If client selected a demo template and we are simulation mode, or even if we have API key
  // we can leverage the demo template for a robust, instant 100% accurate simulation response
  if (selectedDemoTemplate && DEMO_EXTRACTIONS[selectedDemoTemplate]) {
    console.log(`Using demo extraction dataset for '${selectedDemoTemplate}'`);
    // Add a slight latency to simulate a real scan
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return res.json({
      success: true,
      data: DEMO_EXTRACTIONS[selectedDemoTemplate],
      simulated: true
    });
  }

  const ai = getGeminiClient();

  // If no API key, fallback to a robust generalized simulation based on prompt or input notes
  if (!ai) {
    console.log('No Gemini API Key found. Simulating standard extraction based on prompt.');
    await new Promise((resolve) => setTimeout(resolve, 2200));

    // Try to guess based on notes or return a customizable mock
    const petName = notes || "Scanned Pet";
    const simulatedData = {
      documentType: "Digitized Veterinary Page Scan",
      countryDetected: "Global Format (Auto-extracted)",
      petDetails: {
        name: petName.substring(0, 20),
        species: "dog",
        breed: "Mixed Breed",
        gender: "Male",
        dateOfBirth: "2024-01-10",
        microchipNumber: "900082001182310",
        passportNumber: "G-992140",
        ownerName: "Pet Parent",
        countryOfOrigin: "United Kingdom"
      },
      vaccinationRecords: [
        {
          vaccineName: "DHPP Booster",
          dateAdministered: "2026-01-15",
          dateDue: "2027-01-15",
          batchNumber: "B883-99X",
          veterinarianName: "St. Jude Pet Clinic",
          countryOfAdministration: "United Kingdom",
          notes: "Extracted from handwritten record sticker"
        }
      ],
      medicalVisits: [
        {
          date: "2026-01-15",
          purpose: "Annual Wellness Clinic",
          findings: "Active, clear airways, normal heart rate.",
          treatment: "General health clearance certificate stamped.",
          veterinarianName: "Dr. Alice Green"
        }
      ]
    };

    return res.json({
      success: true,
      data: simulatedData,
      simulated: true,
      warning: 'Running in demo mode without active API key. Please configure GEMINI_API_KEY in Secrets panel for live scans!'
    });
  }

  try {
    // Process base64 data
    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid base64 image string format' });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    const prompt = `
      You are the ultimate veterinary digital transformation expert. Analyze this photo of a real, physical pet healthcare book, pet passport, vaccination card, or health certificate from any country in the world.
      
      Your goal is to parse and extract ALL readable medical, vaccination, and pet details and return them in a structured, normalized JSON format.
      
      Guidelines:
      1. Detect the pet details (Name, Species: dog, cat, rabbit, bird, horse, or other, Breed, Gender: Male, Female, or Unknown, Date of Birth in YYYY-MM-DD format, Microchip, Passport Number, Owner's Name, and the booklet Country).
      2. Detect all vaccination records. Standardize dates to YYYY-MM-DD. Extract the Vaccine Name, Date Administered, Date Due (if stated or can be calculated), Batch/Lot number, Veterinarian name, and Country.
      3. Detect any medical checkups, clinical exams, or treatment notes.
      4. Detect the country format and language of the document (e.g., French, Japanese, German, US).
      5. Translate non-English terms to English equivalents where possible (e.g., "Meldung" or "Impfung" -> vaccination context, "Rage" -> Rabies).
      6. If some fields are completely illegible or missing, omit them or provide null. Do not hallucinate values.
      
      Additional context provided by user: ${notes || "None"}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        {
          inlineData: {
            mimeType,
            data: base64Data
          }
        },
        {
          text: prompt
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            documentType: { type: Type.STRING, description: "Type of booklet page scanned (e.g., 'Rabies Vaccination Stamp page')" },
            countryDetected: { type: Type.STRING, description: "Country/language format of document" },
            petDetails: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                species: { type: Type.STRING, description: "dog, cat, rabbit, bird, horse, or other" },
                breed: { type: Type.STRING },
                gender: { type: Type.STRING, description: "Male, Female, or Unknown" },
                dateOfBirth: { type: Type.STRING, description: "YYYY-MM-DD format" },
                microchipNumber: { type: Type.STRING },
                passportNumber: { type: Type.STRING },
                ownerName: { type: Type.STRING },
                countryOfOrigin: { type: Type.STRING }
              }
            },
            vaccinationRecords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  vaccineName: { type: Type.STRING },
                  dateAdministered: { type: Type.STRING, description: "YYYY-MM-DD format" },
                  dateDue: { type: Type.STRING, description: "YYYY-MM-DD format" },
                  batchNumber: { type: Type.STRING },
                  veterinarianName: { type: Type.STRING },
                  countryOfAdministration: { type: Type.STRING },
                  notes: { type: Type.STRING }
                },
                required: ["vaccineName", "dateAdministered"]
              }
            },
            medicalVisits: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  date: { type: Type.STRING, description: "YYYY-MM-DD format" },
                  purpose: { type: Type.STRING },
                  findings: { type: Type.STRING },
                  treatment: { type: Type.STRING },
                  veterinarianName: { type: Type.STRING }
                },
                required: ["date", "purpose"]
              }
            }
          },
          required: ["documentType", "countryDetected"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error('Gemini model returned empty response.');
    }

    const parsedData = JSON.parse(resultText.trim());
    return res.json({
      success: true,
      data: parsedData,
      simulated: false
    });

  } catch (err: any) {
    console.error('Error in API /api/scan-book:', err);
    return res.status(500).json({
      error: 'An error occurred during scanning. ' + (err.message || ''),
      details: err
    });
  }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
