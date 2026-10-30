async function loadDonutChartData() {
  const energyField = "Mean(Labelled energy consumption (kWh/year))";
  return d3.csv(
    "data/Ex5_TV_energy_Allsizes_byScreenType.csv",
    (row) => ({
      screenType: row.Screen_Tech,
      value: Number(row[energyField]),
    }),
  );
}

async function loadSpotPriceData() {
  const priceFields = [
    "Queensland ($ per megawatt hour)",
    "New South Wales ($ per megawatt hour)",
    "Victoria ($ per megawatt hour)",
    "South Australia ($ per megawatt hour)",
    "Tasmania ($ per megawatt hour)",
    "Snowy ($ per megawatt hour)",
  ];

  return d3.csv("data/Ex5_ARE_Spot_Prices.csv", (row) => {
    const prices = {};
    priceFields.forEach((field) => {
      const region = field.replace(" ($ per megawatt hour)", "");
      prices[region] = row[field].trim() === "" ? null : Number(row[field]);
    });
    return { year: Number(row.Year), prices };
  });
}

async function loadTvEnergyData() {
  return d3.csv("data/Ex5_TV_energy.csv", (row) => ({
    starRating: row.star2.trim() === "" ? null : Number(row.star2),
    energyConsumption: row.energy_consumpt.trim() === "" ? null : Number(row.energy_consumpt),
  }));
}

async function load55InchTvEnergyByScreenType() {
  const energyField = "Mean(Labelled energy consumption (kWh/year))";
  return d3.csv(
    "data/Ex5_TV_energy_55inchtv_byScreenType.csv",
    (row) => ({
      screenTech: row.Screen_Tech,
      meanEnergyConsumption: Number(row[energyField]),
    }),
  );
}