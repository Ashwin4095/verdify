export function calculateReport(formData) {
  const actualAttendees = Number(formData.actualAttendees) || 0;
  const eventDays = Number(formData.duration) || 1;
  const hoursPerDay = Number(formData.hoursPerDay) || 8;
  const venueType = formData.venueType;
  const kwhProvided = formData.hasKwh ? 'yes' : 'no';
  const kwhConsumed = Number(formData.totalKwh) || 0;
  const venueSqm = Number(formData.venueSize) || 0;
  const renewableEnergy = formData.renewable;
  const generatorLitres = Number(formData.diesel) || 0;
  const mealsPerDay = formData.meals;
  const mealType = formData.mealType;
  const localSourcing = formData.localSourced;
  const bottleCount = Number(formData.bottles) || 0;
  const foodWasteLevel = formData.foodWaste;
  const foodWasteDisposal = formData.composted;
  const tableware = formData.tableware;
  const reuseManaged = formData.reusableManaged ? 'yes' : 'no';
  const printedMaterials = formData.printed;
  const wasteToLandfill = formData.landfill;
  const wasteSorted = formData.wasteSorted ? 'yes' : 'no';
  const eventType = formData.eventType;
  const distanceFromBTS = formData.distanceBts;
  const shuttleProvided = formData.shuttle ? 'yes' : 'no';
  const transportSplit = {
    public: Number(formData.transportPublic) || 0,
    car: Number(formData.transportPrivate) || 0,
    taxi: Number(formData.transportTaxi) || 0
  };
  // const publicTransportPromoted = formData.promoted;
  const internationalAttendees = Number(formData.intlCount) || 0;
  const internationalOrigins = formData.origins || [];
  const surveyResponseRate = Number(formData.surveyRate) || 0;
  
  // ENERGY
  let venueTypeFactor = 0.05;
  if(venueType === 'Hotel Ballroom') venueTypeFactor = 0.05;
  if(venueType === 'Convention Centre') venueTypeFactor = 0.07;
  if(venueType === 'Exhibition Hall') venueTypeFactor = 0.08;
  if(venueType === 'Rooftop or Outdoor') venueTypeFactor = 0.02;
  
  let kwhUsed = 0;
  if(kwhProvided === 'yes') {
    kwhUsed = kwhConsumed;
  } else {
    kwhUsed = venueSqm * hoursPerDay * eventDays * venueTypeFactor;
  }
  
  let renewableMultiplier = 1.0;
  if(renewableEnergy === 'Yes - Fully') renewableMultiplier = 0.70;
  if(renewableEnergy === 'Yes - Partial') renewableMultiplier = 0.85;
  
  const energyEmissions = kwhUsed * 0.5213 * renewableMultiplier;
  const generatorEmissions = generatorLitres * 2.68;
  const venueEnergyResult = energyEmissions + generatorEmissions;

  // CATERING
  let mealFactor = 2.5;
  if(mealType === 'Meat-heavy') mealFactor = 4.5;
  if(mealType === 'Vegetarian') mealFactor = 1.5;
  if(mealType === 'Vegan') mealFactor = 1.0;
  
  let mealsPerDayValue = 1;
  if(mealsPerDay === '2 meals') mealsPerDayValue = 2;
  if(mealsPerDay === '3 meals') mealsPerDayValue = 3;
  if(mealsPerDay === '3 meals + snacks') mealsPerDayValue = 3.5;
  
  const totalMeals = actualAttendees * eventDays * mealsPerDayValue;
  
  let sourcingMultiplier = 1.0;
  if(localSourcing === '25-50%') sourcingMultiplier = 0.95;
  if(localSourcing === '50-75%') sourcingMultiplier = 0.90;
  if(localSourcing === 'Over 75%') sourcingMultiplier = 0.85;
  
  const foodEmissions = totalMeals * mealFactor * sourcingMultiplier;
  
  let wasteKgFactor = 0.5;
  if(mealType === 'Meat-heavy') wasteKgFactor = 0.6;
  if(mealType === 'Vegetarian') wasteKgFactor = 0.4;
  if(mealType === 'Vegan') wasteKgFactor = 0.35;
  
  let wastePct = 0;
  if(foodWasteLevel === 'Light') wastePct = 0.10;
  if(foodWasteLevel === 'Moderate') wastePct = 0.20;
  if(foodWasteLevel === 'Heavy') wastePct = 0.30;
  
  const wasteKg = totalMeals * wastePct * wasteKgFactor;
  
  let compostMultiplier = 1.0;
  if(foodWasteDisposal === 'Yes') compostMultiplier = 0.30;
  if(foodWasteDisposal === 'Partial') compostMultiplier = 0.65;
  
  const foodWasteEmissions = wasteKg * 0.6 * compostMultiplier;
  const waterEmissions = bottleCount * 0.16;
  
  const cateringResult = foodEmissions + foodWasteEmissions + waterEmissions;

  // MATERIALS & WASTE
  let tablewareFactor = 0.08;
  if(tableware === 'Compostable') tablewareFactor = 0.04;
  if(tableware === 'Reusable') tablewareFactor = reuseManaged === 'yes' ? 0.01 : 0.04;
  
  const tablewareCount = actualAttendees * eventDays * 5;
  const tablewareEmissions = tablewareCount * tablewareFactor;
  
  let printEmissions = 0;
  if(printedMaterials === 'Light - badge + programme') printEmissions = actualAttendees * 0.05;
  if(printedMaterials === 'Heavy - full printed folders') printEmissions = actualAttendees * 0.20;
  
  let wastePerPersonFactor = 0.5;
  if(eventType === 'Exhibition') wastePerPersonFactor = 0.7;
  if(eventType === 'Gala Dinner') wastePerPersonFactor = 0.3;
  if(eventType === 'Retreat') wastePerPersonFactor = 0.4;
  
  let landfillPct = 0.60;
  if(wasteToLandfill === 'None - all diverted') landfillPct = 0.00;
  if(wasteToLandfill === 'Most') landfillPct = 0.90;
  if(wasteToLandfill === 'Some') landfillPct = wasteSorted === 'yes' ? 0.20 : 0.60;
  
  const totalWasteKg = actualAttendees * eventDays * wastePerPersonFactor;
  const wasteEmissions = totalWasteKg * landfillPct * 0.6;
  
  const materialsResult = tablewareEmissions + printEmissions + wasteEmissions;

  // LOCAL TRANSPORT
  let avgDistance = 5;
  if(distanceFromBTS === 'Walking distance') avgDistance = 1;
  if(distanceFromBTS === '1-3km') avgDistance = 12;
  if(distanceFromBTS === 'Over 3km') avgDistance = 20;
  
  let transportEmissions = actualAttendees * avgDistance * (
    (transportSplit.public / 100 * 0.041) +
    (transportSplit.car / 100 * 0.171) +
    (transportSplit.taxi / 100 * 0.171)
  );
  if(shuttleProvided === 'yes') transportEmissions *= 0.60;
  const transportResult = transportEmissions;
  
  // LONG HAUL TRAVEL
  let travelTotal = null;
  let estimated = false;
  let travelNote = "Not captured for this event. Consider sending a post-event travel survey to attendees.";
  
  if (formData.intlPresent && internationalAttendees > 0 && internationalOrigins.length > 0) {
    const split = internationalAttendees / internationalOrigins.length;
    let calculatedTotal = 0;
    for(const origin of internationalOrigins) {
      if(origin === 'Southeast Asia') calculatedTotal += split * 180;
      else if(origin === 'East Asia') calculatedTotal += split * 420;
      else if(origin === 'Europe') calculatedTotal += split * 1800;
      else if(origin === 'Middle East') calculatedTotal += split * 900;
      else calculatedTotal += split * 600;
    }
    
    if (surveyResponseRate > 0) {
      const extrapolationFactor = 100 / surveyResponseRate;
      travelTotal = calculatedTotal * extrapolationFactor;
      estimated = true;
      travelNote = `Estimated from ${surveyResponseRate}% survey response rate`;
    } else {
      travelTotal = calculatedTotal;
      estimated = false;
      travelNote = "Calculated from organizer estimates";
    }
  }

  // SCORE
  const operationalTotal = venueEnergyResult + cateringResult + materialsResult + transportResult;
  let intensity = operationalTotal / (actualAttendees * eventDays);
  if (isNaN(intensity) || !isFinite(intensity)) intensity = 0;
  
  let rawScore = 100 - ((intensity / 8.5) * 50);
  let score = Math.round(Math.max(0, Math.min(100, rawScore)));
  if (isNaN(score)) score = 0;

  let tier = { label: 'High Impact Event', colorClass: 'text-[#DC2626]' };
  if(score >= 85) tier = { label: 'Leading Sustainable Event', colorClass: 'text-[#2E4036]' };
  else if(score >= 70) tier = { label: 'Well Managed', colorClass: 'text-[#2E4036]' };
  else if(score >= 50) tier = { label: 'Industry Average', colorClass: 'text-[#D4622A]' };

  // RECOMMENDATIONS
  const recommendations = [];
  const materialsImpact = Math.round((materialsResult / operationalTotal) * 0.15 * 100) || 1;
  const cateringImpact = Math.round((cateringResult / operationalTotal) * 0.10 * 100) || 1;
  const transportImpact = Math.round((transportResult / operationalTotal) * 0.40 * 100) || 1;
  const vegImpact = Math.round((cateringResult / operationalTotal) * 0.44 * 100) || 1;
  const energyImpact = Math.round((venueEnergyResult / operationalTotal) * 0.30 * 100) || 1;

  console.log("Recommendations logic reading formData:", {
    "formData.tableware": formData.tableware,
    "formData.localSourcing (actual field is localSourced)": formData.localSourced,
    "formData.distanceFromBTS (actual field is distanceBts)": formData.distanceBts,
    "formData.shuttle": formData.shuttle,
    "formData.mealType": formData.mealType,
    "formData.renewableEnergy (actual field is renewable)": formData.renewable
  });

  if (formData.tableware === 'Single-use plastic') {
    recommendations.push({
      text: "Switch to reusable tableware",
      impact: `~${materialsImpact}% total reduction`,
      action: "Partner with a tableware rental service — ceramic or glass items available from ฿X per piece in Bangkok"
    });
  }
  if (formData.localSourced === 'Under 25%' || formData.localSourced === '25-50%') {
    recommendations.push({
      text: "Increase local sourcing above 50%",
      impact: `~${cateringImpact}% total reduction`,
      action: "Brief your caterer to source ingredients from Talad Thai or Or Tor Kor market — within Bangkok, counts as local"
    });
  }
  if (formData.distanceBts === 'Over 3km' && !formData.shuttle) {
    recommendations.push({
      text: "Provide shuttle from nearest BTS",
      impact: `~${transportImpact}% total reduction`,
      action: "Arrange a shuttle from the nearest BTS station — most Bangkok hotels offer this as an add-on service"
    });
  }
  if (formData.mealType === 'Meat-heavy') {
    recommendations.push({
      text: "Shift toward mixed or vegetarian menu",
      impact: `~${vegImpact}% total reduction`,
      action: "Work with your caterer to offer a mixed menu with vegetarian as the default option — same cost, significantly lower footprint"
    });
  }
  if (formData.renewable === 'No') {
    recommendations.push({
      text: "Request renewable energy from venue",
      impact: `~${energyImpact}% total reduction`,
      action: "Ask your venue if they have solar or participate in a renewable energy certificate scheme — QSNCC and several Bangkok hotels already do"
    });
  }

  const originalLength = recommendations.length;
  const fallbackRecommendations = [
    {
      text: "Capture attendee travel data via a post-event survey to complete your Scope 3 picture",
      impact: "Upgrades long-haul travel from 'Not captured' to a disclosed figure, strengthening your IFRS S2 Scope 3 disclosure",
      action: "Send a 3-question survey to attendees within 48 hours of event end asking origin city and transport mode used"
    },
    {
      text: "Request actual kWh consumption data from your venue for the next event",
      impact: "Upgrades venue energy data quality from Estimated to Measured — the highest credibility tier for ESG auditors",
      action: "Ask the venue operations manager for a meter reading at event start and end, or request it from their BMS system"
    },
    {
      text: "Set a formal sustainability target for your next event",
      impact: "Enables year-on-year progress reporting in your CSR annual filing — a requirement under ISSB IFRS S1 strategy disclosure",
      action: "Commit to a specific score target or percentage emissions reduction before your next event and track it in Verdify"
    }
  ];

  while (recommendations.length < 3) {
    const next = fallbackRecommendations[recommendations.length - originalLength];
    if (next) recommendations.push(next);
    else break;
  }
  
  return {
    score,
    tier,
    breakdown: {
      venueEnergy: Math.round(venueEnergyResult),
      catering: Math.round(cateringResult),
      materials: Math.round(materialsResult),
      transport: Math.round(transportResult),
      total: Math.round(operationalTotal),
      intensity: intensity.toFixed(1)
    },
    travelDisclosure: {
      total: travelTotal !== null ? Math.round(travelTotal) : null,
      estimated,
      note: travelNote
    },
    recommendations: recommendations.slice(0, 5),
    totalMeals: Math.round(totalMeals),
    formData
  };
}
