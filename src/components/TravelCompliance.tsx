/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Pet, CountryRule } from '../types';
import { COUNTRY_RULES_DATABASE } from '../data';
import { Plane, CheckCircle2, AlertCircle, Info, Calendar, HelpCircle, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

interface TravelComplianceProps {
  pet: Pet;
}

export default function TravelCompliance({ pet }: TravelComplianceProps) {
  const [selectedCountryId, setSelectedCountryId] = useState<string>('jp');

  const selectedCountry = COUNTRY_RULES_DATABASE.find(c => c.id === selectedCountryId) || COUNTRY_RULES_DATABASE[0];

  // Helper logic to check compliance items
  const checkMicrochipCompliance = () => {
    if (!pet.microchipNumber) {
      return {
        status: 'fail' as const,
        message: 'No microchip transponder found on record.',
        action: 'Implant an ISO 11784/11785 compliant microchip before travel.'
      };
    }
    return {
      status: 'pass' as const,
      message: `Compliant microchip active: ${pet.microchipNumber}`,
      action: 'None required.'
    };
  };

  const checkRabiesCompliance = () => {
    const rabiesVaccine = pet.vaccinationRecords.find(v => 
      v.vaccineName.toLowerCase().includes('rabies') || 
      v.vaccineName.toLowerCase().includes('tollwut')
    );

    if (!rabiesVaccine) {
      return {
        status: 'fail' as const,
        message: 'No record of active Rabies vaccination.',
        action: `Requires a Rabies vaccine at least ${selectedCountry.rules.waitingPeriodDays} days before departure.`
      };
    }

    const administeredDate = new Date(rabiesVaccine.dateAdministered);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - administeredDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > selectedCountry.rules.rabiesVaccine.validityPeriodDays) {
      return {
        status: 'fail' as const,
        message: `Last Rabies vaccine was ${diffDays} days ago (expired).`,
        action: `Administer a new Rabies booster immediately.`
      };
    }

    // Checking wait period
    if (diffDays < selectedCountry.rules.waitingPeriodDays) {
      const remaining = selectedCountry.rules.waitingPeriodDays - diffDays;
      return {
        status: 'warning' as const,
        message: `Rabies vaccine administered ${diffDays} days ago. Waiting period not completed.`,
        action: `Must wait another ${remaining} days before boarding.`
      };
    }

    return {
      status: 'pass' as const,
      message: `Rabies vaccine is active and valid (${diffDays} days since administration).`,
      action: 'Valid.'
    };
  };

  const checkOtherVaccines = () => {
    const missing: string[] = [];
    selectedCountry.rules.otherVaccines.forEach(reqName => {
      const isFound = pet.vaccinationRecords.some(v => 
        v.vaccineName.toLowerCase().includes(reqName.toLowerCase().split(' ')[0])
      );
      if (!isFound) {
        missing.push(reqName);
      }
    });

    if (missing.length > 0) {
      return {
        status: 'warning' as const,
        message: `Missing recommended regional boosters: ${missing.join(', ')}`,
        action: 'Schedule boosters with your local vet clinic.'
      };
    }

    return {
      status: 'pass' as const,
      message: 'All regional specific vaccine recommendations met.',
      action: 'Compliant.'
    };
  };

  const microchipRes = checkMicrochipCompliance();
  const rabiesRes = checkRabiesCompliance();
  const otherRes = checkOtherVaccines();

  const overallPass = microchipRes.status === 'pass' && rabiesRes.status === 'pass';

  return (
    <div className="flex flex-col gap-4">
      {/* Select Country */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 p-3.5 rounded-2xl">
        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
          Destination Country
        </label>
        <div className="flex gap-2">
          <select
            value={selectedCountryId}
            onChange={(e) => setSelectedCountryId(e.target.value)}
            className="flex-1 bg-slate-950/50 border border-white/15 rounded-xl p-2.5 text-xs text-slate-100 font-medium focus:outline-none focus:border-indigo-500 backdrop-blur-sm"
          >
            {COUNTRY_RULES_DATABASE.map(c => (
              <option key={c.id} value={c.id} className="bg-slate-900 text-slate-100">
                {c.flag} {c.countryName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Compliance Header Card */}
      <div className={`p-4 rounded-2xl border flex items-start gap-3 transition-colors backdrop-blur-md ${
        overallPass 
          ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-200' 
          : 'bg-amber-500/10 border-amber-500/25 text-amber-200'
      }`}>
        <div className="mt-0.5">
          {overallPass ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
          )}
        </div>
        <div className="text-xs">
          <h4 className="font-semibold text-sm text-slate-100">
            {overallPass ? 'Travel Clear' : 'Attention Required'}
          </h4>
          <p className="opacity-90 mt-1 leading-normal text-slate-300">
            {overallPass 
              ? `${pet.name} matches primary entry guidelines for ${selectedCountry.countryName}! No mandatory long-term quarantine expected.`
              : `${pet.name} is missing critical certifications or waiting periods required to enter ${selectedCountry.countryName}.`}
          </p>
        </div>
      </div>

      {/* Checklist items */}
      <div className="flex flex-col gap-2">
        <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-wider px-1">
          Entry Requirement Checks
        </h4>

        {/* 1. Microchip */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex gap-3 backdrop-blur-md">
          <div className="mt-0.5">
            {microchipRes.status === 'pass' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
          </div>
          <div className="text-xs">
            <span className="font-semibold block text-slate-200">ISO Transponder Microchip</span>
            <p className="text-slate-400 text-[11px] mt-0.5">{microchipRes.message}</p>
            {microchipRes.status !== 'pass' && (
              <p className="text-rose-300 font-medium text-[11px] mt-1 bg-rose-500/10 border border-rose-500/20 p-1.5 rounded">
                💡 {microchipRes.action}
              </p>
            )}
          </div>
        </div>

        {/* 2. Rabies Vaccine */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex gap-3 backdrop-blur-md">
          <div className="mt-0.5">
            {rabiesRes.status === 'pass' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : rabiesRes.status === 'warning' ? (
              <AlertCircle className="w-4 h-4 text-amber-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
          </div>
          <div className="text-xs">
            <span className="font-semibold block text-slate-200">Rabies Immunization Status</span>
            <p className="text-slate-400 text-[11px] mt-0.5">{rabiesRes.message}</p>
            {rabiesRes.status !== 'pass' && (
              <p className="text-amber-300 font-medium text-[11px] mt-1 bg-amber-500/10 border border-amber-500/20 p-1.5 rounded">
                💡 {rabiesRes.action}
              </p>
            )}
          </div>
        </div>

        {/* 3. Other Regional vaccines */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex gap-3 backdrop-blur-md">
          <div className="mt-0.5">
            {otherRes.status === 'pass' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <Info className="w-4 h-4 text-amber-400" />
            )}
          </div>
          <div className="text-xs">
            <span className="font-semibold block text-slate-200">Region-Specific Boosters</span>
            <p className="text-slate-400 text-[11px] mt-0.5">{otherRes.message}</p>
            {otherRes.status !== 'pass' && (
              <p className="text-slate-300 text-[11px] mt-1 bg-white/5 border border-white/5 p-1.5 rounded">
                💡 {otherRes.action}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quarantine & Documents Block */}
      <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl flex flex-col gap-2.5 text-xs backdrop-blur-md">
        <div>
          <span className="font-semibold text-slate-200 block mb-0.5">🐕 Quarantine Policy:</span>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            {selectedCountry.rules.quarantineRequired 
              ? selectedCountry.rules.quarantineDetails 
              : 'Generally exempted if standard microchip, rabies titers, and vet endorsement forms are completely filled.'}
          </p>
        </div>

        <div className="border-t border-white/10 pt-2.5">
          <span className="font-semibold text-slate-200 block mb-1">📄 Required Documentation:</span>
          <div className="flex flex-wrap gap-1">
            {selectedCountry.rules.documentationRequired.map((doc, idx) => (
              <span key={idx} className="bg-white/10 border border-white/10 text-slate-300 text-[10px] px-2 py-0.5 rounded-md font-medium">
                {doc}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
