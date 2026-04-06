import re

with open('src/pages/PrintReport.jsx', 'r') as f:
    content = f.read()

# 1. Add getTierColor, getVal, raw vars + Data array edits
to_insert = """
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
  
"""
content = content.replace('  const { score, tier, breakdown, recommendations, intensity } = data;', to_insert + '  const { score, tier, breakdown, recommendations, intensity } = data;')

content = content.replace(
    "{ label: 'Local Transport', value: breakdown.transport, color: '#B8E8CC', code: 'transport' }",
    "{ label: 'Local Transport', value: breakdown.transport, color: '#B8E8CC', code: 'transport', border: '1px solid #5BA07A' }"
)

content = content.replace(
    'style={{ backgroundColor: item.color }} />',
    'style={{ backgroundColor: item.color, border: item.border || "none" }} />'
)

# Replace meals and materials in logic
content = content.replace("  let foodWasteRef = '0.5 kg/meal';", "  const mealsPerDayRaw = formData.mealsPerDay || formData.meals_per_day || formData.mealsPerAttendee;\n  const printedMaterialsRaw = formData.printedMaterials || formData.printed_materials || formData.printMaterials;\n  let foodWasteRef = '0.5 kg/meal';")

# 2. Print styles
print_styles = """          body {
            background: white !important;
          }
          html, body {
            height: auto !important;
            min-height: unset !important;
          }
          @page {
            @bottom-right {
              content: "Page " counter(page) " of " counter(pages);
              font-size: 8pt;
              color: #888888;
              font-family: monospace;
            }
          }
          .page-break {"""
content = content.replace('          body {\n            background: white !important;\n          }\n          .page-break {', print_styles)

# 3. Min-height wrapper
content = content.replace(
    '<div className="bg-[#FFFFFF] min-h-screen font-sans text-[#1A1A1A] text-[13px] leading-relaxed relative">',
    '<div className="bg-[#FFFFFF] font-sans text-[#1A1A1A] text-[13px] leading-relaxed relative" style={{ minHeight: "unset" }}>'
)

# 4. Header Section
header_before = """        {/* SECTION 1 - DOCUMENT HEADER */}
        <div className="w-full h-[8px] bg-[#2E4036]" />
        <div className="flex justify-between items-end mt-4 mb-3">
           <div className="text-[18px] font-mono font-bold tracking-tighter text-[#2E4036] uppercase leading-none">VERDIFY.</div>
           <div className="text-[10px] font-mono text-[#888888] uppercase tracking-widest">EVENT SUSTAINABILITY REPORT</div>
        </div>
        <div className="w-full border-t border-[#E0E0E0] mb-8" />"""
header_after = """        {/* SECTION 1 - DOCUMENT HEADER */}
        <div className="w-full h-[8px] bg-[#2E4036] m-0 p-0" />
        <div className="flex justify-between items-end py-[12px] border-b border-[#E0E0E0] mb-[16px]">
           <div className="text-[16px] font-mono font-bold tracking-tighter text-[#2E4036] uppercase leading-none">VERDIFY.</div>
           <div className="text-[10px] font-mono text-[#888888] uppercase tracking-widest">EVENT SUSTAINABILITY REPORT</div>
        </div>"""
content = content.replace(header_before, header_after)

# 5. Score Section
score_before = """        <div className="flex flex-col items-center py-[24px] mb-8" style={{ pageBreakAfter: 'avoid' }}>
           <div className="font-serif text-[72px] font-bold leading-none text-[#2E4036] mb-2">{score}</div>
           <div className="text-[12px] font-mono uppercase font-bold tracking-widest mb-6" style={{ color: score >= 85 ? '#2E4036' : score >= 70 ? '#3D7A5E' : score >= 50 ? '#D4622A' : '#DC2626' }}>
              {tier?.label || 'Unknown'}
           </div>"""
score_after = """        <div className="flex flex-col items-center py-[24px] mb-[16px]">
           <div className="font-serif text-[72px] font-bold leading-none text-[#2E4036] mb-2">{score}</div>
           <div className="text-[12px] font-mono uppercase font-bold tracking-widest mb-6" style={{ color: getTierColor(tier) }}>
              {tier}
           </div>"""
