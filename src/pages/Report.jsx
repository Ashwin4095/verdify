import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const DonutChart = ({ data }) => {
  const total = data.reduce((acc, item) => acc + item.value, 0) || 1;
  let cumulativePercent = 0;

  return (
    <div className="relative w-[160px] h-[160px] shrink-0 mx-auto mb-8">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        {data.map((item, i) => {
          const percent = (item.value / total) * 100;
          const strokeDasharray = `${Math.max(percent, 0)} ${Math.max(100 - percent, 0)}`;
          const strokeDashoffset = -cumulativePercent;
          cumulativePercent += percent;
          
          return (
            <circle
              key={i}
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke={item.color}
              strokeWidth="12"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              pathLength="100"
              className="transition-all duration-1000 ease-out"
            />
          );
        })}
        <circle cx="50" cy="50" r="34" fill="#FFFFFF" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[10px] font-bold text-[#1A1A1A]/40 uppercase tracking-tighter">Total kg</span>
        <span className="text-xl font-black text-[#1A1A1A] leading-none">{Math.round(total).toLocaleString()}</span>
      </div>
    </div>
  );
};

export default function Report() {
  const location = useLocation();
  const navigate = useNavigate();
  const { results, eventId, formData } = location.state || {};

  useEffect(() => {
    if (!location.state) {
      navigate('/track');
    }
  }, [location, navigate]);

  if (!results || !formData) return null;

  const { score, tier, breakdown, travelDisclosure, recommendations } = results;
  const reductionPercent = Math.round(((8.5 - parseFloat(breakdown.intensity)) / 8.5) * 100);

  const breakdownData = [
    { label: 'Venue Energy', value: breakdown.venueEnergy, color: '#2E4036', code: 'energy' },
    { label: 'Catering', value: breakdown.catering, color: '#3D7A5E', code: 'catering' },
    { label: 'Materials & Waste', value: breakdown.materials, color: '#5BA07A', code: 'materials' },
    { label: 'Local Transport', value: breakdown.transport, color: '#B8E8CC', code: 'transport' }
  ];

  const sortedCategories = [...breakdownData].sort((a, b) => b.value - a.value);
  const top2 = sortedCategories.slice(0, 2);
  
  const getNarrative = (cat) => {
    const pct = Math.round((cat.value / breakdown.total) * 100);
    if (cat.code === 'catering') {
      const reductionNote = formData.mealType === 'Meat-heavy' ? 'switching to mixed menus would reduce this category by ~44%' : 'shifting to 100% vegetarian would reduce this by ~40%';
      return `Catering accounted for ${pct}% of your operational emissions. ${formData.mealType} menus generate high footprint per meal — ${reductionNote}.`;
    }
    if (cat.code === 'transport') {
      return `Local transport accounted for ${pct}% of emissions. Your venue's distance from public transport (${formData.distanceBts}) means most attendees rely on taxis or private cars.`;
    }
    if (cat.code === 'energy') {
      const renewNote = formData.renewable === 'No' ? 'Switching to partial renewable certificates would reduce this by 15%.' : 'You are mitigating some energy impact via renewables.';
      return `Venue Energy contributed ${pct}% to the total. ${renewNote}`;
    }
    if (cat.code === 'materials') {
      const tablewareNote = formData.tableware === 'Single-use plastic' ? 'Plastic tableware is a significant driver here.' : 'Materials impact is primarily from printed media and landfill waste.';
      return `Materials & Waste represents ${pct}% of impact. ${tablewareNote}`;
    }
    return '';
  };

  const InfoRow = ({ label, value }) => (
    <div className="flex justify-between items-center border-b border-[#E5E5E5] pt-[10px] pb-[10px]">
      <span className="text-[10px] font-mono text-[#1A1A1A]/50 pr-4">{label}</span>
      <span className="text-[13px] font-semibold text-[#1A1A1A] text-right">{value || '-'}</span>
    </div>
  );

  const StackedInfoRow = ({ label, value }) => (
    <div className="flex flex-col border-b border-[#E5E5E5] pt-[10px] pb-[10px] gap-1">
      <span className="text-[10px] font-mono text-[#1A1A1A]/50">{label}</span>
      <span className="text-[13px] font-semibold text-[#1A1A1A]">{value || '-'}</span>
    </div>
  );

  const SectionLabel = ({ title, color = "#2E4036" }) => (
    <div className="text-[10px] font-mono uppercase text-[#2E4036] mb-2 pl-2 border-l-2 font-bold tracking-widest mt-3" style={{ borderColor: color, color: color }}>
      {title}
    </div>
  );

  const ResultRow = ({ value }) => (
    <div className="flex justify-end pt-[6px] pb-[6px]">
      <span className="text-[13px] font-[600] text-[#2E4036]">→ Result: {value.toLocaleString()} kg CO2e</span>
    </div>
  );

  // Calculation strings for methodology
  const renewableAdjustmentApplied = formData.renewable === 'Yes - Fully' ? '-30%' : (formData.renewable === 'Yes - Partial' ? '-15%' : 'None');
  
  let sourcingAdjustment = 'None';
  if(formData.localSourced === '25-50%') sourcingAdjustment = '-5%';
  if(formData.localSourced === '50-75%') sourcingAdjustment = '-10%';
  if(formData.localSourced === 'Over 75%') sourcingAdjustment = '-15%';

  let foodWasteRef = '0.5 kg/meal';
  if(formData.mealType === 'Meat-heavy') foodWasteRef = '0.6 kg/meal';
  if(formData.mealType === 'Vegetarian') foodWasteRef = '0.4 kg/meal';
  if(formData.mealType === 'Vegan') foodWasteRef = '0.35 kg/meal';

  let compostReduction = 'None';
  if (formData.composted === 'Yes') compostReduction = '70%';
  if (formData.composted === 'Partial') compostReduction = '35%';

  let landfillRate = '60%';
  if(formData.landfill === 'None - all diverted') landfillRate = '0%';
  if(formData.landfill === 'Most') landfillRate = '90%';
  if(formData.landfill === 'Some') landfillRate = formData.wasteSorted ? '20%' : '60%';

  const shuttleReduction = formData.shuttle ? '40% applied' : 'Not applied';

  return (
    <div className="bg-[#F0F5F2] min-h-screen font-sans text-[#1A1A1A] text-[13px] leading-relaxed">
      <div className="h-[6px] w-full bg-[#2E4036] fixed top-0 left-0 z-[100] no-print" />
      
      <style>{`
        .print-only { display: none; }
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { margin: 0; background: white; }
          @page { margin: 0; size: A4 portrait; }
          .report-grid { display: grid !important; grid-template-columns: repeat(3, minmax(0, 1fr)) !important; gap: 0 !important; }
          .print-full-footer { background-color: #2E4036 !important; color: #F2F0E9 !important; }
          .report-header { page-break-after: avoid; }
          .report-columns { page-break-inside: avoid; }
          .divide-x > * { border-color: #E5E5E5 !important; }
        }
      `}</style>

      <div className="max-w-[1200px] mx-auto pt-0 px-0 pb-24 h-full flex flex-col">
        {/* HEADER */}
        <header className="report-header mb-8 w-full pt-6 px-12 pb-8">
          <div className="flex justify-between items-center mb-12">
             <div className="text-2xl font-black tracking-tighter text-[#2E4036] uppercase leading-none">Verdify.</div>
             <div className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/40">
                Event Sustainability Report
             </div>
          </div>
          
          <div className="mb-4">
             <h1 className="text-[48px] font-bold text-[#1A1A1A] leading-tight mb-1 tracking-tight">
                {formData.eventName || 'Unnamed Event'}
             </h1>
             <p className="text-[18px] font-serif italic text-[#1A1A1A]/50">
                {formData.eventDate ? new Date(formData.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Date Not Specified'}
             </p>
          </div>

          <div className="flex flex-wrap gap-4 mb-4">
             {[
                { label: 'Attendees', val: formData.actualAttendees || 0 },
                { label: 'Days', val: formData.duration || 1 },
                { label: 'Total kg CO2e', val: breakdown.total.toLocaleString() },
                { label: 'Score', val: `${score}/100` }
             ].map((stat, i) => (
                <div key={i} className="bg-[#FFFFFF] px-4 py-2 rounded-lg border-2 border-[#2E4036] flex gap-3 items-center">
                   <span className="text-[10px] font-mono text-[#1A1A1A]/50 uppercase tracking-widest">{stat.label}</span>
                   <span className="text-[14px] font-bold text-[#1A1A1A]">{stat.val}</span>
                </div>
             ))}
          </div>
          
          <div className="h-px w-full bg-[#E5E5E5] w-full" />
        </header>

        {/* THREE COLUMNS */}
        <div className="bg-[#FFFFFF] rounded-[12px] shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-[32px] mx-[48px] mb-[48px]">
          <div className="report-grid grid grid-cols-1 lg:grid-cols-3 gap-0 lg:divide-x divide-[#E5E5E5] report-columns flex-grow">
          
          {/* LEFT COLUMN: INPUTS */}
          <div className="lg:pr-8 py-4 flex flex-col">
            <h3 className="text-[14px] font-mono font-bold tracking-widest text-[#2E4036] uppercase mb-4">Submitted Data</h3>
            
            <div className="flex flex-col gap-0">
              {/* BASICS */}
              <SectionLabel title="Event Basics" />
              <InfoRow label="Event Name" value={formData.eventName} />
              <InfoRow label="Event Type" value={formData.eventType} />
              <InfoRow label="Venue" value={formData.venueName} />
              <InfoRow label="Venue Type" value={formData.venueType} />
              <InfoRow label="Location" value={formData.venueLocation} />
              <InfoRow label="Setting" value={formData.setting} />
              <InfoRow label="Hours/day" value={formData.hoursPerDay} />
              <InfoRow label="Attendees" value={formData.actualAttendees} />

              {/* ENERGY */}
              <SectionLabel title="Scope 2 · Energy" />
              <StackedInfoRow label="Estimation method" value={formData.hasKwh ? "Actual kWh" : `Area-based intensity model (${formData.venueSize}sqm)`} />
              <StackedInfoRow label="Emission factor" value="TGO 2023 Thailand grid average" />
              <InfoRow label="Renewable adj." value={renewableAdjustmentApplied} />
              <InfoRow label="Generator" value={formData.generators ? `Yes (${formData.diesel}L)` : "No"} />
              <ResultRow value={breakdown.venueEnergy} />

              {/* CATERING */}
              <SectionLabel title="Scope 3 · Cat 1" />
              <StackedInfoRow label="Emission factors" value="IPCC lifecycle assessment averages" />
              <InfoRow label="Sourcing adj." value={sourcingAdjustment} />
              <StackedInfoRow label="Food waste factor" value={`${formData.mealType} → ${foodWasteRef}`} />
              <InfoRow label="Composting red." value={compostReduction} />
              <ResultRow value={breakdown.catering} />

              {/* MATERIALS */}
              <SectionLabel title="Scope 3 · Cat 5" />
              <StackedInfoRow label="Tableware factor" value={`${formData.tableware} — IPCC product LCA`} />
              <StackedInfoRow label="Waste intensity" value={`${formData.eventType} event profile`} />
              <InfoRow label="Landfill applied" value={landfillRate} />
              <ResultRow value={breakdown.materials} />

              {/* TRANSPORT */}
              <SectionLabel title="Scope 3 · Cat 6 Local" />
              <StackedInfoRow label="Distance model" value={`BTS proximity — ${formData.distanceBts}`} />
              <StackedInfoRow label="Emission factors" value="Thai Dept of Land Transport" />
              <StackedInfoRow label="Mode split applied" value={`${formData.transportPublic}% pub / ${formData.transportPrivate}% car / ${formData.transportTaxi}% taxi`} />
              <InfoRow label="Shuttle reduction" value={shuttleReduction} />
              <ResultRow value={breakdown.transport} />

              {/* TRAVEL DISCLOSURE */}
              <SectionLabel title="Scope 3 · Cat 6 Disclosure" color="#2E4036" />
              <InfoRow label="Int'l Attendees" value={formData.intlCount || "0"} />
              {formData.origins?.length > 0 && <InfoRow label="Origins" value={formData.origins.join(', ')} />}
              <InfoRow label="Survey Response" value={formData.surveySent ? `${formData.surveyRate}%` : "No survey"} />
              <div className="flex justify-end pt-[6px] pb-[6px]">
                {travelDisclosure.total !== null ? (
                  <span className="text-[13px] font-bold text-[#D4622A] italic">→ Disclosed: {travelDisclosure.total.toLocaleString()} kg CO2e (not in score)</span>
                ) : (
                  <span className="text-[13px] font-bold text-[#1A1A1A]/40 italic">Not captured</span>
                )}
              </div>
            </div>
          </div>

          {/* MIDDLE COLUMN: SCORE & ANALYSIS */}
          <div className="lg:px-8 py-4 flex flex-col pt-12 lg:pt-4 border-t lg:border-t-0 border-[#E5E5E5] mt-8 lg:mt-0">
            <h3 className="text-[14px] font-mono font-bold tracking-widest text-[#2E4036] uppercase mb-8">Sustainability Score</h3>
            
            <div className="flex flex-col items-center mb-10">
              <div className="font-serif text-[80px] font-bold leading-none text-[#2E4036] mb-2">{score}</div>
              <div className="text-[14px] font-mono uppercase font-bold tracking-widest mb-8" style={{ color: score >= 85 ? '#2E4036' : score >= 70 ? '#3D7A5E' : score >= 50 ? '#D4622A' : '#DC2626' }}>
                 {tier.label}
              </div>

              {/* GAUGE */}
              <div className="w-full relative px-2 mb-8">
                 <div className="h-2.5 w-full flex rounded-full overflow-hidden mb-3 bg-[#E5E5E5]">
                    <div className="h-full bg-[#DC2626] w-[49%]" />
                    <div className="h-full bg-[#D4622A] w-[20%]" />
                    <div className="h-full bg-[#2E4036] w-[31%]" />
                 </div>
                 <div className="absolute top-[-4px] transition-all duration-1000 ease-out" style={{ left: `calc(${score}% - 6px)` }}>
                    <div className="w-3 h-3 bg-[#1A1A1A] rotate-45 transform origin-center shadow-sm" />
                 </div>
                 <div className="flex justify-between text-[9px] font-mono text-[#1A1A1A]/40 uppercase tracking-widest px-1">
                    <span>Critical</span>
                    <span>Standard</span>
                    <span>Leading</span>
                 </div>
              </div>

              {/* BENCHMARK BOX */}
              <div className="w-full bg-[#F9F9F9] border border-[#E5E5E5] rounded-xl p-4 text-center">
                 <p className="text-[13px] font-bold text-[#1A1A1A]">
                   {reductionPercent > 0 ? `${reductionPercent}% lower` : `${Math.abs(reductionPercent)}% higher`} than Bangkok corporate benchmark
                 </p>
                 <p className="text-[11px] text-[#1A1A1A]/60 mt-1">8.5 kg CO2e per person per day</p>
              </div>
            </div>

            {/* SCORE NARRATIVE */}
            <div className="mb-10 pl-4 border-l-2 border-[#2E4036]">
               <h4 className="text-[10px] font-mono font-bold text-[#2E4036] uppercase tracking-widest mb-3">What Drove Your Score</h4>
               <div className="space-y-3 text-[12px] text-[#1A1A1A] leading-relaxed">
                  {top2.map((cat, i) => <p key={i}>{getNarrative(cat)}</p>)}
               </div>
            </div>

            <div className="h-px w-full bg-[#E5E5E5] mb-10" />

            {/* OPERATIONAL BREAKDOWN */}
            <div>
               <h4 className="text-[14px] font-bold text-[#1A1A1A] mb-1">Operational Breakdown</h4>
               <p className="text-[11px] text-[#1A1A1A]/50 mb-8 uppercase tracking-widest font-mono">Scope 2 & 3 Operational Metrics</p>
               
               <DonutChart data={breakdownData} />

               <div className="w-full mb-6">
                  {breakdownData.map((item, i) => {
                     const pct = Math.round((item.value / breakdown.total) * 100) || 0;
                     return (
                        <div key={i} className="flex justify-between items-center py-2.5 border-b border-[#E5E5E5] last:border-0">
                           <div className="flex items-center gap-2 w-1/3">
                              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                              <span className="text-[11px] font-bold uppercase tracking-tight truncate">{item.label}</span>
                           </div>
                           <div className="w-1/3 px-2">
                              <div className="h-1.5 w-full bg-[#F2F0E9] rounded-full overflow-hidden">
                                 <div className="h-full" style={{ backgroundColor: item.color, width: `${pct}%` }} />
                              </div>
                           </div>
                           <div className="w-1/3 text-right">
                              <span className="text-[11px] font-mono text-[#1A1A1A]/40 mr-2">{pct}%</span>
                              <span className="text-[12px] font-mono font-bold text-[#1A1A1A]">{item.value.toLocaleString()} kg</span>
                           </div>
                        </div>
                     );
                  })}
               </div>
               
               <div className="flex justify-between items-center py-3 border-t-2 border-[#1A1A1A] mb-10">
                  <span className="text-[12px] font-bold uppercase">Total Scope 2 & 3 Op</span>
                  <span className="text-[14px] font-mono font-black">{breakdown.total.toLocaleString()} kg CO2e</span>
               </div>

               {/* MINI TRAVEL SECTION */}
               <div className="pl-4 border-l-2 border-[#D4622A] bg-[#F9F9F9] p-4 rounded-r-lg border-y border-r border-[#E5E5E5]">
                  <h4 className="text-[10px] font-mono font-bold text-[#D4622A] uppercase tracking-widest mb-1.5">Long-haul Travel</h4>
                  {travelDisclosure.total !== null ? (
                    <p className="text-[12px] font-bold text-[#1A1A1A] leading-snug">
                       {travelDisclosure.total.toLocaleString()} kg CO2e disclosed, not scored.
                    </p>
                  ) : (
                    <p className="text-[12px] font-medium text-[#1A1A1A]/60 italic">Not captured for this event.</p>
                  )}
               </div>
            </div>
          </div>

          {/* RIGHT COLUMN: OUTPUT & ACTIONS */}
          <div className="lg:pl-8 py-4 flex flex-col pt-12 lg:pt-4 border-t lg:border-t-0 border-[#E5E5E5] mt-8 lg:mt-0">
            <h3 className="text-[14px] font-mono font-bold tracking-widest text-[#2E4036] uppercase mb-8">Recommendations</h3>
            
            <div className="flex flex-col gap-6 mb-12">
               {recommendations.length > 0 ? (
                  recommendations.map((rec, i) => (
                     <div key={i} className="flex gap-4">
                        <div className="w-6 h-6 rounded-full bg-[#2E4036] text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                           {i + 1}
                        </div>
                        <div className="flex flex-col gap-1.5 w-full">
                           <p className="text-[13px] font-bold text-[#1A1A1A] leading-snug">
                              {typeof rec === 'string' ? rec : rec.text}
                           </p>
                           {typeof rec === 'object' && rec.impact && (
                              <p className="text-[10px] font-mono text-[#D4622A] uppercase tracking-tight">{rec.impact}</p>
                           )}
                           {typeof rec === 'object' && rec.action && (
                              <p className="text-[11px] text-[#1A1A1A]/50 italic pl-2 border-l-2 border-[#2E4036] mt-1 pr-2">
                                 {rec.action}
                              </p>
                           )}
                        </div>
                     </div>
                  ))
               ) : (
                  <div className="text-[13px] text-[#1A1A1A]/70 leading-relaxed bg-[#F9F9F9] p-4 rounded-lg border border-[#E5E5E5]">
                     Operational score is strong. Capture travel survey data to complete your Scope 3 picture.
                  </div>
               )}
            </div>

            {/* NEXT STEPS */}
            <div className="mb-10">
               <h3 className="text-[14px] font-mono font-bold tracking-widest text-[#1A1A1A] uppercase mb-4">Next Steps</h3>
               <div className="flex flex-col gap-3 text-[12px] text-[#2E4036]">
                 <div className="flex items-start gap-2">
                    <span className="mt-0.5 text-[14px] leading-none">□</span>
                    <span>Submit this report to your CSR / sustainability team</span>
                 </div>
                 <div className="flex items-start gap-2">
                    <span className="mt-0.5 text-[14px] leading-none">□</span>
                    <span>Share your Verdify Event ID with your venue partner</span>
                 </div>
                 <div className="flex items-start gap-2">
                    <span className="mt-0.5 text-[14px] leading-none">□</span>
                    <span>Schedule your next event tracking session</span>
                 </div>
               </div>
            </div>

            <div className="h-px w-full bg-[#E5E5E5] mb-10" />

            {/* DATA QUALITY */}
            <div className="mb-12">
               <h3 className="text-[14px] font-mono font-bold tracking-widest text-[#1A1A1A] uppercase mb-6">Data Quality</h3>
               <div className="flex flex-col">
                  {[
                   { s: 'Venue Energy', q: formData.hasKwh ? 'Measured' : 'Estimated', bg: formData.hasKwh ? '#DCFCE7' : '#E5E5E5', text: formData.hasKwh ? '#166534' : '#1A1A1A' },
                   { s: 'Catering', q: 'Mixed', bg: '#FEF08A', text: '#854D0E' },
                   { s: 'Materials', q: 'Estimated', bg: '#E5E5E5', text: '#52525B' },
                   { s: 'Local Transit', q: 'Estimated', bg: '#E5E5E5', text: '#52525B' },
                   { 
                     s: 'Int\'l Travel', 
                     q: formData.surveySent && formData.surveyRate > 0 ? 'Extrapolated' : formData.intlPresent ? 'Estimated' : 'N/A', 
                     bg: formData.surveySent && formData.surveyRate > 0 ? '#DBEAFE' : formData.intlPresent ? '#E5E5E5' : '#F4F4F5',
                     text: formData.surveySent && formData.surveyRate > 0 ? '#1E40AF' : formData.intlPresent ? '#52525B' : '#A1A1AA'
                   }
                 ].map((row, i) => (
                    <div key={i} className="flex justify-between items-center py-2.5 border-b border-[#E5E5E5] last:border-0">
                       <span className="text-[12px] font-semibold text-[#1A1A1A]">{row.s}</span>
                       <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-1 rounded" style={{ backgroundColor: row.bg, color: row.text }}>
                          {row.q}
                       </span>
                    </div>
                 ))}
               </div>
            </div>

            <div className="h-px w-full bg-[#E5E5E5] mb-8" />

            {/* METHODOLOGY */}
            <div>
               <h3 className="text-[14px] font-mono font-bold tracking-widest text-[#1A1A1A] uppercase mb-4">Methodology & Sources</h3>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <h4 className="text-[10px] uppercase font-bold text-[#1A1A1A]/50 tracking-widest mb-3">Key Factors</h4>
                   <div className="text-[11px] text-[#1A1A1A]/60 space-y-2">
                     <p>• Thai grid factor: 0.5213 kg/kWh (TGO 2023)</p>
                     <p>• Meal factors: IPCC lifecycle averages</p>
                     <p>• Aviation: radiative forcing multiplier 1.9×</p>
                     <p>• Benchmark: 8.5 kg CO2e/pax/day (TCEB)</p>
                   </div>
                 </div>
                 <div>
                   <h4 className="text-[10px] uppercase font-bold text-[#1A1A1A]/50 tracking-widest mb-3">Disclosure Alignment</h4>
                   <div className="grid grid-cols-2 gap-2">
                      {['IFRS S2', 'GRI 305', 'SEC 56-1', 'SET ESG'].map(badge => (
                        <div key={badge} className="bg-[#F2F0E9] border border-[#2E4036] rounded px-1.5 py-1 text-[9px] font-mono text-[#2E4036] text-center tracking-[0.1em] whitespace-nowrap">
                           {badge}
                        </div>
                      ))}
                   </div>
                 </div>
               </div>
            </div>

            {/* REPORT FOOTER */}
            <div className="mt-auto pt-16">
              <div className="h-px w-full bg-[#E5E5E5] mb-4" />
              <div className="flex flex-col gap-4">
                <div className="inline-flex items-center gap-[6px] bg-[#2E4036] text-[#F2F0E9] px-[14px] py-[6px] rounded-full text-[10px] font-mono font-bold uppercase tracking-[2px] w-fit">
                   ✦ TRACKED BY VERDIFY · verdify.com
                </div>
                <div className="text-[10px] font-mono text-[#1A1A1A]/50 space-y-1">
                  <p>Event ID: {eventId ? String(eventId).substring(0,8) : 'DRAFT'}</p>
                  <p>Generated: {new Date().toLocaleDateString('en-GB')}</p>
                  <p>Verdify V1.0</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
        
        <div className="no-print bg-[#E8F0EC] border border-[#C8DDD2] rounded-[6px] py-[10px] px-[16px] mx-[48px] mb-[48px] text-[11px] text-[#4A7A5C] font-sans">
          ⚠ This report is generated from organiser-provided data and estimated emission factors. Verdify does not independently verify input data. Figures are indicative and intended for internal sustainability tracking and disclosure preparation. For audited ESG reporting, engage a certified third-party verifier.
        </div>
      </div>

      {/* GLOBAL FOOTER */}
      <footer className="w-full bg-[#2E4036] text-[#F2F0E9] py-12 px-12 print-full-footer no-print print:mt-12">
         <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-[13px] font-mono uppercase tracking-widest opacity-80 text-center md:text-left">
               Verdify. — Sustainability Intelligence
            </div>
            
            <div className="flex gap-4 no-print">
               <button onClick={() => window.open(`/print?id=${eventId}`, '_blank')} className="px-5 py-2.5 bg-transparent border border-[#F2F0E9] text-[#F2F0E9] rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-[#F2F0E9] hover:text-[#2E4036] transition-colors">
                  Download PDF
               </button>
               <Link to="/track" className="px-5 py-2.5 bg-transparent border border-[#F2F0E9] text-[#F2F0E9] rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-[#F2F0E9] hover:text-[#2E4036] transition-colors">
                  Track Another Event
               </Link>
            </div>
         </div>
      </footer>

      {/* PRINT ONLY FOOTER WATERMARK */}
      <div className="print-only text-[9px] text-[#888888] text-center border-t border-[#EEEEEE] pt-2 mt-6 pb-4 w-full">
        Generated by Verdify Sustainability Intelligence · verdify.com · Event ID: {eventId ? String(eventId).substring(0,8) : 'DRAFT'}
      </div>
    </div>
  );
}
