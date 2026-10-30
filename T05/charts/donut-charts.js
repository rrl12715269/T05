const chartContainer = d3.select("#chart-2");

async function renderDonutChart() {
  try {
    const data = await loadDonutChartData();
    const chartData = data.filter((item) => Number.isFinite(item.value) && item.value > 0);

    if (chartData.length === 0) {
      throw new Error("The CSV contains no positive energy values.");
    }

    chartContainer.append("h2")
      .attr("class", "chart-title")
      .text("Mean energy use by screen type");

    const svg = chartContainer.append("svg")
      .attr("class", "donut-chart")
      .attr("viewBox", "0 0 420 250")
      .attr("role", "img")
      .attr("aria-label", "Mean annual TV energy consumption by screen type");

    const color = d3.scaleOrdinal()
      .domain(chartData.map((item) => item.screenType))
      .range(d3.schemeTableau10);
    const pie = d3.pie().sort(null).value((item) => item.value);
    const arc = d3.arc().innerRadius(52).outerRadius(88);
    const chart = svg.append("g").attr("transform", "translate(120,125)");

    chart.selectAll("path")
      .data(pie(chartData))
      .join("path")
      .attr("class", "donut-slice")
      .attr("d", arc)
      .attr("fill", (item) => color(item.data.screenType));

    const legend = svg.append("g").attr("transform", "translate(235,55)");
    const legendRows = legend.selectAll("g")
      .data(chartData)
      .join("g")
      .attr("transform", (_, index) => `translate(0,${index * 54})`);

    legendRows.append("rect")
      .attr("width", 12)
      .attr("height", 12)
      .attr("rx", 2)
      .attr("fill", (item) => color(item.screenType));

    legendRows.append("text")
      .attr("class", "donut-legend-label")
      .attr("x", 20)
      .attr("y", 10)
      .text((item) => item.screenType);

    legendRows.append("text")
      .attr("class", "donut-legend-value")
      .attr("x", 20)
      .attr("y", 29)
      .text((item) => `${d3.format(",.1f")(item.value)} kWh/year`);
  } catch (error) {
    console.error("Could not render the energy donut chart:", error);
    chartContainer.append("p")
      .attr("class", "chart-error")
      .text("Unable to load chart data.");
  }
}

renderDonutChart();