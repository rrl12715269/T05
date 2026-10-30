const lineChartContainer = d3.select("#chart-4");

async function renderSpotPriceLineChart() {
  try {
    const data = await loadSpotPriceData();
    const chartData = data.filter((row) => Number.isFinite(row.year));

    if (chartData.length < 2) {
      throw new Error("The CSV contains too few valid years to draw a line chart.");
    }

    const regionNames = Object.keys(chartData[0].prices);
    const series = regionNames.map((name) => ({
      name,
      values: chartData.map((row) => ({ year: row.year, value: row.prices[name] })),
    }));
    const maxPrice = d3.max(series, (line) => d3.max(line.values, (point) => point.value));
    const colors = d3.scaleOrdinal()
      .domain(series.map((line) => line.name))
      .range(d3.schemeTableau10);

    lineChartContainer.append("h2")
      .attr("class", "chart-title")
      .text("Annual wholesale spot prices by region");

    const width = 760;
    const height = 360;
    const margin = { top: 14, right: 18, bottom: 92, left: 58 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    const x = d3.scaleLinear()
      .domain(d3.extent(chartData, (row) => row.year))
      .range([0, plotWidth]);
    const y = d3.scaleLinear()
      .domain([0, maxPrice])
      .nice()
      .range([plotHeight, 0]);

    const svg = lineChartContainer.append("svg")
      .attr("class", "line-chart")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("role", "img")
      .attr("aria-label", "Annual electricity spot prices in dollars per megawatt hour by Australian region");
    const plot = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    plot.append("g")
      .attr("class", "line-axis line-grid")
      .call(d3.axisLeft(y).ticks(5).tickSize(-plotWidth).tickFormat((value) => `$${value}`));

    plot.append("g")
      .attr("class", "line-axis")
      .attr("transform", `translate(0,${plotHeight})`)
      .call(d3.axisBottom(x).ticks(7).tickFormat(d3.format("d")));

    const line = d3.line()
      .defined((point) => Number.isFinite(point.value))
      .x((point) => x(point.year))
      .y((point) => y(point.value));

    plot.selectAll("path.line-series")
      .data(series)
      .join("path")
      .attr("class", "line-series")
      .attr("stroke", (item) => colors(item.name))
      .attr("d", (item) => line(item.values));

    svg.append("text")
      .attr("class", "line-axis")
      .attr("transform", `translate(16,${margin.top + plotHeight / 2}) rotate(-90)`)
      .attr("text-anchor", "middle")
      .attr("fill", "#52616d")
      .attr("font-size", 11)
      .text("Price ($/MWh)");

    const legend = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top + plotHeight + 42})`);
    const legendItems = legend.selectAll("g")
      .data(series)
      .join("g")
      .attr("transform", (_, index) => `translate(${(index % 3) * 225},${Math.floor(index / 3) * 25})`);

    legendItems.append("line")
      .attr("class", "line-legend-swatch")
      .attr("x1", 0)
      .attr("x2", 16)
      .attr("y1", 0)
      .attr("y2", 0)
      .attr("stroke", (item) => colors(item.name));

    legendItems.append("text")
      .attr("class", "line-legend-label")
      .attr("x", 22)
      .attr("y", 4)
      .text((item) => item.name);
  } catch (error) {
    console.error("Could not render the spot-price line chart:", error);
    lineChartContainer.append("p")
      .attr("class", "chart-error")
      .text("Unable to load chart data.");
  }
}

renderSpotPriceLineChart();