content = content.replace(score_before, score_after)

# 6. Page Break Auto
content = content.replace('<div className="mb-10 no-break">\\n           <h2 className="text-[16px] font-bold text-[#2E4036] mb-0.5">Operational Emissions Breakdown</h2>', '<div className="mb-10 no-break" style={{ pageBreakBefore: "auto" }}>\\n           <h2 className="text-[16px] font-bold text-[#2E4036] mb-0.5">Operational Emissions Breakdown</h2>')


# 7. Field Values Data Arrays
content = content.replace(
    '[{ l: \\'Estimation method\\', v: formData.hasKwh ? "Actual kWh" : `Intensity model (${formData.venueSize}sqm)` },',
    '[{ l: \\'Estimation method\\', v: getVal(formData.hasKwh ? "Actual kWh" : (formData.venueSize ? `Intensity model (${formData.venueSize}sqm)` : null)) },'
)
content = content.replace(
    '{ l: \\'Emission factor\\', v: "TGO 2023 grid avg" },',
    '{ l: \\'Emission factor\\', v: getVal("TGO 2023 grid avg") },'
)
content = content.replace(
    '{ l: \\'Renewable adj.\\', v: renewableAdjustmentApplied },',
    '{ l: \\'Renewable adj.\\', v: getVal(renewableAdjustmentApplied) },'
)
content = content.replace(
    '{ l: \\'Generator\\', v: formData.generators ? `Yes (${formData.diesel}L)` : "No" },',
    '{ l: \\'Generator\\', v: getVal(formData.generators ? `Yes (${formData.diesel}L)` : "No") },'
)

content = content.replace(
    '{ l: \\'Meal type\\', v: formData.mealType },',
    '{ l: \\'Meal type\\', v: getVal(formData.mealType) },'
)
content = content.replace(
    '{ l: \\'Meals/day\\', v: formData.mealsPerDay },',
    '{ l: \\'Meals/day\\', v: getVal(mealsPerDayRaw) },'
)
content = content.replace(
    '{ l: \\'Local sourcing\\', v: formData.localSourced },',
    '{ l: \\'Local sourcing\\', v: getVal(formData.localSourced) },'
)
content = content.replace(
    '{ l: \\'Food waste\\', v: foodWasteRef },',
    '{ l: \\'Food waste\\', v: getVal(foodWasteRef) },'
)
content = content.replace(
    '{ l: \\'Composting\\', v: formData.composted },',
    '{ l: \\'Composting\\', v: getVal(formData.composted) },'
)

content = content.replace(
    '{ l: \\'Tableware\\', v: formData.tableware },',
    '{ l: \\'Tableware\\', v: getVal(formData.tableware) },'
)
content = content.replace(
    '{ l: \\'Printed materials\\', v: formData.printedMaterials },',
    '{ l: \\'Printed materials\\', v: getVal(printedMaterialsRaw) },'
)
content = content.replace(
    '{ l: \\'Waste sorted\\', v: formData.wasteSorted ? \\'Yes\\' : \\'No\\' },',
    '{ l: \\'Waste sorted\\', v: getVal(formData.wasteSorted ? \\'Yes\\' : \\'No\\') },'
)
content = content.replace(
    '{ l: \\'Landfill applied\\', v: landfillRate },',
    '{ l: \\'Landfill applied\\', v: getVal(landfillRate) },'
)

content = content.replace(
    '{ l: \\'BTS distance\\', v: formData.distanceBts },',
    '{ l: \\'BTS distance\\', v: getVal(formData.distanceBts) },'
)
content = content.replace(
    '{ l: \\'Mode split\\', v: `${formData.transportPublic}% pub / ${formData.transportPrivate}% car` },',
    '{ l: \\'Mode split\\', v: getVal(`${formData.transportPublic}% pub / ${formData.transportPrivate}% car`) },'
)
content = content.replace(
    '{ l: \\'Shuttle\\', v: formData.shuttle ? \\'Provided\\' : \\'No\\' },',
    '{ l: \\'Shuttle\\', v: getVal(formData.shuttle ? \\'Provided\\' : \\'No\\') },'
)


