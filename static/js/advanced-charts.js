// Advanced Visualizations for VisaFlow Dashboard

class AdvancedCharts {
    constructor() {
        this.charts = {};
        this.tooltipDiv = null;
        this.initTooltip();
    }

    initTooltip() {
        // Create reusable tooltip if not exists
        if (!this.tooltipDiv) {
            this.tooltipDiv = d3.select('body')
                .append('div')
                .attr('class', 'advanced-tooltip')
                .style('position', 'fixed')
                .style('pointer-events', 'none')
                .style('opacity', 0);
        }
    }

    // 1. Bump Chart - Top Countries Over Time
    initBumpChart(elId, rows, { topN = 10 } = {}) {
        const parse = d3.timeParse("%Y-%m");
        const months = Array.from(new Set(rows.map(d => d.month))).sort();
        
        const byMonth = d3.rollup(rows, v => {
            const sorted = Array.from(d3.rollup(v, vv => d3.sum(vv, d => d.lodged), d => d.country))
                .sort((a, b) => d3.descending(a[1], b[1]))
                .slice(0, topN);
            const map = new Map(sorted.map(([c, val], i) => [c, { rank: i + 1, val }]));
            return map;
        }, d => d.month);

        const countries = Array.from(new Set(rows.map(d => d.country)))
            .filter(c => months.some(m => byMonth.get(m)?.has(c)));

        const el = document.getElementById(elId);
        el.innerHTML = "";
        const width = el.clientWidth, height = el.clientHeight || 360;
        const m = { t: 24, r: 120, b: 28, l: 40 };
        
        const svg = d3.select(el).append("svg")
            .attr("width", width)
            .attr("height", height);
        
        const g = svg.append("g")
            .attr("transform", `translate(${m.l},${m.t})`);
        
        const innerW = width - m.l - m.r;
        const innerH = height - m.t - m.b;

        const x = d3.scalePoint(months.map(parse), [0, innerW]).padding(0.4);
        const y = d3.scaleLinear().domain([topN + 0.5, 0.5]).range([innerH, 0]);

        const color = d3.scaleOrdinal()
            .domain(countries)
            .range(['#2563eb', '#06b6d4', '#059669', '#f59e0b', '#dc2626', '#7c3aed', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981']);

        // Build series for each country
        const series = countries.map(c => {
            const pts = months.map(m => {
                const rec = byMonth.get(m)?.get(c);
                return { x: parse(m), y: rec ? rec.rank : topN + 0.2, val: rec?.val ?? 0, country: c };
            });
            return { country: c, pts };
        });

        // Axes
        g.append("g")
            .attr("transform", `translate(0,${innerH})`)
            .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b %y")).tickSizeOuter(0))
            .attr("class", "x-axis");
        
        g.append("g")
            .call(d3.axisLeft(y).ticks(topN).tickFormat(d => d))
            .attr("class", "y-axis");

        const line = d3.line()
            .x(d => x(d.x))
            .y(d => y(d.y))
            .curve(d3.curveMonotoneX);

        const s = g.selectAll(".series")
            .data(series, d => d.country)
            .join(enter => {
                const s = enter.append("g").attr("class", "series");
                
                s.append("path")
                    .attr("fill", "none")
                    .attr("stroke", d => color(d.country))
                    .attr("stroke-width", 3)
                    .attr("d", d => line(d.pts))
                    .attr("stroke-dasharray", function() { 
                        const l = this.getTotalLength(); 
                        return `${l} ${l}`; 
                    })
                    .attr("stroke-dashoffset", function() { 
                        return this.getTotalLength(); 
                    })
                    .transition()
                    .duration(1000)
                    .attr("stroke-dashoffset", 0);
                
                // Labels at the right
                s.append("text")
                    .attr("x", innerW + 6)
                    .attr("y", d => y(d.pts[d.pts.length - 1].y))
                    .attr("dominant-baseline", "middle")
                    .attr("fill", d => color(d.country))
                    .attr("font-size", "12px")
                    .attr("font-weight", "500")
                    .text(d => d.country);
                
                return s;
            });

        // Hover dots
        s.selectAll("circle")
            .data(d => d.pts.map(p => ({ ...p, country: d.country })))
            .join("circle")
            .attr("r", 4)
            .attr("cx", d => x(d.x))
            .attr("cy", d => y(d.y))
            .attr("fill", d => color(d.country))
            .style("cursor", "pointer")
            .on("mousemove", (e, d) => {
                this.tooltipDiv
                    .style("opacity", 1)
                    .html(`<b>${d.country}</b><br>${d3.timeFormat("%b %Y")(d.x)}<br>Rank #${Math.floor(d.y)} • ${d.val.toLocaleString()} applications`)
                    .style("left", (e.clientX + 12) + "px")
                    .style("top", (e.clientY - 28) + "px");
            })
            .on("mouseleave", () => this.tooltipDiv.style("opacity", 0));

        this.charts.bump = { svg, data: series };
    }

    // 2. Chord Diagram - Country to Decision Flow
    initChordDiagram(elId, flows) {
        const el = document.getElementById(elId);
        el.innerHTML = "";
        const width = el.clientWidth || 500;
        const height = el.clientHeight || 500;
        const radius = Math.min(width, height) / 2 - 40;

        // Build matrix from flows
        const countries = Array.from(new Set(flows.map(f => f.country))).slice(0, 10);
        const decisions = ['Granted', 'Rejected'];
        const labels = [...countries, ...decisions];
        const n = labels.length;
        
        // Create matrix
        const matrix = Array(n).fill(null).map(() => Array(n).fill(0));
        
        flows.forEach(f => {
            const fromIdx = countries.indexOf(f.country);
            const toIdx = countries.length + (f.decision === 'Granted' ? 0 : 1);
            if (fromIdx >= 0 && fromIdx < countries.length) {
                matrix[fromIdx][toIdx] = f.count;
            }
        });

        const svg = d3.select(el).append("svg")
            .attr("width", width)
            .attr("height", height);
        
        const g = svg.append("g")
            .attr("transform", `translate(${width/2},${height/2})`);

        const chord = d3.chord()
            .padAngle(0.03)
            .sortSubgroups(d3.descending)(matrix);
        
        const color = d3.scaleOrdinal()
            .domain(labels)
            .range([...d3.schemeTableau10, '#059669', '#dc2626']);

        const arc = d3.arc()
            .innerRadius(radius)
            .outerRadius(radius + 20);
        
        const ribbon = d3.ribbon()
            .radius(radius);

        // Draw arcs
        g.append("g")
            .selectAll("path")
            .data(chord.groups)
            .join("path")
            .attr("fill", d => color(labels[d.index]))
            .attr("stroke", "#fff")
            .attr("d", arc)
            .on("mouseover", (e, d) => {
                this.tooltipDiv
                    .style("opacity", 1)
                    .html(`<b>${labels[d.index]}</b><br>Total: ${d3.format(",")(d.value)}`)
                    .style("left", (e.clientX + 12) + "px")
                    .style("top", (e.clientY - 28) + "px");
            })
            .on("mouseleave", () => this.tooltipDiv.style("opacity", 0));

        // Draw ribbons
        g.append("g")
            .attr("fill-opacity", 0.75)
            .selectAll("path")
            .data(chord)
            .join("path")
            .attr("d", ribbon)
            .attr("fill", d => color(labels[d.target.index]))
            .attr("stroke", "none")
            .on("mouseover", (e, d) => {
                this.tooltipDiv
                    .style("opacity", 1)
                    .html(`<b>${labels[d.source.index]} → ${labels[d.target.index]}</b><br>${d3.format(",")(d.source.value)} applications`)
                    .style("left", (e.clientX + 12) + "px")
                    .style("top", (e.clientY - 28) + "px");
            })
            .on("mouseleave", () => this.tooltipDiv.style("opacity", 0));

        // Add labels
        g.append("g")
            .selectAll("text")
            .data(chord.groups)
            .join("text")
            .each(d => { d.angle = (d.startAngle + d.endAngle) / 2; })
            .attr("dy", ".35em")
            .attr("transform", d => `
                rotate(${(d.angle * 180 / Math.PI - 90)})
                translate(${radius + 30})
                ${d.angle > Math.PI ? "rotate(180)" : ""}
            `)
            .attr("text-anchor", d => d.angle > Math.PI ? "end" : null)
            .text(d => labels[d.index])
            .style("font-size", "12px")
            .style("fill", "var(--text-primary)");

        this.charts.chord = { svg, data: chord };
    }

    // 3. Calendar Heatmap - Daily Activity
    initCalendarHeatmap(elId, rows) {
        const parse = d3.timeParse("%Y-%m-%d");
        const fmt = d3.timeFormat("%b %d, %Y");
        const data = rows.map(d => ({ date: parse(d.date), value: +d.count }));
        
        const el = document.getElementById(elId);
        el.innerHTML = "";
        const width = el.clientWidth;
        const cellSize = 16;
        const yearHeight = cellSize * 7 + 40;
        
        const years = d3.groups(data, d => d.date.getUTCFullYear());
        const height = years.length * yearHeight + 40;
        
        const svg = d3.select(el).append("svg")
            .attr("width", width)
            .attr("height", height);
        
        const g = svg.append("g")
            .attr("transform", "translate(40, 20)");

        const color = d3.scaleSequential(d3.interpolateBlues)
            .domain([0, d3.max(data, d => d.value)]);

        years.forEach(([year, yearData], yi) => {
            const yearG = g.append("g")
                .attr("transform", `translate(0, ${yi * yearHeight})`);
            
            yearG.append("text")
                .text(year)
                .attr("y", -6)
                .attr("fill", "var(--text-primary)")
                .style("font-weight", 600)
                .style("font-size", "14px");

            // Month labels
            const months = d3.timeMonth.range(new Date(year, 0, 1), new Date(year + 1, 0, 1));
            yearG.selectAll(".month-label")
                .data(months)
                .join("text")
                .attr("x", d => d3.timeWeek.count(d3.timeYear(d), d) * cellSize)
                .attr("y", -8)
                .text(d => d3.timeFormat("%b")(d))
                .style("font-size", "10px")
                .style("fill", "var(--text-muted)");

            // Day cells
            const days = d3.timeDays(new Date(year, 0, 1), new Date(year + 1, 0, 1));
            yearG.selectAll("rect.day")
                .data(days)
                .join("rect")
                .attr("width", cellSize - 2)
                .attr("height", cellSize - 2)
                .attr("rx", 3)
                .attr("x", d => d3.timeWeek.count(d3.timeYear(d), d) * cellSize)
                .attr("y", d => d.getDay() * cellSize)
                .attr("fill", d => {
                    const dayData = yearData.find(v => +v.date === +d);
                    return dayData ? color(dayData.value) : "#f3f4f6";
                })
                .style("cursor", "pointer")
                .on("mousemove", (e, d) => {
                    const dayData = yearData.find(v => +v.date === +d);
                    const value = dayData ? dayData.value : 0;
                    this.tooltipDiv
                        .style("opacity", 1)
                        .html(`${fmt(d)}<br><b>${value.toLocaleString()}</b> applications`)
                        .style("left", (e.clientX + 12) + "px")
                        .style("top", (e.clientY - 28) + "px");
                })
                .on("mouseleave", () => this.tooltipDiv.style("opacity", 0));
        });

        // Add day labels
        const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        g.selectAll(".day-label")
            .data(dayLabels)
            .join("text")
            .attr("x", -10)
            .attr("y", (d, i) => i * cellSize + cellSize / 2)
            .attr("text-anchor", "end")
            .attr("dominant-baseline", "middle")
            .text(d => d)
            .style("font-size", "10px")
            .style("fill", "var(--text-muted)");

        this.charts.calendar = { svg, data };
    }

    // 4. Waterfall Chart - Pipeline Delta
    initWaterfall(elId, steps) {
        const el = document.getElementById(elId);
        el.innerHTML = "";
        const width = el.clientWidth;
        const height = el.clientHeight || 300;
        const m = { t: 24, r: 16, b: 60, l: 80 };
        
        const svg = d3.select(el).append("svg")
            .attr("width", width)
            .attr("height", height);
        
        const g = svg.append("g")
            .attr("transform", `translate(${m.l},${m.t})`);
        
        const innerW = width - m.l - m.r;
        const innerH = height - m.t - m.b;

        // Compute cumulative values
        let cumulative = 0;
        const bars = steps.map((s, i) => {
            const y0 = cumulative;
            cumulative += s.value;
            return { label: s.label, y0, y1: cumulative, change: s.value, isTotal: s.isTotal };
        });

        const x = d3.scaleBand()
            .domain(bars.map(d => d.label))
            .range([0, innerW])
            .padding(0.35);
        
        const y = d3.scaleLinear()
            .domain([0, d3.max(bars, d => Math.max(d.y0, d.y1))])
            .nice()
            .range([innerH, 0]);

        // Axes
        g.append("g")
            .attr("transform", `translate(0,${innerH})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-45)");
        
        g.append("g")
            .call(d3.axisLeft(y).ticks(6).tickFormat(d3.format(",d")));

        // Color function
        const color = d => {
            if (d.isTotal) return "var(--accent-blue)";
            return d.change >= 0 ? "var(--accent-green)" : "var(--accent-red)";
        };

        // Draw bars
        g.selectAll("rect.bar")
            .data(bars)
            .join("rect")
            .attr("x", d => x(d.label))
            .attr("width", x.bandwidth())
            .attr("y", d => y(Math.max(d.y0, d.y1)))
            .attr("height", 0)
            .attr("fill", color)
            .attr("rx", 6)
            .style("cursor", "pointer")
            .on("mouseover", (e, d) => {
                this.tooltipDiv
                    .style("opacity", 1)
                    .html(`<b>${d.label}</b><br>${d.change >= 0 ? '+' : ''}${d3.format(",")(d.change)}<br>Total: ${d3.format(",")(d.y1)}`)
                    .style("left", (e.clientX + 12) + "px")
                    .style("top", (e.clientY - 28) + "px");
            })
            .on("mouseleave", () => this.tooltipDiv.style("opacity", 0))
            .transition()
            .duration(800)
            .delay((d, i) => i * 100)
            .attr("height", d => Math.abs(y(d.y0) - y(d.y1)));

        // Add connecting lines
        g.selectAll("line.connector")
            .data(bars.slice(0, -1))
            .join("line")
            .attr("x1", d => x(d.label) + x.bandwidth())
            .attr("x2", (d, i) => x(bars[i + 1].label))
            .attr("y1", d => y(d.y1))
            .attr("y2", d => y(d.y1))
            .attr("stroke", "var(--text-muted)")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "3,3")
            .style("opacity", 0)
            .transition()
            .duration(800)
            .delay((d, i) => (i + 1) * 100)
            .style("opacity", 1);

        // Value labels
        g.selectAll("text.value")
            .data(bars)
            .join("text")
            .attr("x", d => x(d.label) + x.bandwidth() / 2)
            .attr("y", d => y(Math.max(d.y0, d.y1)) - 5)
            .attr("text-anchor", "middle")
            .attr("fill", "var(--text-primary)")
            .style("font-size", "12px")
            .style("font-weight", "600")
            .text(d => d3.format(".1s")(d.change))
            .style("opacity", 0)
            .transition()
            .duration(800)
            .delay((d, i) => i * 100)
            .style("opacity", 1);

        this.charts.waterfall = { svg, data: bars };
    }

    // 5. Ridgeline Chart - Processing Time Distributions
    initRidgeline(elId, rows) {
        const el = document.getElementById(elId);
        el.innerHTML = "";
        const width = el.clientWidth;
        const height = el.clientHeight || 440;
        const m = { t: 24, r: 16, b: 30, l: 100 };
        
        const svg = d3.select(el).append("svg")
            .attr("width", width)
            .attr("height", height);
        
        const g = svg.append("g")
            .attr("transform", `translate(${m.l},${m.t})`);
        
        const innerW = width - m.l - m.r;
        const innerH = height - m.t - m.b;

        // Get unique groups and limit to top 10
        const groupData = d3.groups(rows, d => d.group)
            .map(([key, values]) => ({
                group: key,
                values: values.map(d => d.days),
                mean: d3.mean(values, d => d.days)
            }))
            .sort((a, b) => d3.descending(a.values.length, b.values.length))
            .slice(0, 10);

        const x = d3.scaleLinear()
            .domain(d3.extent(rows, d => d.days))
            .nice()
            .range([0, innerW]);
        
        const y = d3.scaleBand()
            .domain(groupData.map(d => d.group))
            .range([0, innerH])
            .padding(0.8);

        // Axes
        g.append("g")
            .attr("transform", `translate(0,${innerH})`)
            .call(d3.axisBottom(x).tickFormat(d => d + "d"));
        
        g.append("g")
            .call(d3.axisLeft(y));

        // KDE function
        function kernelDensityEstimator(kernel, X) {
            return function(V) {
                return X.map(function(x) {
                    return [x, d3.mean(V, function(v) { return kernel(x - v); })];
                });
            };
        }
        
        function kernelEpanechnikov(k) {
            return function(v) {
                return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
            };
        }

        // Prepare the data for the ridgeline
        const kde = kernelDensityEstimator(kernelEpanechnikov(7), x.ticks(50));
        const allDensity = groupData.map(d => ({
            group: d.group,
            density: kde(d.values)
        }));

        // Color scale
        const color = d3.scaleSequential(d3.interpolateViridis)
            .domain([0, groupData.length]);

        // Add areas
        allDensity.forEach((d, i) => {
            const maxDensity = d3.max(d.density, p => p[1]);
            const yScale = d3.scaleLinear()
                .domain([0, maxDensity])
                .range([0, y.bandwidth()]);

            const area = d3.area()
                .curve(d3.curveBasis)
                .x(p => x(p[0]))
                .y0(y(d.group) + y.bandwidth())
                .y1(p => y(d.group) + y.bandwidth() - yScale(p[1]));

            g.append("path")
                .datum(d.density)
                .attr("fill", color(i))
                .attr("fill-opacity", 0.7)
                .attr("stroke", color(i))
                .attr("stroke-width", 1)
                .attr("d", area)
                .on("mouseover", (e) => {
                    const groupInfo = groupData.find(g => g.group === d.group);
                    this.tooltipDiv
                        .style("opacity", 1)
                        .html(`<b>${d.group}</b><br>Mean: ${groupInfo.mean.toFixed(1)} days<br>Count: ${groupInfo.values.length}`)
                        .style("left", (e.clientX + 12) + "px")
                        .style("top", (e.clientY - 28) + "px");
                })
                .on("mouseleave", () => this.tooltipDiv.style("opacity", 0));
        });

        this.charts.ridgeline = { svg, data: allDensity };
    }

    // 6. Simple 3D Globe Visualization
    async initSimpleGlobe(elId, flows) {
        const el = document.getElementById(elId);
        el.innerHTML = "";
        
        // For now, create a simulated 3D effect with SVG
        const width = el.clientWidth || 500;
        const height = el.clientHeight || 500;
        const radius = Math.min(width, height) / 2.5;
        
        const svg = d3.select(el).append("svg")
            .attr("width", width)
            .attr("height", height);
        
        const g = svg.append("g")
            .attr("transform", `translate(${width/2},${height/2})`);

        // Draw globe background
        const globe = g.append("circle")
            .attr("r", radius)
            .attr("fill", "url(#globeGradient)")
            .attr("stroke", "var(--accent-blue)")
            .attr("stroke-width", 2);

        // Define gradient for globe effect
        const defs = svg.append("defs");
        const gradient = defs.append("radialGradient")
            .attr("id", "globeGradient")
            .attr("cx", "30%")
            .attr("cy", "30%");
        
        gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#e0f2fe");
        
        gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#0369a1");

        // Add Australia marker
        const australiaX = radius * 0.3;
        const australiaY = radius * 0.1;
        
        g.append("circle")
            .attr("cx", australiaX)
            .attr("cy", australiaY)
            .attr("r", 8)
            .attr("fill", "var(--accent-red)")
            .attr("stroke", "white")
            .attr("stroke-width", 2);

        // Add country arcs
        flows.slice(0, 10).forEach((flow, i) => {
            const angle = (i / flows.length) * 2 * Math.PI;
            const startX = Math.cos(angle) * radius * 0.8;
            const startY = Math.sin(angle) * radius * 0.8;
            
            // Create curved path to Australia
            const path = g.append("path")
                .attr("d", `M ${startX} ${startY} Q 0 ${-radius * 0.5} ${australiaX} ${australiaY}`)
                .attr("stroke", "var(--accent-cyan)")
                .attr("stroke-width", Math.log(flow.count) * 0.5)
                .attr("fill", "none")
                .attr("stroke-opacity", 0.7)
                .attr("stroke-dasharray", "5,5");

            // Animate the arc
            const pathLength = path.node().getTotalLength();
            path.attr("stroke-dasharray", `0,${pathLength}`)
                .transition()
                .duration(2000)
                .delay(i * 200)
                .attr("stroke-dasharray", `${pathLength/4},${pathLength}`);

            // Add origin marker
            g.append("circle")
                .attr("cx", startX)
                .attr("cy", startY)
                .attr("r", 4)
                .attr("fill", "var(--accent-orange)")
                .attr("stroke", "white")
                .attr("stroke-width", 1)
                .style("cursor", "pointer")
                .on("mouseover", (e) => {
                    this.tooltipDiv
                        .style("opacity", 1)
                        .html(`<b>${flow.country}</b><br>${flow.count.toLocaleString()} applications`)
                        .style("left", (e.clientX + 12) + "px")
                        .style("top", (e.clientY - 28) + "px");
                })
                .on("mouseleave", () => this.tooltipDiv.style("opacity", 0));
        });

        // Add rotation animation
        let rotation = 0;
        setInterval(() => {
            rotation += 0.5;
            g.attr("transform", `translate(${width/2},${height/2}) rotate(${rotation})`);
        }, 100);

        this.charts.globe = { svg, data: flows };
    }

    // Update all charts with new data
    updateAll(data) {
        Object.keys(this.charts).forEach(chartType => {
            if (this.charts[chartType] && this.charts[chartType].update) {
                this.charts[chartType].update(data[chartType]);
            }
        });
    }

    // Destroy all charts
    destroy() {
        Object.values(this.charts).forEach(chart => {
            if (chart.svg) {
                chart.svg.remove();
            }
        });
        this.charts = {};
    }
}

const advancedCharts = new AdvancedCharts();