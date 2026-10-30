const barChartContainer = d3.select("#chart-3");

async function renderBarChart() {
  try {
    const data = await load55InchTvEnergyByScreenType();
    const chartData = data.filter((item) =>
      item.screenTech
      && Number.isFinite(item.meanEnergyConsumption),
    );

    if (chartData.length === 0) {
      throw new Error("The CSV contains no valid mean energy values.");
    }

    barChartContainer.append("h2")
      .attr("class", "chart-title")
      .text("55-inch TV energy consumption by screen technology");

    const width = 760;
    const height = 360;
    const margin = { top: 18, right: 24, bottom: 64, left: 68 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    const x = d3.scaleBand()
      .domain(chartData.map((item) => item.screenTech))
      .range([0, plotWidth])
      .padding(0.3);
    const y = d3.scaleLinear()
      .domain([0, d3.max(chartData, (item) => item.meanEnergyConsumption)])
      .nice()
      .range([plotHeight, 0]);
    const color = d3.scaleOrdinal()
      .domain(chartData.map((item) => item.screenTech))
      .range(d3.schemeTableau10);

    const svg = barChartContainer.append("svg")
      .attr("class", "bar-chart")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("role", "img")
      .attr("aria-label", "Mean energy consumption in kilowatt-hours per year by screen technology");
    const plot = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    plot.append("g")
      .attr("class", "bar-axis bar-grid")
      .call(d3.axisLeft(y).ticks(5).tickSize(-plotWidth));

    plot.append("g")
      .attr("class", "bar-axis")
      .attr("transform", `translate(0,${plotHeight})`)
      .call(d3.axisBottom(x));

    plot.selectAll("rect")
      .data(chartData)
      .join("rect")
      .attr("class", "bar-mark")
      .attr("x", (item) => x(item.screenTech))
      .attr("y", (item) => y(item.meanEnergyConsumption))
      .attr("width", x.bandwidth())
      .attr("height", (item) => plotHeight - y(item.meanEnergyConsumption))
      .attr("fill", (item) => color(item.screenTech));

    plot.selectAll("text.bar-value")
      .data(chartData)
      .join("text")
      .attr("class", "bar-value")
      .attr("x", (item) => x(item.screenTech) + x.bandwidth() / 2)
      .attr("y", (item) => y(item.meanEnergyConsumption) - 8)
      .text((item) => d3.format(",.1f")(item.meanEnergyConsumption));

    svg.append("text")
      .attr("class", "bar-axis-label")
      .attr("x", margin.left + plotWidth / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .text("Screen Technology");

    svg.append("text")
      .attr("class", "bar-axis-label")
      .attr("transform", `translate(16,${margin.top + plotHeight / 2}) rotate(-90)`)
      .attr("text-anchor", "middle")
      .text("Mean Energy Consumption (kWh/year)");
  } catch (error) {
    console.error("Could not render the TV energy bar chart:", error);
    barChartContainer.append("p")
      .attr("class", "chart-error")
      .text("Unable to load chart data.");
  }
}

renderBarChart();