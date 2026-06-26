/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Sparkles, 
  Calendar, 
  MapPin, 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  History, 
  User, 
  ChevronRight, 
  Check, 
  Trash2, 
  Search, 
  Info, 
  Heart,
  Smartphone,
  ShieldCheck,
  PlaneTakeoff,
  Stethoscope,
  BriefcaseMedical
} from 'lucide-react';
import { Pet, VaccinationRecord, MedicalVisit, PetSpecies } from './types';
import { INITIAL_PETS } from './data';
import PassportScanner from './components/PassportScanner';
import TravelCompliance from './components/TravelCompliance';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Mobile only constraint: Manage responsive state
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'home' | 'travel' | 'add_pet'>('home');
  const [activePetSection, setActivePetSection] = useState<'vaccines' | 'visits' | 'info'>('vaccines');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  
  // Manual pet adding states
  const [newPetName, setNewPetName] = useState('');
  const [newPetSpecies, setNewPetSpecies] = useState<PetSpecies>('dog');
  const [newPetBreed, setNewPetBreed] = useState('');
  const [newPetGender, setNewPetGender] = useState<'Male' | 'Female' | 'Unknown'>('Unknown');
  const [newPetDob, setNewPetDob] = useState('');
  const [newPetMicrochip, setNewPetMicrochip] = useState('');
  const [newPetPassport, setNewPetPassport] = useState('');
  const [newPetOwner, setNewPetOwner] = useState('');
  const [newPetCountry, setNewPetCountry] = useState('Germany');
  const [newPetNotes, setNewPetNotes] = useState('');

  // Local Time simulation for status bar
  const [timeStr, setTimeStr] = useState('14:16');

  useEffect(() => {
    // Clock
    const timer = setInterval(() => {
      const now = new Date();
      const hrs = now.getHours().toString().padStart(2, '0');
      const mins = now.getMinutes().toString().padStart(2, '0');
      setTimeStr(`${hrs}:${mins}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load pets from local storage or set default
  useEffect(() => {
    const saved = localStorage.getItem('pet_healthcare_books');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPets(parsed);
        if (parsed.length > 0) {
          setSelectedPetId(parsed[0].id);
        }
      } catch (err) {
        setPets(INITIAL_PETS);
        setSelectedPetId(INITIAL_PETS[0].id);
      }
    } else {
      setPets(INITIAL_PETS);
      setSelectedPetId(INITIAL_PETS[0].id);
    }
  }, []);

  // Sync to local storage
  const savePets = (newPetsList: Pet[]) => {
    setPets(newPetsList);
    localStorage.setItem('pet_healthcare_books', JSON.stringify(newPetsList));
  };

  const currentPet = pets.find(p => p.id === selectedPetId);

  // Manual Add submit
  const handleManualAddPet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPetName) return;

    // Use a clean default avatar from Unsplash depending on species
    let avatarUrl = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=300&h=300&q=80';
    if (newPetSpecies === 'cat') {
      avatarUrl = 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=300&h=300&q=80';
    } else if (newPetSpecies === 'rabbit') {
      avatarUrl = 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=300&h=300&q=80';
    } else if (newPetSpecies === 'bird') {
      avatarUrl = 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&w=300&h=300&q=80';
    }

    const createdPet: Pet = {
      id: 'pet-' + Date.now(),
      name: newPetName,
      species: newPetSpecies,
      breed: newPetBreed || 'Mixed Breed',
      gender: newPetGender,
      dateOfBirth: newPetDob || new Date().toISOString().split('T')[0],
      microchipNumber: newPetMicrochip,
      passportNumber: newPetPassport,
      ownerName: newPetOwner,
      countryOfOrigin: newPetCountry || 'United States',
      avatarUrl,
      notes: newPetNotes,
      vaccinationRecords: [],
      medicalVisits: [],
      scanHistory: []
    };

    const updated = [createdPet, ...pets];
    savePets(updated);
    setSelectedPetId(createdPet.id);
    setActiveTab('home');

    // Reset fields
    setNewPetName('');
    setNewPetBreed('');
    setNewPetDob('');
    setNewPetMicrochip('');
    setNewPetPassport('');
    setNewPetOwner('');
    setNewPetNotes('');
  };

  // Handle Scan Success Callback
  const handleScanComplete = (extracted: any, targetOption: string) => {
    setIsScannerOpen(false);

    const generatedVaccines: VaccinationRecord[] = (extracted.vaccinationRecords || []).map((vac: any, i: number) => ({
      id: `ext-vac-${Date.now()}-${i}`,
      vaccineName: vac.vaccineName,
      dateAdministered: vac.dateAdministered,
      dateDue: vac.dateDue,
      batchNumber: vac.batchNumber,
      veterinarianName: vac.veterinarianName,
      countryOfAdministration: vac.countryOfAdministration || extracted.countryDetected,
      notes: vac.notes,
      status: 'active'
    }));

    const generatedVisits: MedicalVisit[] = (extracted.medicalVisits || []).map((visit: any, i: number) => ({
      id: `ext-visit-${Date.now()}-${i}`,
      date: visit.date,
      purpose: visit.purpose,
      findings: visit.findings,
      treatment: visit.treatment,
      veterinarianName: visit.veterinarianName
    }));

    const newScanHistory = {
      id: `scan-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      documentType: extracted.documentType || 'Digitized Document',
      countryDetected: extracted.countryDetected || 'Global',
      extractedFieldsCount: (extracted.petDetails ? 5 : 0) + generatedVaccines.length + generatedVisits.length
    };

    if (targetOption === 'new') {
      // Create fresh new pet profile from scanned details
      const petDetails = extracted.petDetails || {};
      let avatarUrl = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=300&h=300&q=80';
      if (petDetails.species === 'cat') {
        avatarUrl = 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=300&h=300&q=80';
      }

      const newPet: Pet = {
        id: `scanned-pet-${Date.now()}`,
        name: petDetails.name || 'Scanned Pet',
        species: (petDetails.species?.toLowerCase() as PetSpecies) || 'dog',
        breed: petDetails.breed || 'Extracted Breed',
        gender: petDetails.gender || 'Unknown',
        dateOfBirth: petDetails.dateOfBirth || new Date().toISOString().split('T')[0],
        microchipNumber: petDetails.microchipNumber,
        passportNumber: petDetails.passportNumber,
        ownerName: petDetails.ownerName,
        countryOfOrigin: petDetails.countryOfOrigin || extracted.countryDetected || 'Unknown',
        avatarUrl,
        notes: `AI Extracted from physical booklet on ${new Date().toLocaleDateString()}`,
        vaccinationRecords: generatedVaccines,
        medicalVisits: generatedVisits,
        scanHistory: [newScanHistory]
      };

      const updated = [newPet, ...pets];
      savePets(updated);
      setSelectedPetId(newPet.id);
      setActiveTab('home');
    } else {
      // Merge into existing pet profile
      const updated = pets.map(pet => {
        if (pet.id === targetOption) {
          return {
            ...pet,
            microchipNumber: pet.microchipNumber || extracted.petDetails?.microchipNumber,
            passportNumber: pet.passportNumber || extracted.petDetails?.passportNumber,
            vaccinationRecords: [...generatedVaccines, ...pet.vaccinationRecords],
            medicalVisits: [...generatedVisits, ...pet.medicalVisits],
            scanHistory: [newScanHistory, ...pet.scanHistory]
          };
        }
        return pet;
      });
      savePets(updated);
      setSelectedPetId(targetOption);
      setActiveTab('home');
    }
  };

  const deletePet = (petId: string) => {
    if (confirm('Are you sure you want to remove this pet profile? This cannot be undone.')) {
      const filtered = pets.filter(p => p.id !== petId);
      savePets(filtered);
      if (filtered.length > 0) {
        setSelectedPetId(filtered[0].id);
      } else {
        setSelectedPetId('');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#0F172A] via-[#1E293B] to-[#334155] flex items-center justify-center font-sans antialiased p-0 md:p-6 overflow-x-hidden relative">
      
      {/* Background Mesh Decor */}
      <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[0%] right-[0%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Primary Mobile Container Viewport Frame */}
      {/* On desktop we contain the app inside a perfect mobile mockup device frame. On mobile we stretch edge-to-edge. */}
      <div className="w-full max-w-md md:h-[880px] bg-slate-950/80 backdrop-blur-2xl md:rounded-[48px] md:shadow-2xl md:border-[10px] md:border-slate-800/80 relative flex flex-col overflow-hidden">
        
        {/* Background Mesh inside device frame */}
        <div className="absolute top-[-5%] left-[-5%] w-[200px] h-[200px] bg-indigo-500/20 rounded-full blur-[70px] pointer-events-none z-0" />
        <div className="absolute bottom-[10%] right-[-5%] w-[250px] h-[250px] bg-emerald-500/10 rounded-full blur-[90px] pointer-events-none z-0" />

        {/* Device Speaker & Camera Notch (Dynamic Island look) */}
        <div className="hidden md:block absolute top-3 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50">
          <div className="absolute right-3 top-1.5 w-2 h-2 bg-slate-900 rounded-full" />
        </div>

        {/* Mobile Header Status Bar */}
        <div className="bg-slate-950/40 backdrop-blur-md px-6 pt-3 pb-2 flex justify-between items-center text-xs font-semibold text-slate-300 border-b border-white/5 select-none z-30 shrink-0 relative">
          <span className="font-mono text-[11px]">{timeStr}</span>
          <div className="flex items-center gap-1.5">
            {/* Carrier signal indicator bars */}
            <div className="flex gap-0.5 items-end h-2.5">
              <span className="w-0.5 h-1 bg-slate-300 rounded-full" />
              <span className="w-0.5 h-1.5 bg-slate-300 rounded-full" />
              <span className="w-0.5 h-2 bg-slate-300 rounded-full" />
              <span className="w-0.5 h-2.5 bg-slate-300 rounded-full" />
            </div>
            <span className="text-[9px] bg-white/10 text-slate-300 px-1 py-0.5 rounded-sm scale-90">5G</span>
            {/* Battery representation */}
            <div className="w-5 h-2.5 border border-slate-400 rounded-sm relative flex items-center p-0.5">
              <div className="h-full w-4 bg-emerald-500 rounded-xs" />
              <span className="absolute -right-0.5 top-0.5 w-0.5 h-1 bg-slate-400 rounded-r-xs" />
            </div>
          </div>
        </div>

        {/* Dynamic Mobile App Bar */}
        <div className="bg-white/5 backdrop-blur-md border-b border-white/10 px-5 py-4 flex justify-between items-center z-20 shrink-0 relative">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white shadow-md shadow-indigo-600/30">
              <BriefcaseMedical className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-display font-bold text-slate-100 tracking-tight">VetBook Passport</h1>
              <p className="text-[10px] text-slate-400">Scan & Transcribe Globally</p>
            </div>
          </div>

          <button
            onClick={() => setIsScannerOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg shadow-indigo-600/25 border border-indigo-500/30 transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" /> Scan Booklet
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-transparent flex flex-col pb-24 relative z-10">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 flex flex-col gap-4"
              >
                {/* Horizontal Pet Selector Carousel */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      My Registered Pets ({pets.length})
                    </span>
                    <button 
                      onClick={() => setActiveTab('add_pet')}
                      className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-0.5"
                    >
                      <Plus className="w-3 h-3" /> Add Pet
                    </button>
                  </div>
                  
                  {pets.length === 0 ? (
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl text-center flex flex-col items-center">
                      <Heart className="w-10 h-10 text-rose-400 stroke-1.5 mb-2 animate-pulse" />
                      <p className="text-xs text-slate-200 font-semibold">No Pets Registered Yet</p>
                      <p className="text-[10px] text-slate-400 max-w-xs mt-1 leading-normal">
                        Scan your physical pet healthcare book or type in details manually to create your first secure passport card!
                      </p>
                      <button
                        onClick={() => setIsScannerOpen(true)}
                        className="mt-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shadow-indigo-600/25 border border-indigo-500/30 transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Scan to auto-generate
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2.5 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar scroll-smooth">
                      {pets.map((pet) => {
                        const isSelected = pet.id === selectedPetId;
                        return (
                          <button
                            key={pet.id}
                            onClick={() => setSelectedPetId(pet.id)}
                            className={`flex items-center gap-2.5 shrink-0 px-3.5 py-2.5 rounded-full border text-left transition-all relative ${
                              isSelected 
                                ? 'bg-indigo-600/90 border-indigo-500/50 text-white shadow-lg shadow-indigo-500/20' 
                                : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                            }`}
                          >
                            <img 
                              src={pet.avatarUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=100&h=100&q=80'} 
                              alt={pet.name} 
                              className="w-7 h-7 rounded-full object-cover border border-white/20"
                            />
                            <div>
                              <h3 className="text-xs font-bold leading-none">{pet.name}</h3>
                              <p className={`text-[9px] mt-0.5 ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                                {pet.breed}
                              </p>
                            </div>
                            {isSelected && (
                              <motion.span 
                                layoutId="active-indicator" 
                                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-indigo-400 rounded-full" 
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Selected Pet Passport Card & Information Tab */}
                {currentPet && (
                  <div className="flex flex-col gap-4">
                    {/* Passport Card (Elegant, official-looking document layout) */}
                    <div className="bg-gradient-to-br from-white/10 via-white/5 to-indigo-950/40 backdrop-blur-xl rounded-3xl p-5 text-slate-100 shadow-xl relative overflow-hidden border border-white/20">
                      {/* Grid background lines */}
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:14px_14px]" />
                      
                      {/* Top ribbon */}
                      <div className="relative z-10 flex justify-between items-start">
                        <div className="flex gap-1.5 items-center">
                          <span className="text-[10px] tracking-wider font-mono bg-white/10 text-indigo-300 font-bold px-2 py-0.5 rounded uppercase border border-white/10">
                            PET PASSPORT / IMPFPASS
                          </span>
                        </div>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-500/30">
                          {currentPet.countryOfOrigin || 'International'}
                        </span>
                      </div>

                      <div className="relative z-10 flex gap-4 mt-4 items-center">
                        <img 
                          src={currentPet.avatarUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=300&h=300&q=80'} 
                          alt={currentPet.name} 
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-md"
                        />
                        <div className="flex-1 text-xs">
                          <div className="flex justify-between items-center">
                            <h2 className="text-lg font-display font-extrabold tracking-tight text-white">{currentPet.name}</h2>
                            <button
                              onClick={() => deletePet(currentPet.id)}
                              className="text-slate-400 hover:text-rose-400 p-1 rounded-md transition-colors"
                              title="Delete pet profile"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-indigo-300 mt-0.5 font-medium">{currentPet.breed}</p>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 text-[10px] text-slate-300 font-mono">
                            <div>DOB: <span className="text-white font-semibold">{currentPet.dateOfBirth}</span></div>
                            <div>Sex: <span className="text-white font-semibold">{currentPet.gender}</span></div>
                          </div>
                        </div>
                      </div>

                      {/* Transponder/Passport Identifiers */}
                      <div className="relative z-10 mt-4 pt-3.5 border-t border-white/10 grid grid-cols-1 gap-2 text-[11px] font-mono text-slate-300">
                        {currentPet.microchipNumber && (
                          <div className="flex justify-between items-center">
                            <span className="flex items-center gap-1 text-slate-400">
                              <Cpu className="w-3 h-3 text-indigo-400" /> Transponder ID:
                            </span>
                            <span className="text-white font-bold">{currentPet.microchipNumber}</span>
                          </div>
                        )}
                        {currentPet.passportNumber && (
                          <div className="flex justify-between items-center">
                            <span className="flex items-center gap-1 text-slate-400">
                              <MapPin className="w-3 h-3 text-indigo-400" /> Booklet/Passport #:
                            </span>
                            <span className="text-white font-bold">{currentPet.passportNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Active Medical Segments Toggle */}
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-1 rounded-xl flex gap-1 shadow-xs">
                      <button
                        onClick={() => setActivePetSection('vaccines')}
                        className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                          activePetSection === 'vaccines' 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-650/20' 
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                        }`}
                      >
                        💉 Vaccines ({currentPet.vaccinationRecords.length})
                      </button>
                      <button
                        onClick={() => setActivePetSection('visits')}
                        className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                          activePetSection === 'visits' 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-650/20' 
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                        }`}
                      >
                        🩺 Medical Logs ({currentPet.medicalVisits.length})
                      </button>
                      <button
                        onClick={() => setActivePetSection('info')}
                        className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                          activePetSection === 'info' 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-650/20' 
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                        }`}
                      >
                        ℹ️ Info & Scan Log
                      </button>
                    </div>

                    {/* Active Section Content Container */}
                    <div className="min-h-[150px]">
                      {activePetSection === 'vaccines' && (
                        <div className="flex flex-col gap-2.5">
                          {currentPet.vaccinationRecords.length === 0 ? (
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl text-center text-slate-400 text-xs">
                              <Info className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                              <p className="text-slate-300">No vaccination records digitised.</p>
                              <p className="text-[10px] text-slate-400 mt-1">Scan a vaccine book page to load medical history!</p>
                            </div>
                          ) : (
                            currentPet.vaccinationRecords.map((vac) => {
                              const isOverdue = vac.status === 'overdue' || (vac.dateDue && new Date(vac.dateDue) < new Date());
                              return (
                                <div 
                                  key={vac.id} 
                                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 shadow-xs flex justify-between items-start hover:border-white/20 transition-colors"
                                >
                                  <div className="text-xs flex-1 pr-3">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-bold text-slate-100">{vac.vaccineName}</h4>
                                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold border ${
                                        isOverdue 
                                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
                                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                      }`}>
                                        {isOverdue ? 'Overdue Booster' : 'Active / Valid'}
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-y-1 mt-2.5 text-[10px] text-slate-400 font-mono">
                                      <div>Administered: <span className="text-slate-200 font-semibold">{vac.dateAdministered}</span></div>
                                      <div>Due Date: <span className={`font-semibold ${isOverdue ? 'text-rose-300' : 'text-indigo-300'}`}>{vac.dateDue || 'Not stated'}</span></div>
                                      {vac.batchNumber && <div className="col-span-2">Lot Batch ID: <span className="text-slate-300">{vac.batchNumber}</span></div>}
                                      {vac.veterinarianName && <div className="col-span-2">Registered Vet: <span className="text-slate-300 font-sans">{vac.veterinarianName}</span></div>}
                                      {vac.countryOfAdministration && <div className="col-span-2">Country issued: <span className="text-slate-300 font-sans font-medium">{vac.countryOfAdministration}</span></div>}
                                    </div>
                                    {vac.notes && <p className="text-[10px] text-slate-400 italic mt-2">"{vac.notes}"</p>}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}

                      {activePetSection === 'visits' && (
                        <div className="flex flex-col gap-2.5">
                          {currentPet.medicalVisits.length === 0 ? (
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl text-center text-slate-400 text-xs">
                              <Info className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                              <p className="text-slate-300">No clinic stamps or medical reports digitized.</p>
                            </div>
                          ) : (
                            currentPet.medicalVisits.map((visit) => (
                              <div 
                                key={visit.id} 
                                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 shadow-xs hover:border-white/20 transition-colors"
                              >
                                <div className="flex justify-between items-center text-xs">
                                  <span className="font-mono text-[10px] text-slate-400 font-semibold">{visit.date}</span>
                                  <span className="bg-white/10 border border-white/10 text-slate-200 text-[9px] font-bold px-2 py-0.5 rounded">
                                    {visit.purpose || 'General Exam'}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                                  <span className="font-semibold text-slate-200">Clinical Findings:</span> {visit.findings}
                                </p>
                                {visit.treatment && (
                                  <div className="mt-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] text-emerald-200 leading-normal">
                                    <span className="font-bold text-emerald-300 block mb-0.5">⚕️ Treatment / Vaccine Stamp Applied:</span>
                                    {visit.treatment}
                                  </div>
                                )}
                                <div className="mt-2.5 pt-2 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-400">
                                  <span>{visit.veterinarianName || 'Vet Surgeon'}</span>
                                  <span>{visit.facilityName || 'Official Vet Clinic'}</span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      {activePetSection === 'info' && (
                        <div className="flex flex-col gap-3">
                          {/* Owner Profile and Description */}
                          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-xs">
                            <h4 className="font-semibold text-slate-200 border-b border-white/5 pb-2 mb-2 flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-indigo-400" /> Parent / Guardian details
                            </h4>
                            <div className="grid grid-cols-2 gap-2 text-slate-400 leading-relaxed font-mono text-[11px]">
                              <div>Owner: <span className="text-slate-200 font-semibold font-sans">{currentPet.ownerName || 'Not recorded'}</span></div>
                              <div>Origin Country: <span className="text-slate-200 font-semibold font-sans">{currentPet.countryOfOrigin}</span></div>
                            </div>
                            {currentPet.notes && (
                              <div className="mt-3 bg-slate-950/40 p-2.5 rounded-xl border border-white/5">
                                <span className="font-bold text-slate-300 text-[10px] block uppercase tracking-wider mb-0.5">Pet Personality/Dietary notes:</span>
                                <p className="text-[11px] text-slate-300 font-sans italic">"{currentPet.notes}"</p>
                              </div>
                            )}
                          </div>

                          {/* Historical Scan Logs */}
                          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-xs">
                            <h4 className="font-semibold text-slate-200 border-b border-white/5 pb-2 mb-2 flex items-center gap-1.5">
                              <History className="w-3.5 h-3.5 text-indigo-400" /> Gemini Scan Audit Trail
                            </h4>
                            {currentPet.scanHistory.length === 0 ? (
                              <p className="text-[10px] text-slate-400">This profile was generated manually.</p>
                            ) : (
                              <div className="flex flex-col gap-2">
                                {currentPet.scanHistory.map((scan) => (
                                  <div key={scan.id} className="text-[10px] flex justify-between items-center bg-white/5 border border-white/5 p-2 rounded-lg font-mono">
                                    <div>
                                      <p className="font-semibold text-slate-200 font-sans">{scan.documentType}</p>
                                      <p className="text-[9px] text-slate-400 mt-0.5">{scan.date} • Country: {scan.countryDetected}</p>
                                    </div>
                                    <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold px-1.5 py-0.5 rounded text-[8px]">
                                      {scan.extractedFieldsCount} fields extracted
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'travel' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 flex flex-col gap-4"
              >
                <div className="flex flex-col">
                  <h2 className="text-base font-display font-bold text-slate-100">
                    🌍 Global Compliance Check
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Select a pet passport and choose your destination to verify vaccine entry windows automatically.
                  </p>
                </div>

                {pets.length === 0 ? (
                  <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-center text-xs text-slate-400">
                    Register a pet first to check travel compliance.
                  </div>
                ) : (
                  <>
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-3.5 rounded-2xl flex flex-col gap-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Select Travelling Pet
                      </label>
                      <div className="flex gap-2">
                        {pets.map(p => (
                          <button
                            key={p.id}
                            onClick={() => setSelectedPetId(p.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-semibold transition-all ${
                              p.id === selectedPetId 
                                ? 'bg-indigo-600 text-white border-indigo-500/50 shadow-lg shadow-indigo-600/20' 
                                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                            }`}
                          >
                            <img src={p.avatarUrl} alt={p.name} className="w-4 h-4 rounded-full object-cover" />
                            {p.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {currentPet && (
                      <TravelCompliance pet={currentPet} />
                    )}
                  </>
                )}
              </motion.div>
            )}

            {activeTab === 'add_pet' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 flex flex-col gap-4"
              >
                <div>
                  <h2 className="text-base font-display font-bold text-slate-100">🐾 New Pet Registry</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Add manually below or use the "Scan Booklet" option to fill automatically using physical passport logs.
                  </p>
                </div>

                <form onSubmit={handleManualAddPet} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col gap-3 text-xs text-slate-300 shadow-xl">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Pet Name*</label>
                    <input 
                      type="text" 
                      required 
                      value={newPetName} 
                      onChange={(e) => setNewPetName(e.target.value)}
                      placeholder="e.g. Bella" 
                      className="w-full bg-slate-950/50 border border-white/10 text-slate-100 rounded-xl p-2.5 text-xs focus:outline-none focus:border-indigo-500 backdrop-blur-sm placeholder-slate-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Species</label>
                      <select 
                        value={newPetSpecies} 
                        onChange={(e) => setNewPetSpecies(e.target.value as PetSpecies)}
                        className="w-full bg-slate-950/50 border border-white/10 text-slate-100 rounded-xl p-2.5 text-xs focus:outline-none focus:border-indigo-500 backdrop-blur-sm"
                      >
                        <option value="dog" className="bg-slate-900 text-slate-100">Dog</option>
                        <option value="cat" className="bg-slate-900 text-slate-100">Cat</option>
                        <option value="rabbit" className="bg-slate-900 text-slate-100">Rabbit</option>
                        <option value="bird" className="bg-slate-900 text-slate-100">Bird</option>
                        <option value="horse" className="bg-slate-900 text-slate-100">Horse</option>
                        <option value="other" className="bg-slate-900 text-slate-100">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Breed</label>
                      <input 
                        type="text" 
                        value={newPetBreed} 
                        onChange={(e) => setNewPetBreed(e.target.value)}
                        placeholder="e.g. Beagle" 
                        className="w-full bg-slate-950/50 border border-white/10 text-slate-100 rounded-xl p-2.5 text-xs focus:outline-none focus:border-indigo-500 backdrop-blur-sm placeholder-slate-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Gender</label>
                      <select 
                        value={newPetGender} 
                        onChange={(e) => setNewPetGender(e.target.value as any)}
                        className="w-full bg-slate-950/50 border border-white/10 text-slate-100 rounded-xl p-2.5 text-xs focus:outline-none focus:border-indigo-500 backdrop-blur-sm"
                      >
                        <option value="Male" className="bg-slate-900 text-slate-100">Male</option>
                        <option value="Female" className="bg-slate-900 text-slate-100">Female</option>
                        <option value="Unknown" className="bg-slate-900 text-slate-100">Unknown</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Date of Birth</label>
                      <input 
                        type="date" 
                        value={newPetDob} 
                        onChange={(e) => setNewPetDob(e.target.value)}
                        className="w-full bg-slate-950/50 border border-white/10 text-slate-100 rounded-xl p-2.5 text-xs focus:outline-none focus:border-indigo-500 backdrop-blur-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Microchip ID (Optional)</label>
                      <input 
                        type="text" 
                        value={newPetMicrochip} 
                        onChange={(e) => setNewPetMicrochip(e.target.value)}
                        placeholder="15 digit code" 
                        className="w-full bg-slate-950/50 border border-white/10 text-slate-100 rounded-xl p-2.5 text-xs focus:outline-none focus:border-indigo-500 backdrop-blur-sm placeholder-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Passport / Book ID (Opt)</label>
                      <input 
                        type="text" 
                        value={newPetPassport} 
                        onChange={(e) => setNewPetPassport(e.target.value)}
                        placeholder="Passport / serial ID" 
                        className="w-full bg-slate-950/50 border border-white/10 text-slate-100 rounded-xl p-2.5 text-xs focus:outline-none focus:border-indigo-500 backdrop-blur-sm placeholder-slate-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Owner Name</label>
                      <input 
                        type="text" 
                        value={newPetOwner} 
                        onChange={(e) => setNewPetOwner(e.target.value)}
                        placeholder="Your full name" 
                        className="w-full bg-slate-950/50 border border-white/10 text-slate-100 rounded-xl p-2.5 text-xs focus:outline-none focus:border-indigo-500 backdrop-blur-sm placeholder-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Country of Origin</label>
                      <input 
                        type="text" 
                        value={newPetCountry} 
                        onChange={(e) => setNewPetCountry(e.target.value)}
                        placeholder="Country" 
                        className="w-full bg-slate-950/50 border border-white/10 text-slate-100 rounded-xl p-2.5 text-xs focus:outline-none focus:border-indigo-500 backdrop-blur-sm placeholder-slate-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Notes / Diet / Medication</label>
                    <textarea 
                      value={newPetNotes} 
                      onChange={(e) => setNewPetNotes(e.target.value)}
                      placeholder="Notes about your pet..." 
                      rows={2}
                      className="w-full bg-slate-950/50 border border-white/10 text-slate-100 rounded-xl p-2.5 text-xs focus:outline-none focus:border-indigo-500 backdrop-blur-sm placeholder-slate-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl mt-2 transition-colors shadow-lg shadow-indigo-600/25 border border-indigo-400/30"
                  >
                    Save Pet Profile
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Floating Scanner Action Overlay (If scan modal is active) */}
        <AnimatePresence>
          {isScannerOpen && (
            <PassportScanner 
              pets={pets} 
              onScanComplete={handleScanComplete} 
              onClose={() => setIsScannerOpen(false)} 
            />
          )}
        </AnimatePresence>

        {/* Global Bottom Tab Navigation */}
        <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 backdrop-blur-xl border-t border-white/10 px-6 py-3 flex justify-between items-center z-40 select-none shrink-0">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === 'home' ? 'text-indigo-400 scale-105 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-5 h-5" />
            <span className="text-[10px]">My Pets</span>
          </button>

          <button
            onClick={() => setActiveTab('travel')}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === 'travel' ? 'text-indigo-400 scale-105 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlaneTakeoff className="w-5 h-5" />
            <span className="text-[10px]">Travel Checks</span>
          </button>

          <button
            onClick={() => setActiveTab('add_pet')}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === 'add_pet' ? 'text-indigo-400 scale-105 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-5 h-5" />
            <span className="text-[10px]">Add Pet</span>
          </button>
        </div>

        {/* Safe Area bar at the bottom */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-800 rounded-full z-50 pointer-events-none" />

      </div>
    </div>
  );
}
