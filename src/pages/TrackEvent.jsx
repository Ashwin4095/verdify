import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronDown, Info } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from '../lib/supabase';
import { calculateReport } from '../utils/formulas';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const TextInput = ({ label, type = "text", value, onChange, error, placeholder, min, max }) => (
  <div className="space-y-1.5 w-full">
    <label className="block text-sm font-bold text-[#2E4036]">{label}</label>
    <div className={cn("px-4 py-3 rounded-2xl border bg-white transition-all", error ? "border-red-500" : "border-[#1A1A1A]/20 focus-within:border-[#2E4036]")}>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full bg-transparent outline-none text-[#1A1A1A]" placeholder={placeholder} min={min} max={max}/>
    </div>
    {error && <span className="text-xs text-red-500 font-bold">{error}</span>}
  </div>
);

const Toggle = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between p-4 rounded-2xl border border-[#1A1A1A]/20 bg-white cursor-pointer hover:border-[#2E4036]/50 transition-all" onClick={() => onChange(!checked)}>
    <span className="text-sm font-bold text-[#2E4036]">{label}</span>
    <div className={cn("w-12 h-6 rounded-full p-1 transition-colors duration-300 flex items-center", checked ? "bg-[#2E4036]" : "bg-gray-200")}>
      <div className={cn("w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow", checked ? "translate-x-6" : "translate-x-0")} />
    </div>
  </div>
);

const SelectGroup = ({ label, options, value, onChange, error, layout="grid" }) => (
  <div className="space-y-2 w-full">
    <label className="block text-sm font-bold text-[#2E4036]">{label}</label>
    <div className={cn("gap-2", layout==="grid" ? "grid grid-cols-2 lg:grid-cols-3" : "flex flex-wrap")}>
      {options.map(opt => (
        <div key={opt} onClick={() => onChange(opt)} className={cn("px-4 py-3 rounded-2xl border cursor-pointer text-sm font-bold text-center transition-all", value === opt ? "bg-[#2E4036] text-[#F2F0E9] border-[#2E4036]" : "bg-white text-[#1A1A1A] border-[#1A1A1A]/20 hover:border-[#2E4036]/50")}>
          {opt}
        </div>
      ))}
    </div>
    {error && <span className="text-xs text-red-500 font-bold">{error}</span>}
  </div>
);

const NativeSelect = ({ label, options, value, onChange, error }) => (
  <div className="space-y-1.5 w-full">
    <label className="block text-sm font-bold text-[#2E4036]">{label}</label>
    <div className={cn("px-4 py-3 rounded-2xl border bg-white transition-all relative", error ? "border-red-500" : "border-[#1A1A1A]/20 focus-within:border-[#2E4036]")}>
      <select value={value} onChange={e => onChange(e.target.value)} className="w-full bg-transparent outline-none text-[#1A1A1A] appearance-none pr-8 font-medium">
        <option value="" disabled>Select an option</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1A1A]/50 pointer-events-none" />
    </div>
    {error && <span className="text-xs text-red-500 font-bold">{error}</span>}
  </div>
);

const MultiSelect = ({ label, options, selected, onChange, error }) => {
  const toggle = (opt) => {
    if(selected.includes(opt)) onChange(selected.filter(x => x !== opt));
    else onChange([...selected, opt]);
  }
  return (
    <div className="space-y-2 w-full">
      <label className="block text-sm font-bold text-[#2E4036]">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <div key={opt} onClick={() => toggle(opt)} className={cn("px-4 py-2 rounded-full border cursor-pointer text-sm font-bold transition-all flex items-center gap-2", selected.includes(opt) ? "bg-[#2E4036] text-[#F2F0E9] border-[#2E4036]" : "bg-white text-[#1A1A1A] border-[#1A1A1A]/20 hover:border-[#2E4036]/50")}>
            <div className={cn("w-4 h-4 rounded-full border flex justify-center items-center transition-all", selected.includes(opt) ? "border-[#F2F0E9] bg-transparent" : "border-[#1A1A1A]/40 bg-transparent" )}>
                {selected.includes(opt) && <CheckCircle2 className="w-3 h-3 text-[#F2F0E9]" />}
            </div>
            {opt}
          </div>
        ))}
      </div>
      {error && <span className="text-xs text-red-500 font-bold">{error}</span>}
    </div>
  )
};

