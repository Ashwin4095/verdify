import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function PrintReport() {
   const [searchParams] = useSearchParams();
   const eventId = searchParams.get('id');
   const [data, setData] = useState(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      async function fetchEvent() {
         if (!eventId) return;

         const { data: eventData, error } = await supabase
            .from('events')
            .select('*')
            .eq('id', eventId)
            .single();

         if (eventData) {
            setData(eventData);
         }
         setLoading(false);
      }
      fetchEvent();
   }, [eventId]);

   useEffect(() => {
      if (data && !loading) {
         const timer = setTimeout(() => {
            window.print();
         }, 800);
         return () => clearTimeout(timer);
      }
   }, [data, loading]);

   if (loading || !data) {
      return (
         <div className="min-h-screen bg-white flex items-center justify-center font-sans text-sm text-[#1A1A1A]">
            Preparing your report...
         </div>
      );
   }

   const getTierColor = (tierLabel) => {
      if (!tierLabel) return '#2E4036'
      const t = tierLabel.toLowerCase()
      if (t.includes('leading')) return '#2E4036'
      if (t.includes('well')) return '#3D7A5E'
      if (t.includes('industry') || t.includes('average')) return '#D4622A'
      if (t.includes('high') || t.includes('impact') || t.includes('critical')) return '#DC2626'
      return '#2E4036'
   }

   const getVal = (val) => (val !== undefined && val !== null && val !== '') ? val : <span className="text-[#888888] italic">Not recorded</span>;

   const { score, tier, breakdown, recommendations, intensity } = data;
   const formData = data.form_data;

   const reductionPercent = Math.round(((8.5 - parseFloat(intensity)) / 8.5) * 100);

   const breakdownData = [
      { label: 'Venue Energy', value: breakdown.venueEnergy, color: '#2E4036', code: 'energy' },
      { label: 'Catering', value: breakdown.catering, color: '#3D7A5E', code: 'catering' },
      { label: 'Materials & Waste', value: breakdown.materials, color: '#5BA07A', code: 'materials' },
      { label: 'Local Transport', value: breakdown.transport, color: '#B8E8CC', code: 'transport', border: '1px solid #5BA07A' }
   ];

   const travelDisclosure = data.travel_disclosure || { total: null };

   const renewableAdjustmentApplied = formData.renewable === 'Yes - Fully' ? '-30%' : (formData.renewable === 'Yes - Partial' ? '-15%' : 'None');

   let sourcingAdjustment = 'None';
   if (formData.localSourced === '25-50%') sourcingAdjustment = '-5%';
   if (formData.localSourced === '50-75%') sourcingAdjustment = '-10%';
   if (formData.localSourced === 'Over 75%') sourcingAdjustment = '-15%';

   const mealsPerDayRaw = formData.mealsPerDay || formData.meals_per_day || formData.mealsPerAttendee;
   const printedMaterialsRaw = formData.printedMaterials || formData.printed_materials || formData.printMaterials;

   let foodWasteRef = '0.5 kg/meal';
   if (formData.mealType === 'Meat-heavy') foodWasteRef = '0.6 kg/meal';
   if (formData.mealType === 'Vegetarian') foodWasteRef = '0.4 kg/meal';
   if (formData.mealType === 'Vegan') foodWasteRef = '0.35 kg/meal';

   let compostReduction = 'None';
   if (formData.composted === 'Yes') compostReduction = '70%';
   if (formData.composted === 'Partial') compostReduction = '35%';

   let landfillRate = '60%';
   if (formData.landfill === 'None - all diverted') landfillRate = '0%';
   if (formData.landfill === 'Most') landfillRate = '90%';
   if (formData.landfill === 'Some') landfillRate = formData.wasteSorted ? '20%' : '60%';

   const shuttleReduction = formData.shuttle ? '40% applied' : 'Not applied';

   return (
      <div className="bg-[#FFFFFF] font-sans text-[#1A1A1A] text-[13px] leading-relaxed relative" style={{ minHeight: 'unset' }}>
         <style>{`
        @media print {
          @page {
            size: A4;
            margin: 16mm;
            @bottom-right {
              content: "Page " counter(page) " of " counter(pages);
              font-size: 8pt;
              color: #888888;
              font-family: monospace;
            }
          }
          @page :first {
            margin-top: 0;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            background: white !important;
          }
          html, body {
            height: auto !important;
            min-height: unset !important;
          }
          .page-break {
            page-break-before: always;
          }
          .no-break {
            page-break-inside: avoid;
          }
          #root, body, html {
            min-height: 0 !important;
            height: auto !important;
            background: white !important;
          }
          .min-h-screen {
            min-height: 0 !important;
          }
          .print-toolbar {
            display: none !important;
          }
          .cover-page {
            page-break-after: always;
            min-height: 100vh;
          }
        }
      `}</style>

         {/* SCREEN-ONLY TOOLBAR */}
         <div className="print-toolbar" style={{ backgroundColor: '#2E4036', padding: '10px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-white text-[12px]">Print Preview — {formData.eventName || 'Event'}</span>
            <button onClick={() => window.print()} className="bg-[#F2F0E9] text-[#2E4036] rounded-full px-[16px] py-[6px] font-mono font-bold text-[11px]">
               Print / Save as PDF
            </button>
         </div>

         {/* ----------------- COVER PAGE (PAGE 1) ----------------- */}
         <div className="cover-page max-w-[720px] mx-auto bg-white shadow-[0_2px_20px_rgba(0,0,0,0.08)] print:shadow-none px-[48px] py-[32px] print:px-0 print:py-0 print:mx-auto print:max-w-none flex flex-col" style={{ minHeight: '100vh' }}>
            
            {/* TOP BAR */}
            <div className="w-full h-[8px] bg-[#2E4036] m-0 p-0" />
            
            {/* DOCUMENT HEADER ROW */}
            <div className="flex justify-between items-end py-[16px] border-b border-[#E0E0E0]">
               <div className="text-[14px] font-mono font-bold text-[#2E4036]">VERDIFY.</div>
               <div className="text-[10px] font-mono text-[#888888] uppercase">EVENT SUSTAINABILITY REPORT</div>
            </div>

            {/* EVENT IDENTITY */}
            <div className="mt-[48px]">
               <h1 className="text-[48px] font-bold text-[#1A1A1A] font-sans leading-tight mb-1">{formData.eventName || 'Unnamed Event'}</h1>
               <p className="text-[14px] font-serif italic text-[#888888] mt-[4px]">
                  {formData.eventDate ? new Date(formData.eventDate).toLocaleDateString('en-GB') : 'Date Not Specified'}
               </p>
            </div>

            <div className="flex gap-2 mt-[24px]">
               {[
                  { label: 'ATTENDEES', val: formData.actualAttendees || 0 },
                  { label: 'DAYS', val: formData.duration || 1 },
                  { label: 'TOTAL', val: `${breakdown.total?.toLocaleString() || 0} kg CO2e` },
                  { label: 'SCORE', val: `${score}/100` }
               ].map((stat, i) => (
                  <div key={i} className="rounded-full border-[1.5px] border-[#2E4036] px-[16px] py-[6px] flex items-center gap-1.5 bg-white">
                     <span className="text-[10px] font-mono font-bold text-[#2E4036] uppercase">{stat.label}</span>
                     <span className="text-[10px] font-mono font-bold text-[#2E4036]">{stat.val}</span>
                  </div>
               ))}
            </div>

            {/* DIVIDER */}
            <div className="w-full border-t border-[#E0E0E0] my-[32px] print:my-[24px]" />

            {/* SCORE BLOCK */}
            <div className="flex flex-col items-center mt-[40px]">
               <div className="font-serif text-[96px] font-black leading-none text-[#2E4036] tracking-[-2px]">{score}</div>
               <div className="text-[12px] font-mono uppercase tracking-[3px] mt-[8px]" style={{ color: getTierColor(tier) }}>
                  {tier}
               </div>

               <div className="w-full max-w-[400px] relative mt-[24px]">
                  <div className="h-[8px] w-full flex rounded-[4px] overflow-hidden">
                     <div className="h-full bg-[#DC2626] w-[49%]" />
                     <div className="h-full bg-[#D4622A] w-[20%]" />
                     <div className="h-full bg-[#2E4036] w-[31%]" />
                  </div>
                  <div className="absolute top-[-2px] transition-all" style={{ left: `calc(${score}% - 6px)` }}>
                     <div className="w-[12px] h-[12px] bg-[#1A1A1A] rotate-45 transform origin-center" />
                  </div>
                  <div className="flex justify-between w-full text-[9px] font-mono text-[#AAAAAA] uppercase mt-2">
                     <span className="w-1/3 text-left">CRITICAL</span>
                     <span className="w-1/3 text-center">STANDARD</span>
                     <span className="w-1/3 text-right">LEADING</span>
                  </div>
               </div>

               {/* BENCHMARK BOX */}
               <div className="bg-[#F0F5F2] rounded-[8px] px-[24px] py-[14px] text-center w-full max-w-[400px] mt-[24px]">
                  <p className="text-[14px] font-bold text-[#1A1A1A]">
                     {reductionPercent > 0 ? `${reductionPercent}% below` : `${Math.abs(reductionPercent)}% above`} Bangkok corporate event benchmark
                  </p>
                  <p className="text-[11px] text-[#888888] mt-[4px]">8.5 kg CO2e per person per day</p>
               </div>

               {/* DYNAMIC INSIGHT SUMMARY */}
               <div className="mt-[40px] max-w-[500px] text-center">
                  <p className="text-[13px] leading-relaxed text-[#555555]">
                     This event achieved a sustainability score of <span className="font-bold text-[#2E4036]">{score}/100</span>, driven by low operational emissions (<span className="font-bold text-[#2E4036]">{breakdown.total?.toLocaleString()} kg CO2e</span>), efficient resource usage, and strong catering and transport decisions.
                  </p>
               </div>
            </div>

            {/* SPACER */}
            <div className="flex-grow" />

            {/* BRANDING BOTTOM */}
            <div className="w-full border-t border-[#E0E0E0] pt-[16px] flex justify-between items-end mt-[48px] mb-[32px] print:mb-0">
               <div className="bg-[#2E4036] text-[#F2F0E9] px-[12px] py-[4px] rounded-full font-mono font-bold text-[8px] uppercase">
                  ✦ TRACKED BY VERDIFY · verdify.com
               </div>
               <div className="flex flex-col text-right">
                  <div className="text-[9px] font-mono text-[#888888]">Event ID: {eventId ? String(eventId).substring(0, 8) : 'DRAFT'}</div>
                  <div className="text-[9px] font-mono text-[#888888]">Generated: {new Date().toLocaleDateString('en-GB')}</div>
               </div>
            </div>
         </div>

         {/* ----------------- PAGE 2 ONWARDS (REMAINING CONTENT) ----------------- */}
         <div className="max-w-[720px] mx-auto pt-[48px] print:pt-0 print:mx-0 print:max-w-none bg-white px-[48px] py-[32px] shadow-[0_2px_20px_rgba(0,0,0,0.08)] print:shadow-none print:px-0 mt-[24px] print:mt-0">
            
            {/* SECTION 5 - EMISSIONS BREAKDOWN */}
            <div className="mb-10" style={{ pageBreakBefore: 'always' }}>
               <h2 className="text-[16px] font-bold text-[#2E4036] mb-0.5">Operational Emissions Breakdown</h2>
               <p className="text-[10px] font-mono text-[#888888] uppercase tracking-widest mb-6">Scope 2 & 3 Operational Metrics</p>

               <div className="flex flex-col gap-4">
                  {breakdownData.map((item, i) => {
                     const pct = Math.round((item.value / breakdown.total) * 100) || 0;
                     return (
                        <div key={i} className="flex items-center gap-4 w-full">
                           <div className="w-2.5 h-2.5 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: item.color, border: item.border || 'none' }} />
                           <div className="w-[140px] text-[11px] font-bold uppercase tracking-tight shrink-0 text-[#1A1A1A]">{item.label}</div>
                           <div className="flex-grow">
                              <div className="h-[6px] w-full bg-[#E8E8E8] rounded-full overflow-hidden">
                                 <div className="h-full rounded-full" style={{ backgroundColor: item.color, width: `${pct}%` }} />
                              </div>
                           </div>
                           <div className="w-[40px] text-right text-[11px] font-mono text-[#888888]">{pct}%</div>
                           <div className="w-[80px] text-right text-[11px] font-bold">{item.value.toLocaleString()} kg</div>
                        </div>
                     );
                  })}
               </div>

               <div className="w-full border-t border-[#E0E0E0] my-4" />
               <div className="flex justify-between items-center text-[#1A1A1A]">
                  <span className="font-mono font-bold uppercase text-[12px]">TOTAL OPERATIONAL EMISSIONS</span>
                  <span className="font-bold text-[14px]">{breakdown.total.toLocaleString()} kg CO2e</span>
               </div>
            </div>

            {/* SECTION 6 - SUBMITTED DATA SUMMARY */}
            <div className="mb-10">
               <h2 className="text-[16px] font-bold text-[#2E4036] mb-0.5">Event Data Summary</h2>
               <p className="text-[10px] font-mono text-[#888888] uppercase tracking-widest mb-6">Input data used to calculate this report</p>

               <div className="grid grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="flex flex-col gap-6">
                     {/* ENERGY */}
                     <div className="">
                        <div className="text-[9px] font-mono uppercase text-[#2E4036] mb-[8px] pl-1.5 border-l-[2px] border-[#2E4036] font-bold tracking-widest">
                           Energy (Scope 2)
                        </div>
                        {[
                           { l: 'Estimation method', v: getVal(formData.hasKwh ? "Actual kWh" : (formData.venueSize ? `Intensity model (${formData.venueSize}sqm)` : null)) },
                           { l: 'Emission factor', v: getVal("TGO 2023 grid avg") },
                           { l: 'Renewable adj.', v: getVal(renewableAdjustmentApplied) },
                           { l: 'Generator', v: getVal(formData.generators ? `Yes (${formData.diesel}L)` : "No") },
                        ].map((row, i) => (
                           <div key={i} className="flex justify-between py-[5px] border-b border-[#E0E0E0]">
                              <span className="text-[10px] font-mono text-[#888888]">{row.l}</span>
                              <span className="text-[11px] font-semibold text-[#1A1A1A]">{row.v}</span>
                           </div>
                        ))}
                        <div className="flex justify-between py-[5px] mt-1">
                           <span className="text-[10px] font-mono text-[#888888]"></span>
                           <span className="text-[11px] font-bold text-[#2E4036]">→ Result: {breakdown.venueEnergy.toLocaleString()} kg CO2e</span>
                        </div>
                     </div>

                     {/* CATERING */}
                     <div className="">
                        <div className="text-[9px] font-mono uppercase text-[#2E4036] mb-[8px] pl-1.5 border-l-[2px] border-[#2E4036] font-bold tracking-widest">
                           Catering (Scope 3 · Cat 1)
                        </div>
                        {[
                           { l: 'Meal type', v: getVal(formData.mealType) },
                           { l: 'Meals/day', v: getVal(mealsPerDayRaw) },
                           { l: 'Local sourcing', v: getVal(formData.localSourced) },
                           { l: 'Food waste', v: getVal(foodWasteRef) },
                           { l: 'Composting', v: getVal(formData.composted) },
                        ].map((row, i) => (
                           <div key={i} className="flex justify-between py-[5px] border-b border-[#E0E0E0]">
                              <span className="text-[10px] font-mono text-[#888888]">{row.l}</span>
                              <span className="text-[11px] font-semibold text-[#1A1A1A]">{row.v}</span>
                           </div>
                        ))}
                        <div className="flex justify-between py-[5px] mt-1">
                           <span className="text-[10px] font-mono text-[#888888]"></span>
                           <span className="text-[11px] font-bold text-[#2E4036]">→ Result: {breakdown.catering.toLocaleString()} kg CO2e</span>
                        </div>
                     </div>
                  </div>

                  {/* Right Column */}
                  <div className="flex flex-col gap-6">
                     {/* MATERIALS */}
                     <div className="">
                        <div className="text-[9px] font-mono uppercase text-[#2E4036] mb-[8px] pl-1.5 border-l-[2px] border-[#2E4036] font-bold tracking-widest">
                           Materials (Scope 3 · Cat 5)
                        </div>
                        {[
                           { l: 'Tableware', v: getVal(formData.tableware) },
                           { l: 'Printed materials', v: getVal(printedMaterialsRaw) },
                           { l: 'Waste sorted', v: getVal(formData.wasteSorted ? 'Yes' : 'No') },
                           { l: 'Landfill applied', v: getVal(landfillRate) },
                        ].map((row, i) => (
                           <div key={i} className="flex justify-between py-[5px] border-b border-[#E0E0E0]">
                              <span className="text-[10px] font-mono text-[#888888]">{row.l}</span>
                              <span className="text-[11px] font-semibold text-[#1A1A1A]">{row.v}</span>
                           </div>
                        ))}
                        <div className="flex justify-between py-[5px] mt-1">
                           <span className="text-[10px] font-mono text-[#888888]"></span>
                           <span className="text-[11px] font-bold text-[#2E4036]">→ Result: {breakdown.materials.toLocaleString()} kg CO2e</span>
                        </div>
                     </div>

                     {/* TRANSPORT */}
                     <div className="">
                        <div className="text-[9px] font-mono uppercase text-[#2E4036] mb-[8px] pl-1.5 border-l-[2px] border-[#2E4036] font-bold tracking-widest">
                           Transport (Scope 3 · Cat 6)
                        </div>
                        {[
                           { l: 'BTS distance', v: getVal(formData.distanceBts) },
                           { l: 'Mode split', v: getVal(`${formData.transportPublic}% pub / ${formData.transportPrivate}% car`) },
                           { l: 'Shuttle', v: getVal(formData.shuttle ? 'Provided' : 'No') },
                        ].map((row, i) => (
                           <div key={i} className="flex justify-between py-[5px] border-b border-[#E0E0E0]">
                              <span className="text-[10px] font-mono text-[#888888]">{row.l}</span>
                              <span className="text-[11px] font-semibold text-[#1A1A1A]">{row.v}</span>
                           </div>
                        ))}
                        <div className="flex justify-between py-[5px] mt-1">
                           <span className="text-[10px] font-mono text-[#888888]"></span>
                           <span className="text-[11px] font-bold text-[#2E4036]">→ Result: {breakdown.transport.toLocaleString()} kg CO2e</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* SECTION 7 - TRAVEL DISCLOSURE */}
            <div className="mb-10 p-[12px_16px] bg-[rgba(212,98,42,0.04)] border-l-[3px] border-[#D4622A]">
               <h3 className="text-[9px] font-mono font-bold text-[#D4622A] uppercase tracking-widest mb-2">Long-haul Travel Disclosure</h3>
               {travelDisclosure.total !== null ? (
                  <>
                     <div className="text-[24px] font-bold text-[#1A1A1A] leading-none mb-1">
                        {travelDisclosure.total.toLocaleString()} kg CO2e
                     </div>
                     <div className="text-[11px] text-[#888888] mb-1">
                        Estimated from {formData.surveyRate}% survey response rate
                     </div>
                     {formData.origins?.length > 0 && (
                        <div className="text-[11px] text-[#1A1A1A] font-semibold mb-2">
                           Origins: {formData.origins.join(', ')}
                        </div>
                     )}
                  </>
               ) : (
                  <div className="text-[11px] italic text-[#888888] mb-2">Not captured for this event.</div>
               )}
               <div className="text-[10px] italic text-[#888888] mt-2 border-t border-[#D4622A]/20 pt-2">
                  Long-haul travel is disclosed separately and does not affect the operational score.
               </div>
            </div>

            {/* SECTION 8 - RECOMMENDATIONS */}
            <div className="mb-10" style={{ pageBreakBefore: 'always' }}>
               <h2 className="text-[16px] font-bold text-[#2E4036] mb-4">Key Improvements for Next Event</h2>
               <div className="flex flex-col">
                  {recommendations.map((rec, i) => (
                     <div key={i} className="flex items-start gap-3 py-3 border-b border-[#E0E0E0] last:border-0">
                        <div className="w-[20px] h-[20px] rounded-full bg-[#2E4036] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                           {i + 1}
                        </div>
                        <div className="flex flex-col gap-1 w-full">
                           <p className="text-[12px] font-bold text-[#1A1A1A] leading-snug">
                              {typeof rec === 'string' ? rec : rec.text}
                           </p>
                           {typeof rec === 'object' && rec.impact && (
                              <p className="text-[9px] font-mono text-[#D4622A] uppercase tracking-tight">{rec.impact}</p>
                           )}
                           {typeof rec === 'object' && rec.action && (
                              <p className="text-[10px] italic text-[#666666] leading-snug">
                                 {rec.action}
                              </p>
                           )}
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* SECTION 9 - DATA QUALITY + METHODOLOGY */}
            <div className="grid grid-cols-2 gap-8 mb-10">
               <div>
                  <h3 className="text-[10px] font-mono font-bold text-[#2E4036] uppercase tracking-widest mb-3">Data Quality</h3>
                  <div className="flex flex-col">
                     {[
                        { s: 'Venue Energy', q: formData.hasKwh ? 'Measured' : 'Estimated', bg: formData.hasKwh ? '#D4EDDA' : '#F0F5F2', text: formData.hasKwh ? '#155724' : '#2E4036', border: formData.hasKwh ? '#155724' : '#2E4036' },
                        { s: 'Catering', q: 'Mixed', bg: '#FFF3CD', text: '#856404', border: '#856404' },
                        { s: 'Materials', q: 'Estimated', bg: '#F0F5F2', text: '#2E4036', border: '#2E4036' },
                        { s: 'Local Transit', q: 'Estimated', bg: '#F0F5F2', text: '#2E4036', border: '#2E4036' },
                        {
                           s: 'Int\'l Travel',
                           q: formData.surveySent && formData.surveyRate > 0 ? 'Extrapolated' : formData.intlPresent ? 'Estimated' : 'N/A',
                           bg: formData.surveySent && formData.surveyRate > 0 ? '#CCE5FF' : formData.intlPresent ? '#F0F5F2' : '#F8F9FA',
                           text: formData.surveySent && formData.surveyRate > 0 ? '#004085' : formData.intlPresent ? '#2E4036' : '#888888',
                           border: formData.surveySent && formData.surveyRate > 0 ? '#004085' : formData.intlPresent ? '#2E4036' : '#CCCCCC'
                        }
                     ].map((row, i) => (
                        <div key={i} className="flex justify-between items-center py-[6px] border-b border-[#E0E0E0] last:border-0">
                           <span className="text-[11px] font-semibold text-[#1A1A1A]">{row.s}</span>
                           <span className="text-[9px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border border-solid" style={{ backgroundColor: row.bg, color: row.text, borderColor: row.border }}>
                              {row.q}
                           </span>
                        </div>
                     ))}
                  </div>
               </div>

               <div>
                  <h3 className="text-[10px] font-mono font-bold text-[#2E4036] uppercase tracking-widest mb-3">Methodology & Sources</h3>
                  <p className="text-[9px] text-[#888888] leading-relaxed mb-4">
                     GHG Protocol Corporate Value Chain Standard. Thailand grid: 0.5213 kg/kWh (TGO 2023). Meal factors: IPCC lifecycle averages. Aviation: 1.9× radiative forcing.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                     {['IFRS S2', 'GRI 305', 'SEC 56-1', 'SET ESG'].map(badge => (
                        <div key={badge} className="bg-[#F0F5F2] border-[1.5px] border-[#2E4036] rounded-[3px] px-[10px] py-[4px] text-[8px] font-mono font-bold text-[#2E4036] text-center uppercase tracking-[1px] whitespace-nowrap">
                           {badge}
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* SECTION 3 - DISCLAIMER (Moved to Footer) */}
            <div className="w-full bg-[#F0F5F2] border border-[#C8DDD2] rounded-[4px] px-[12px] py-[8px] mt-[24px] mb-[24px] text-[9px] text-[#4A7A5C] leading-relaxed text-center">
               This report is generated from organiser-provided data and estimated emission factors. Verdify does not independently verify input data. Figures are indicative and intended for internal sustainability tracking and disclosure preparation.
            </div>

            {/* SECTION 10 - DOCUMENT FOOTER */}
            <div className="w-full border-t border-[#E0E0E0] pt-[12px] mb-[32px]">
               <div className="grid grid-cols-3 gap-4 mb-3">
                  <div className="text-[9px] font-mono text-[#2E4036] font-bold">Verdify. — Sustainability Intelligence</div>
                  <div className="text-[9px] font-mono text-[#888888] text-center">Event ID: {eventId ? String(eventId).substring(0, 8) : 'DRAFT'}</div>
                  <div className="text-[9px] font-mono text-[#888888] text-right">Generated: {new Date().toLocaleDateString('en-GB')} · Verdify V1.0</div>
               </div>
               <div className="text-center text-[8px] font-mono text-[#2E4036] font-bold tracking-[2px]">
                  ✦ TRACKED BY VERDIFY · verdify.com
               </div>
            </div>
         </div>
      </div>
   );
}
