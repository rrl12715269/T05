const scatterChartContainer = d3.select("#chart-1");

async function renderScatterChart() {
  try {
    const data = await loadTvEnergyData();
    const chartData = data.filter((item) =>
      Number.isFinite(item.starRating)
      && Number.isFinite(item.energyConsumption)
      && item.starRating > 0
      && item.energyConsumption > 0,
    );

    if (chartData.length === 0) {
      throw new Error("The CSV contains no valid star-rating and energy values.");
    }

    scatterChartContainer.append("h2")
      .attr("class", "chart-title")
      .text("Energy consumption by star rating");

    const width = 760;
    const height = 360;
    const margin = { top: 14, right: 24, bottom: 56, left: 64 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    const x = d3.scaleLinear()
      .domain(d3.extent(chartData, (item) => item.starRating))
      .nice()
      .range([0, plotWidth]);
    const y = d3.scaleLinear()
      .domain([0, d3.max(chartData, (item) => item.energyConsumption)])
      .nice()
      .range([plotHeight, 0]);

    const svg = scatterChartContainer.append("svg")
      .attr("class", "scatter-chart")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("role", "img")
      .attr("aria-label", "TV energy consumption by energy-efficiency star rating");
    const plot = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    plot.append("g")
      .attr("class", "scatter-axis scatter-grid")
      .call(d3.axisLeft(y).ticks(5).tickSize(-plotWidth));

    plot.append("g")
      .attr("class", "scatter-axis")
      .attr("transform", `translate(0,${plotHeight})`)
      .call(d3.axisBottom(x).ticks(6));

    plot.selectAll("circle")
      .data(chartData)
      .join("circle")
      .attr("class", "scatter-point")
      .attr("cx", (item) => x(item.starRating))
      .attr("cy", (item) => y(item.energyConsumption))
      .attr("r", 4)
      .attr("fill", "#087e8b")
      .append("title")
      .text((item) => `Star rating: ${item.starRating}\nEnergy consumption: ${d3.format(",.1f")(item.energyConsumption)} kW/h`);

    svg.append("text")
      .attr("class", "scatter-axis-label")
      .attr("x", margin.left + plotWidth / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .text("Star Rating (Energy Efficiency)");

    svg.append("text")
      .attr("class", "scatter-axis-label")
      .attr("transform", `translate(16,${margin.top + plotHeight / 2}) rotate(-90)`)
      .attr("text-anchor", "middle")
      .text("Energy Consumption (kW/h)");
  } catch (error) {
    console.error("Could not render the TV energy scatter plot:", error);
    scatterChartContainer.append("p")
      .attr("class", "chart-error")
      .text("Unable to load chart data.");
  }
}

renderScatterChart();