const Conditional = ({ show, children }) => (
  <div className={cn("grid transition-all duration-300 ease-in-out", show ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none")}>
    <div className="overflow-hidden">
      <div className="pt-4">{children}</div>
    </div>
  </div>
);

const SECTIONS = [
  "Event Basics",
  "Venue Energy",
  "Catering",
  "Local Transport",
  "Materials & Waste",
  "Long-haul Travel"
];

export default function TrackEvent() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const totalSteps = 7; // 6 sections + Summary
  
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const [form, setForm] = useState({
    eventName: '', eventDate: '', duration: '', hoursPerDay: 8, venueName: '', venueType: '', venueLocation: '', eventType: '', expectedAttendees: '', actualAttendees: '', setting: '',
    hasKwh: false, totalKwh: '', venueSize: '', renewable: '', generators: false, diesel: '',
    meals: '', mealType: '', localSourced: '', bottledWater: false, bottles: '', foodWaste: '', composted: '',
    distanceBts: '', shuttle: false, bkkAttendees: '', transportPublic: '', transportPrivate: '', transportTaxi: '', promoted: false,
    tableware: '', reusableManaged: false, printed: '', merch: false, wasteSorted: false, landfill: '',
    intlPresent: false, intlCount: '', origins: [], surveySent: false, surveyRate: ''
  });
  
  const [errors, setErrors] = useState({});

  const updateForm = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if(errors[key]) setErrors(prev => ({ ...prev, [key]: null }));
  };

  const validateStep = (currentStep) => {
    const newErrors = {};
    let isValid = true;
    
    const requireField = (key, msg = "Required") => {
      if(form[key] === '' || form[key] === null || form[key] === undefined || (Array.isArray(form[key]) && form[key].length === 0)) {
        newErrors[key] = msg;
        isValid = false;
      }
    };

    if (currentStep === 1) {
      requireField('eventName'); requireField('eventDate'); requireField('duration');
      if (form.duration < 1) { newErrors.duration = "Minimum 1 day"; isValid = false; }
      requireField('venueName'); requireField('venueType'); requireField('venueLocation');
      requireField('eventType'); requireField('actualAttendees'); requireField('setting');
    }
    else if (currentStep === 2) {
      if (form.hasKwh) requireField('totalKwh');
      else requireField('venueSize');
      requireField('renewable');
      if (form.generators) requireField('diesel');
    }
    else if (currentStep === 3) {
      requireField('meals'); requireField('mealType'); requireField('localSourced');
      requireField('foodWaste'); requireField('composted');
      if (form.bottledWater) requireField('bottles');
    }
    else if (currentStep === 4) {
      requireField('distanceBts'); requireField('bkkAttendees');
      requireField('transportPublic'); requireField('transportPrivate'); requireField('transportTaxi');
      const sum = Number(form.transportPublic) + Number(form.transportPrivate) + Number(form.transportTaxi);
      if (form.transportPublic !== '' && form.transportPrivate !== '' && form.transportTaxi !== '' && sum !== 100) {
        newErrors.transportSplit = "Must add up to exactly 100%";
        isValid = false;
      }
    }
    else if (currentStep === 5) {
      requireField('tableware'); requireField('printed'); requireField('landfill');
    }
    else if (currentStep === 6) {
      if (form.intlPresent) {
        requireField('intlCount'); requireField('origins');
      }
      if (form.surveySent) {
        requireField('surveyRate');
        if (form.surveyRate < 0 || form.surveyRate > 100) { newErrors.surveyRate = "Must be 0-100"; isValid = false; }
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(s => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setStep(s => s - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleGenerate = async () => {
    setSaving(true);
    setSaveError(null);
    
    const results = calculateReport(form);
    
    const { data, error } = await supabase
      .from('events')
      .insert([{
        event_name: form.eventName,
        event_date: form.eventDate,
        company_name: form.companyName || null,
        form_data: form,
        score: results.score,
        tier: results.tier.label,
        breakdown: results.breakdown,
        recommendations: results.recommendations,
        intensity: results.breakdown.intensity,
        total_emissions: results.breakdown.total
      }])
      .select();
    
    setSaving(false);
    
    if (error) {
      console.error('Supabase error:', error);
      setSaveError(`Failed to save report: ${error.message || 'Check console details'}`);
      setSaving(false);
      return;
    }
    
    navigate('/report', { 
      state: { 
        results, 
        eventId: data[0].id,
        formData: form 
      } 
    });
  };

  const transportSum = Number(form.transportPublic || 0) + Number(form.transportPrivate || 0) + Number(form.transportTaxi || 0);
  const transportSumError = (form.transportPublic !== '' && form.transportPrivate !== '' && form.transportTaxi !== '') && transportSum !== 100;

  return (
    <div className="min-h-screen bg-[#F2F0E9] font-sans pb-32">
      {/* Navigation Bar Minimal */}
      <nav className="fixed top-0 left-0 w-full bg-[#F2F0E9]/80 backdrop-blur-md z-50 border-b border-[#1A1A1A]/5">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-extrabold tracking-tighter text-[#2E4036] uppercase flex flex-col pt-1.5"><span className="leading-none">Verdify</span><span className="text-[8px] tracking-widest leading-none mt-1 opacity-50">INTELLIGENCE</span></Link>
          <div className="flex items-center gap-2">
             <span className="text-xs font-bold text-[#1A1A1A]/40 uppercase tracking-widest">{step === totalSteps ? "Summary" : `Step ${step} of 6`}</span>
          </div>
        </div>
      </nav>

      <div className="pt-32 px-6 max-w-3xl mx-auto">
        {step < totalSteps && (
          <div className="mb-12">
            <h1 className="text-3xl md:text-5xl font-black text-[#2E4036] tracking-tight mb-4">{SECTIONS[step - 1]}</h1>
            
            {/* Progress Bar */}
            <div className="flex gap-1 h-2 mb-8 mt-8">
              {SECTIONS.map((_, i) => (
                <div key={i} className={cn("h-full flex-1 rounded-full transition-all duration-500", i + 1 < step ? "bg-[#2E4036]" : i + 1 === step ? "bg-clay" : "bg-[#1A1A1A]/10")} />
              ))}
            </div>
            {step === 6 && (
                <div className="bg-clay/10 border border-clay/30 p-4 rounded-xl flex items-start gap-3 mb-8">
                    <Info className="w-5 h-5 text-clay shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-[#1A1A1A]/80">Long-haul travel emissions are disclosed separately in your report and do not affect your operational sustainability score.</p>
                </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-[2rem] p-6 lg:p-10 shadow-sm border border-[#1A1A1A]/10 relative z-10 space-y-8">
          
          {/* SECTION 1 */}
          {step === 1 && (
            <div className="space-y-6">
              <TextInput label="Event Name" value={form.eventName} onChange={v => updateForm('eventName', v)} error={errors.eventName} placeholder="Annual Tech Summit 2026" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <TextInput label="Event Date" type="date" value={form.eventDate} onChange={v => updateForm('eventDate', v)} error={errors.eventDate} />
                 <div className="grid grid-cols-2 gap-4">
                     <TextInput label="Duration (Days)" type="number" min="1" value={form.duration} onChange={v => updateForm('duration', v)} error={errors.duration} />
                     <TextInput label="Hours/Day" type="number" value={form.hoursPerDay} onChange={v => updateForm('hoursPerDay', v)} error={errors.hoursPerDay} />
                 </div>
              </div>
              <TextInput label="Venue Name" value={form.venueName} onChange={v => updateForm('venueName', v)} error={errors.venueName} placeholder="Grand Convention Center" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <NativeSelect label="Venue Type" value={form.venueType} onChange={v => updateForm('venueType', v)} error={errors.venueType} options={['Hotel Ballroom', 'Convention Centre', 'Exhibition Hall', 'Rooftop or Outdoor', 'Other']} />
                 <NativeSelect label="Event Type" value={form.eventType} onChange={v => updateForm('eventType', v)} error={errors.eventType} options={['Conference', 'Exhibition', 'Gala Dinner', 'Retreat', 'Other']} />
              </div>

              <TextInput label="Venue Location / District" value={form.venueLocation} onChange={v => updateForm('venueLocation', v)} error={errors.venueLocation} placeholder="Pathum Wan, Bangkok" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TextInput label="Expected Attendees (Optional)" type="number" value={form.expectedAttendees} onChange={v => updateForm('expectedAttendees', v)} />
                  <TextInput label="Actual Attendees" type="number" value={form.actualAttendees} onChange={v => updateForm('actualAttendees', v)} error={errors.actualAttendees} />
              </div>

              <SelectGroup label="Setting" value={form.setting} onChange={v => updateForm('setting', v)} error={errors.setting} options={['Indoor', 'Outdoor', 'Both']} layout="flex" />
            </div>
          )}

          {/* SECTION 2 */}
          {step === 2 && (
            <div className="space-y-6">
              <Toggle label="Did the venue provide a kWh figure?" checked={form.hasKwh} onChange={v => updateForm('hasKwh', v)} />
              
              <Conditional show={form.hasKwh}>
                 <TextInput label="Total kWh consumed" type="number" value={form.totalKwh} onChange={v => updateForm('totalKwh', v)} error={errors.totalKwh} />
              </Conditional>
              
              <Conditional show={!form.hasKwh}>
                  <div className="bg-[#F2F0E9] p-4 rounded-xl space-y-4">
                      <p className="text-sm text-[#1A1A1A]/60 font-medium">Without direct metering, Verdify estimates consumption based on size and duration.</p>
                      <TextInput label="Venue size in sqm" type="number" value={form.venueSize} onChange={v => updateForm('venueSize', v)} error={errors.venueSize} />
                  </div>
              </Conditional>

              <SelectGroup label="Renewable Energy Used?" value={form.renewable} onChange={v => updateForm('renewable', v)} error={errors.renewable} options={['Yes - Fully', 'Yes - Partial', 'No']} />

              <Toggle label="Were generators used?" checked={form.generators} onChange={v => updateForm('generators', v)} />
              <Conditional show={form.generators}>
                  <TextInput label="Litres of diesel used" type="number" value={form.diesel} onChange={v => updateForm('diesel', v)} error={errors.diesel} />
              </Conditional>
            </div>
          )}

          {/* SECTION 3 */}
          {step === 3 && (
            <div className="space-y-6">
               <SelectGroup label="Meals per attendee per day" value={form.meals} onChange={v => updateForm('meals', v)} error={errors.meals} options={['1 meal', '2 meals', '3 meals', '3 meals + snacks']} />
               <SelectGroup label="Meal Type Profile" value={form.mealType} onChange={v => updateForm('mealType', v)} error={errors.mealType} options={['Meat-heavy', 'Mixed', 'Vegetarian', 'Vegan']} />
               <SelectGroup label="% Ingredients Sourced Regionally (TH)" value={form.localSourced} onChange={v => updateForm('localSourced', v)} error={errors.localSourced} options={['Under 25%', '25-50%', '50-75%', 'Over 75%']} />
               
               <Toggle label="Bottled water used?" checked={form.bottledWater} onChange={v => updateForm('bottledWater', v)} />
               <Conditional show={form.bottledWater}>
                   <TextInput label="Total Number of Bottles" type="number" value={form.bottles} onChange={v => updateForm('bottles', v)} error={errors.bottles} />
               </Conditional>

               <SelectGroup label="Observed Food Waste Level" value={form.foodWaste} onChange={v => updateForm('foodWaste', v)} error={errors.foodWaste} options={['None', 'Light', 'Moderate', 'Heavy']} />
               <SelectGroup label="Was food waste composted or donated?" value={form.composted} onChange={v => updateForm('composted', v)} error={errors.composted} options={['Yes', 'Partial', 'No']} />
            </div>
          )}

          {/* SECTION 4 */}
          {step === 4 && (
             <div className="space-y-6">
                <SelectGroup label="Distance from nearest BTS/MRT" value={form.distanceBts} onChange={v => updateForm('distanceBts', v)} error={errors.distanceBts} options={['Walking distance', 'Under 1km', '1-3km', 'Over 3km']} />
                <Toggle label="Was a shuttle service provided?" checked={form.shuttle} onChange={v => updateForm('shuttle', v)} />
                <SelectGroup label="% of Attendees from Bangkok" value={form.bkkAttendees} onChange={v => updateForm('bkkAttendees', v)} error={errors.bkkAttendees} options={['Under 25%', '25-50%', '50-75%', 'Over 75%']} />
                
                <div className="bg-[#F2F0E9] p-6 rounded-[2rem] space-y-4">
                   <div className="flex justify-between items-center">
                     <label className="block text-sm font-bold text-[#2E4036]">Transport Mode Split</label>
                     <span className={cn("text-xs font-bold px-2 py-1 rounded-full", transportSum === 100 ? "bg-[#2E4036] text-white" : transportSumError ? "bg-red-500 text-white" : "bg-[#1A1A1A]/10")}>Total: {transportSum}%</span>
                   </div>
                   <div className="grid grid-cols-3 gap-4">
                      <TextInput label="% Public" type="number" value={form.transportPublic} onChange={v => updateForm('transportPublic', v)} />
                      <TextInput label="% Car" type="number" value={form.transportPrivate} onChange={v => updateForm('transportPrivate', v)} />
                      <TextInput label="% Taxi" type="number" value={form.transportTaxi} onChange={v => updateForm('transportTaxi', v)} />
                   </div>
                   {errors.transportSplit && <p className="text-red-500 font-bold text-xs">{errors.transportSplit}</p>}
                </div>

                <Toggle label="Was public transport actively promoted?" checked={form.promoted} onChange={v => updateForm('promoted', v)} />
             </div>
          )}

          {/* SECTION 5 */}
          {step === 5 && (
            <div className="space-y-6">
               <SelectGroup label="Tableware Type" value={form.tableware} onChange={v => updateForm('tableware', v)} error={errors.tableware} options={['Single-use plastic', 'Compostable', 'Reusable']} layout="flex" />
               <Conditional show={form.tableware === 'Reusable'}>
                   <Toggle label="Was the reusable system managed properly?" checked={form.reusableManaged} onChange={v => updateForm('reusableManaged', v)} />
               </Conditional>

               <SelectGroup label="Printed Materials" value={form.printed} onChange={v => updateForm('printed', v)} error={errors.printed} options={['None', 'Light - badge + programme', 'Heavy - full printed folders']} />
               
               <Toggle label="Event merchandise or gifts distributed?" checked={form.merch} onChange={v => updateForm('merch', v)} />
               <Toggle label="Waste sorted on site?" checked={form.wasteSorted} onChange={v => updateForm('wasteSorted', v)} />
               
               <SelectGroup label="Estimated Waste to Landfill" value={form.landfill} onChange={v => updateForm('landfill', v)} error={errors.landfill} options={['None - all diverted', 'Some', 'Most']} />
            </div>
          )}

          {/* SECTION 6 */}
          {step === 6 && (
            <div className="space-y-6">
                <Toggle label="Were international attendees or speakers present?" checked={form.intlPresent} onChange={v => updateForm('intlPresent', v)} />
                <Conditional show={form.intlPresent}>
                    <div className="space-y-6 border-l-2 border-clay pl-6 ml-2">
                        <TextInput label="Approx. Number of Int'l Attendees" type="number" value={form.intlCount} onChange={v => updateForm('intlCount', v)} error={errors.intlCount} />
                        <MultiSelect label="Primary Origins" options={['Southeast Asia', 'East Asia', 'Europe', 'Middle East', 'Other']} selected={form.origins} onChange={v => updateForm('origins', v)} error={errors.origins} />
                    </div>
                </Conditional>

                <Toggle label="Was a post-event attendee travel survey sent?" checked={form.surveySent} onChange={v => updateForm('surveySent', v)} />
                <Conditional show={form.surveySent}>
                     <div className="pl-6 ml-2 border-l-2 border-clay">
                        <TextInput label="Survey Response Rate %" type="number" min="0" max="100" value={form.surveyRate} onChange={v => updateForm('surveyRate', v)} error={errors.surveyRate} />
                     </div>
                </Conditional>
            </div>
          )}

          {/* SUMMARY STEP */}
          {step === 7 && (
            <div className="space-y-8">
               <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-clay/20 rounded-full flex items-center justify-center mx-auto mb-4">
                     <CheckCircle2 className="w-8 h-8 text-clay" />
                  </div>
                  <h1 className="text-3xl font-black text-[#2E4036] tracking-tight">Review Your Data</h1>
                  <p className="text-[#1A1A1A]/60 font-medium">Verify your entries before generating the ESG report.</p>
               </div>
               
               <div className="space-y-6">
                   {[
                       { title: "Event Basics", keys: ['eventName', 'eventDate', 'actualAttendees'] },
                       { title: "Energy Profile", keys: ['hasKwh', 'totalKwh', 'venueSize', 'renewable'] },
                       { title: "Resources", keys: ['meals', 'bottledWater', 'tableware', 'landfill'] }
                   ].map((group, i) => (
                       <div key={i} className="bg-[#F2F0E9] p-6 rounded-2xl border border-[#1A1A1A]/10">
                           <h3 className="font-bold text-[#2E4036] mb-4 uppercase text-xs tracking-widest">{group.title}</h3>
                           <div className="space-y-2">
                               {group.keys.map(k => (
                                   <div key={k} className="flex justify-between items-center border-b border-[#1A1A1A]/5 pb-2 last:border-0 last:pb-0">
                                       <span className="text-sm font-medium text-[#1A1A1A]/60">{k}</span>
                                       <span className="text-sm font-bold text-[#1A1A1A] text-right">{String(form[k]) || '-'}</span>
                                   </div>
                               ))}
                           </div>
                       </div>
                   ))}
               </div>
            </div>
          )}

          {/* Controls */}
          {step < totalSteps ? (
            <div className="flex justify-between items-center pt-8 border-t border-[#1A1A1A]/10 mt-8">
               <div className="w-1/3">
                  {step > 1 && (
                      <div onClick={handleBack} className="text-[#1A1A1A]/60 hover:text-[#2E4036] font-bold text-sm flex items-center gap-2 cursor-pointer transition-colors w-fit">
                          <ArrowLeft className="w-4 h-4" /> Back
                      </div>
                  )}
               </div>
               <div onClick={handleNext} className="bg-[#2E4036] text-[#F2F0E9] px-8 py-4 rounded-full font-bold hover:scale-[1.03] transition-all duration-300 ease-magnetic flex items-center gap-3 cursor-pointer shadow-xl shadow-[#2E4036]/20 group">
                   <span className="tracking-tight uppercase">{step === 6 ? 'Review Data' : 'Continue'}</span>
                   <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </div>
            </div>
          ) : (
            <div className="pt-8 border-t border-[#1A1A1A]/10 mt-8">
               <div className="flex justify-between items-center">
                 <div onClick={() => !saving && setStep(6)} className={cn("text-[#1A1A1A]/60 hover:text-[#2E4036] font-bold text-sm flex items-center gap-2 transition-colors w-fit", saving ? "opacity-50 cursor-not-allowed" : "cursor-pointer")}>
                     <ArrowLeft className="w-4 h-4" /> Back to Edit
                 </div>
                 <button onClick={handleGenerate} disabled={saving} className={cn("bg-clay text-[#1A1A1A] px-10 py-4 rounded-full font-black transition-all duration-300 ease-magnetic shadow-2xl shadow-clay/20 uppercase tracking-tight flex items-center gap-2", saving ? "opacity-70 cursor-not-allowed" : "hover:scale-[1.03] cursor-pointer")}>
                     {saving ? (
                       <>
                         <svg className="animate-spin h-5 w-5 text-[#1A1A1A]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                         Saving...
                       </>
                     ) : 'Generate Report'}
                 </button>
               </div>
               {saveError && <p className="text-red-500 font-bold text-sm text-right mt-4">{saveError}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