# 8. Disclosure Badges
content = content.replace(
    '<div key={badge} className="bg-[#F2F0E9] border border-[#2E4036] rounded-[3px] px-1.5 py-1 text-[8px] font-mono text-[#2E4036] text-center tracking-[0.1em] whitespace-nowrap">',
    '<div key={badge} className="bg-[#F0F5F2] border-[1.5px] border-[#2E4036] rounded-[3px] px-[10px] py-[4px] text-[8px] font-mono font-bold text-[#2E4036] text-center uppercase tracking-[1px] whitespace-nowrap">'
)


# 9. Data Quality Badge Colors
dq_before = """                 {[
                  { s: 'Venue Energy', q: formData.hasKwh ? 'Measured' : 'Estimated', bg: formData.hasKwh ? '#DCFCE7' : '#E5E5E5', text: formData.hasKwh ? '#166534' : '#1A1A1A' },
                  { s: 'Catering', q: 'Mixed', bg: '#FEF08A', text: '#854D0E' },
                  { s: 'Materials', q: 'Estimated', bg: '#E5E5E5', text: '#52525B' },
                  { s: 'Local Transit', q: 'Estimated', bg: '#E5E5E5', text: '#52525B' },
                  { 
                    s: 'Int\\'l Travel', 
                    q: formData.surveySent && formData.surveyRate > 0 ? 'Extrapolated' : formData.intlPresent ? 'Estimated' : 'N/A', 
                    bg: formData.surveySent && formData.surveyRate > 0 ? '#DBEAFE' : formData.intlPresent ? '#E5E5E5' : '#F4F4F5',
                    text: formData.surveySent && formData.surveyRate > 0 ? '#1E40AF' : formData.intlPresent ? '#52525B' : '#A1A1AA'
                  }
                ].map((row, i) => (
                   <div key={i} className="flex justify-between items-center py-[6px] border-b border-[#E0E0E0] last:border-0">
                      <span className="text-[11px] font-semibold text-[#1A1A1A]">{row.s}</span>
                      <span className="text-[9px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 rounded" style={{ backgroundColor: row.bg, color: row.text }}>"""

dq_after = """                 {[
                  { s: 'Venue Energy', q: formData.hasKwh ? 'Measured' : 'Estimated', bg: formData.hasKwh ? '#D4EDDA' : '#F0F5F2', text: formData.hasKwh ? '#155724' : '#2E4036', border: formData.hasKwh ? '#155724' : '#2E4036' },
                  { s: 'Catering', q: 'Mixed', bg: '#FFF3CD', text: '#856404', border: '#856404' },
                  { s: 'Materials', q: 'Estimated', bg: '#F0F5F2', text: '#2E4036', border: '#2E4036' },
                  { s: 'Local Transit', q: 'Estimated', bg: '#F0F5F2', text: '#2E4036', border: '#2E4036' },
                  { 
                    s: 'Int\\'l Travel', 
                    q: formData.surveySent && formData.surveyRate > 0 ? 'Extrapolated' : formData.intlPresent ? 'Estimated' : 'N/A', 
                    bg: formData.surveySent && formData.surveyRate > 0 ? '#CCE5FF' : formData.intlPresent ? '#F0F5F2' : '#F8F9FA',
                    text: formData.surveySent && formData.surveyRate > 0 ? '#004085' : formData.intlPresent ? '#2E4036' : '#888888',
                    border: formData.surveySent && formData.surveyRate > 0 ? '#004085' : formData.intlPresent ? '#2E4036' : '#CCCCCC'
                  }
                ].map((row, i) => (
                   <div key={i} className="flex justify-between items-center py-[6px] border-b border-[#E0E0E0] last:border-0">
                      <span className="text-[11px] font-semibold text-[#1A1A1A]">{row.s}</span>
                      <span className="text-[9px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border" style={{ backgroundColor: row.bg, color: row.text, borderColor: row.border }}>"""
content = content.replace(dq_before, dq_after)

with open('src/pages/PrintReport.jsx', 'w') as f:
    f.write(content)

