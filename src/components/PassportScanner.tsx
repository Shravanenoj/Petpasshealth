/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Sparkles, RefreshCw, CheckCircle2, FileText, AlertTriangle, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Pet, VaccinationRecord, MedicalVisit } from '../types';
import { DEMO_PRESETS } from '../data';

interface PassportScannerProps {
  pets: Pet[];
  onScanComplete: (extractedData: any, targetPetId: string | 'new') => void;
  onClose: () => void;
}

export default function PassportScanner({ pets, onScanComplete, onClose }: PassportScannerProps) {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'demo'>('demo');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatusMsg, setScanStatusMsg] = useState('');
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [targetPetOption, setTargetPetOption] = useState<string>('new');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stop camera when component unmounts or tab changes
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
  }, [activeTab]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Unable to access camera. Please make sure permissions are granted or upload an image instead.');
      setActiveTab('upload');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg');
        setImagePreview(base64);
        stopCamera();
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const selectDemoBook = async (presetId: string) => {
    // Generate a beautiful placeholder loading preview for the selected demo
    let placeholderUrl = '';
    if (presetId === 'germany_passport') {
      placeholderUrl = 'https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&w=500&q=80';
    } else if (presetId === 'us_certificate') {
      placeholderUrl = 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=500&q=80';
    } else {
      placeholderUrl = 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=500&q=80';
    }
    setImagePreview(placeholderUrl);
    triggerScan(placeholderUrl, presetId);
  };

  const triggerScan = async (base64Image: string, demoPresetId?: string) => {
    setIsScanning(true);
    setScanResult(null);

    const statuses = [
      'Extracting image high-contrast layers...',
      'Running AI OCR to detect multilingual terminology...',
      'Translating and matching vaccine types against international standards...',
      'Formulating digital immunization records...',
      'Done!'
    ];

    let statusIndex = 0;
    setScanStatusMsg(statuses[0]);

    const statusInterval = setInterval(() => {
      if (statusIndex < statuses.length - 2) {
        statusIndex++;
        setScanStatusMsg(statuses[statusIndex]);
      }
    }, 500);

    try {
      const response = await fetch('/api/scan-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64Image,
          selectedDemoTemplate: demoPresetId
        })
      });

      clearInterval(statusInterval);

      if (!response.ok) {
        throw new Error('Scanning request failed on server');
      }

      const result = await response.json();
      setScanStatusMsg('Finalizing extraction details...');
      
      if (result.success) {
        setScanResult(result.data);
      } else {
        throw new Error(result.error || 'Unknown extraction error');
      }
    } catch (err: any) {
      console.error(err);
      alert('Error parsing document: ' + (err.message || err));
    } finally {
      setIsScanning(false);
    }
  };

  const handleApprove = () => {
    if (!scanResult) return;
    onScanComplete(scanResult, targetPetOption);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh] text-slate-100"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-950/80 to-slate-900/80 border-b border-white/10 px-6 py-5 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-display font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-300 animate-pulse" />
              Scan Physical Healthcare Booklet
            </h2>
            <p className="text-xs text-slate-300 opacity-90">
              Our AI extracts vaccinations, microchip IDs, and medical visits automatically
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:bg-white/10 hover:text-white rounded-full p-2 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Main Scanner Section */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left Column: Input Source / Captured Document */}
          <div className="flex flex-col gap-4">
            {!scanResult && !isScanning && (
              <>
                {/* Tabs */}
                <div className="bg-white/5 border border-white/10 p-1 rounded-xl flex gap-1">
                  <button
                    onClick={() => setActiveTab('demo')}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${activeTab === 'demo' ? 'bg-indigo-600 shadow text-white font-medium shadow-indigo-600/20 border border-indigo-400/20' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
                  >
                    Demo Booklets (Fastest)
                  </button>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${activeTab === 'upload' ? 'bg-indigo-600 shadow text-white font-medium shadow-indigo-600/20 border border-indigo-400/20' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
                  >
                    File Upload
                  </button>
                  <button
                    onClick={() => setActiveTab('camera')}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${activeTab === 'camera' ? 'bg-indigo-600 shadow text-white font-medium shadow-indigo-600/20 border border-indigo-400/20' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
                  >
                    Live Camera Scan
                  </button>
                </div>

                {/* Tab content: Demo Booklets */}
                {activeTab === 'demo' && (
                  <div className="flex flex-col gap-3 py-2">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex gap-2.5 items-start">
                      <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-emerald-300">
                        Don't have a real, physical booklet or dog passport in front of you? Select one of our virtual physical templates below to watch the Gemini AI analyze, parse, and digitize them instantly!
                      </p>
                    </div>
                    {DEMO_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => selectDemoBook(preset.id)}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/50 rounded-xl p-4 text-left transition-all hover:shadow-sm group flex justify-between items-center"
                      >
                        <div className="pr-4">
                          <h4 className="text-sm font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                            {preset.title}
                          </h4>
                          <p className="text-xs text-slate-400 mt-0.5">{preset.notes}</p>
                          <div className="flex gap-2 mt-2">
                            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium px-2 py-0.5 rounded-full">
                              Pet Name: {preset.petName}
                            </span>
                            <span className="text-[10px] bg-white/10 text-slate-300 border border-white/5 font-medium px-2 py-0.5 rounded-full">
                              {preset.species}
                            </span>
                          </div>
                        </div>
                        <Sparkles className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition-colors shrink-0" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Tab content: Upload */}
                {activeTab === 'upload' && (
                  <div 
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer min-h-[250px] transition-all ${dragActive ? 'border-indigo-500 bg-white/10' : 'border-white/10 bg-white/5 hover:border-indigo-500/50 hover:bg-white/10'}`}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      accept="image/*" 
                      className="hidden" 
                    />
                    <Upload className="w-12 h-12 text-slate-400 mb-3" />
                    <p className="text-sm font-semibold text-slate-200">Drag & drop your booklet image here</p>
                    <p className="text-xs text-slate-400 mt-1">or click to browse from files</p>
                    <p className="text-[10px] text-slate-400 mt-4">Supports PNG, JPEG, HEIC up to 15MB</p>
                  </div>
                )}

                {/* Tab content: Camera */}
                {activeTab === 'camera' && (
                  <div className="flex flex-col gap-3">
                    {cameraError ? (
                      <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-4 rounded-xl text-xs flex gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <p>{cameraError}</p>
                      </div>
                    ) : (
                      <div className="relative bg-black rounded-2xl overflow-hidden aspect-[4/3] flex items-center justify-center">
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          className="w-full h-full object-cover"
                        />
                        {/* Overlay frame lines */}
                        <div className="absolute inset-4 border-2 border-dashed border-indigo-400/50 rounded-lg pointer-events-none flex items-center justify-center">
                          <p className="text-[10px] bg-black/60 text-indigo-300 font-mono px-2 py-1 rounded-full uppercase tracking-wider">
                            Position Passport Stamp Here
                          </p>
                        </div>
                        {/* Shutter Button */}
                        <button
                          onClick={capturePhoto}
                          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white border-4 border-indigo-500/30 p-4 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all"
                          title="Capture Snapshot"
                        >
                          <Camera className="w-6 h-6 text-indigo-400" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Scanning Laser Screen */}
            {isScanning && (
              <div className="bg-slate-950 rounded-2xl overflow-hidden relative aspect-[4/3] flex flex-col items-center justify-center p-6 text-white">
                {imagePreview && (
                  <img 
                    src={imagePreview} 
                    alt="Scanning source" 
                    className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm"
                  />
                )}
                {/* Horizontal moving laser line */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <motion.div 
                    animate={{ y: ['0%', '100%', '0%'] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                    className="w-full h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_15px_rgba(99,102,241,1)]"
                  />
                </div>
                <div className="relative z-10 text-center flex flex-col items-center">
                  <div className="bg-indigo-500/20 p-4 rounded-full border border-indigo-500/40 mb-4 animate-pulse">
                    <Sparkles className="w-10 h-10 text-indigo-400" />
                  </div>
                  <h3 className="text-base font-semibold tracking-wide">Gemini 3.5 Flash Scanning...</h3>
                  <p className="text-xs text-indigo-300/80 font-mono mt-2 min-h-[1.5rem]">
                    {scanStatusMsg}
                  </p>
                  <div className="w-48 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-4">
                    <motion.div 
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                      className="w-1/2 h-full bg-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Static Image Preview with Scan Action Button */}
            {imagePreview && !isScanning && !scanResult && (
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col gap-3 backdrop-blur-md">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-400" /> Document Snapshot
                  </span>
                  <button
                    onClick={() => {
                      setImagePreview(null);
                      if (activeTab === 'camera') startCamera();
                    }}
                    className="text-xs text-rose-400 hover:text-rose-300 hover:underline"
                  >
                    Clear / Resnap
                  </button>
                </div>
                <div className="rounded-xl overflow-hidden border border-white/10 aspect-[4/3] bg-slate-950 flex items-center justify-center">
                  <img src={imagePreview} alt="Snapshot Preview" className="w-full h-full object-cover" />
                </div>
                <button
                  onClick={() => triggerScan(imagePreview!)}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl shadow-lg border border-indigo-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> Analyse with Gemini AI
                </button>
              </div>
            )}

            {/* Final Scan Completed Picture */}
            {scanResult && imagePreview && (
              <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 p-3 backdrop-blur-md">
                <p className="text-xs font-semibold text-slate-300 mb-2">Processed Document Source</p>
                <div className="aspect-[16/10] rounded-xl overflow-hidden bg-slate-950 border border-white/5">
                  <img src={imagePreview} alt="Processed snapshot" className="w-full h-full object-cover" />
                </div>
                <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl flex gap-2 items-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="text-xs text-emerald-200">
                    <span className="font-semibold">Successfully Decoded!</span> Detected format: <span className="font-semibold text-white">{scanResult.documentType}</span> issued by <span className="font-semibold">{scanResult.countryDetected}</span>.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Extracted Values Approval / Mapping */}
          <div className="flex flex-col border-t md:border-t-0 md:border-l border-white/5 pt-6 md:pt-0 md:pl-6 max-h-[70vh] md:max-h-none overflow-y-auto no-scrollbar">
            {!scanResult ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <FileText className="w-16 h-16 stroke-1 text-slate-500 mb-3" />
                <h3 className="font-display font-medium text-slate-300 text-base">Extraction Payload Pending</h3>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  Once your capture is analyzed, digitized vaccine records and medical visit timelines will appear here for verification.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">
                    1. Assign Extraction Results
                  </h3>
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col gap-3">
                    <label className="text-xs font-semibold text-slate-300">Import Target:</label>
                    <select
                      value={targetPetOption}
                      onChange={(e) => setTargetPetOption(e.target.value)}
                      className="w-full bg-slate-950/50 border border-white/15 text-slate-100 rounded-lg p-2.5 text-sm focus:outline-none focus:border-indigo-500 backdrop-blur-sm"
                    >
                      <option value="new" className="bg-slate-900 text-slate-100">🆕 Create a new pet profile with this data</option>
                      {pets.map((pet) => (
                        <option key={pet.id} value={pet.id} className="bg-slate-900 text-slate-100">
                          🐾 Merge directly into {pet.name} ({pet.breed})
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      {targetPetOption === 'new' 
                        ? 'Creating a new pet will automatically populate their breed, microchip transponder, birthdate, and historical log.'
                        : 'Merging will keep the existing pet profile but append any new vaccine stickers or veterinarian treatment notes.'}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    2. Verify Extracted Schema
                  </h3>
                  <div className="flex flex-col gap-4">
                    {/* Pet Profile Details */}
                    {scanResult.petDetails && (
                      <div className="border border-white/10 rounded-2xl overflow-hidden shadow-sm bg-white/5">
                        <div className="bg-white/5 border-b border-white/5 px-4 py-2.5 flex justify-between items-center">
                          <span className="text-xs font-semibold text-slate-200">🐾 Pet Core Details</span>
                          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono px-2 py-0.5 rounded-full uppercase">
                            {scanResult.petDetails.species || 'dog'}
                          </span>
                        </div>
                        <div className="p-4 grid grid-cols-2 gap-3.5 text-xs">
                          <div>
                            <span className="text-slate-400 block font-medium">Name:</span>
                            <span className="text-slate-200 font-semibold text-sm">{scanResult.petDetails.name || 'Unnamed'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-medium">Breed:</span>
                            <span className="text-slate-200 font-semibold">{scanResult.petDetails.breed || 'Unknown'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-medium">DOB:</span>
                            <span className="text-slate-200 font-mono">{scanResult.petDetails.dateOfBirth || 'Not stated'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-medium">Gender:</span>
                            <span className="text-slate-200 font-semibold">{scanResult.petDetails.gender || 'Unknown'}</span>
                          </div>
                          {scanResult.petDetails.microchipNumber && (
                            <div className="col-span-2 border-t border-white/5 pt-2.5">
                              <span className="text-slate-400 block font-medium">Microchip Transponder ID:</span>
                              <span className="text-slate-200 font-mono font-semibold">{scanResult.petDetails.microchipNumber}</span>
                            </div>
                          )}
                          {scanResult.petDetails.passportNumber && (
                            <div className="col-span-2">
                              <span className="text-slate-400 block font-medium">Passport Certificate Number:</span>
                              <span className="text-slate-200 font-mono font-semibold">{scanResult.petDetails.passportNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Extracted Vaccinations */}
                    {scanResult.vaccinationRecords && scanResult.vaccinationRecords.length > 0 && (
                      <div className="border border-white/10 rounded-2xl overflow-hidden shadow-sm bg-white/5">
                        <div className="bg-white/5 border-b border-white/5 px-4 py-2.5">
                          <span className="text-xs font-semibold text-slate-200 flex items-center gap-1">
                            💉 Extracted Vaccinations ({scanResult.vaccinationRecords.length})
                          </span>
                        </div>
                        <div className="divide-y divide-white/5 bg-transparent">
                          {scanResult.vaccinationRecords.map((vac: any, idx: number) => (
                            <div key={idx} className="p-3 text-xs hover:bg-white/5">
                              <div className="flex justify-between items-start">
                                <h4 className="font-semibold text-slate-100">{vac.vaccineName}</h4>
                                <span className="text-[10px] text-slate-400 font-mono">Booster {idx + 1}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-[11px] text-slate-400">
                                <div>Administered: <span className="text-slate-200 font-semibold">{vac.dateAdministered}</span></div>
                                <div>Due: <span className="text-indigo-300 font-semibold">{vac.dateDue || 'Check timeline'}</span></div>
                                {vac.batchNumber && <div className="col-span-2">Lot/Batch #: <span className="text-slate-300">{vac.batchNumber}</span></div>}
                                {vac.veterinarianName && <div className="col-span-2">Vet: <span className="text-slate-300 font-sans">{vac.veterinarianName}</span></div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Extracted Medical Visits */}
                    {scanResult.medicalVisits && scanResult.medicalVisits.length > 0 && (
                      <div className="border border-white/10 rounded-2xl overflow-hidden shadow-sm bg-white/5">
                        <div className="bg-white/5 border-b border-white/5 px-4 py-2.5">
                          <span className="text-xs font-semibold text-slate-200">
                            🩺 Clinical Examinations / Treatment Stamps
                          </span>
                        </div>
                        <div className="divide-y divide-white/5 bg-transparent">
                          {scanResult.medicalVisits.map((visit: any, idx: number) => (
                            <div key={idx} className="p-3 text-xs hover:bg-white/5">
                              <div className="flex justify-between items-center">
                                <span className="font-mono text-[10px] text-slate-400">{visit.date}</span>
                                <span className="bg-white/10 border border-white/10 text-slate-200 text-[9px] font-semibold px-2 py-0.5 rounded">
                                  {visit.purpose || 'Exam'}
                                </span>
                              </div>
                              <p className="text-slate-300 mt-1.5 leading-relaxed text-[11px]">
                                <span className="font-semibold text-slate-200">Findings:</span> {visit.findings}
                              </p>
                              {visit.treatment && (
                                <p className="text-emerald-200 mt-1 text-[11px] bg-emerald-500/10 border border-emerald-500/20 p-1 rounded">
                                  <span className="font-semibold text-emerald-300">Treatment:</span> {visit.treatment}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Approve Block */}
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col gap-3 mt-4">
                  <div className="flex gap-2.5 items-center">
                    <input 
                      type="checkbox" 
                      id="confirmCheck" 
                      defaultChecked 
                      className="rounded border-white/10 text-indigo-600 focus:ring-indigo-500 w-4 h-4 bg-slate-950/50" 
                    />
                    <label htmlFor="confirmCheck" className="text-xs text-slate-300 leading-normal">
                      I have verified the above veterinary timestamps and batch records match the scanned document.
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setScanResult(null);
                        setImagePreview(null);
                        if (activeTab === 'camera') startCamera();
                      }}
                      className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-xs py-3 rounded-xl font-semibold transition-colors"
                    >
                      Rescan / Discard
                    </button>
                    <button
                      onClick={handleApprove}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs py-3 rounded-xl font-semibold shadow-lg shadow-emerald-600/25 border border-emerald-500/30 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Save to Applet State
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
