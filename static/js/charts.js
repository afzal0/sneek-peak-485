class ChartManager {
    constructor() {
        this.charts = {};
        this.currentFilter = 'all';
        // Detect theme and use appropriate colors
        const theme = document.body.getAttribute('data-theme') || 'light';
        
        this.colors = theme === 'light' ? {
            // Light theme colors
            primary: '#ffffff',
            secondary: '#f7f8fb',
            background: 'rgba(255, 255, 255, 0.9)',
            blue: '#2563eb',
            blueFocus: '#1d4ed8',
            orange: '#f59e0b',
            green: '#059669',
            purple: '#7c3aed',
            red: '#dc2626',
            cyan: '#06b6d4',
            text: '#111827',
            textSecondary: '#4b5563',
            textMuted: '#9ca3af',
            border: 'rgba(0, 0, 0, 0.08)',
            palette: ['#2563eb', '#06b6d4', '#059669', '#f59e0b', '#dc2626', '#7c3aed', '#ec4899']
        } : {
            // Dark theme colors (original)
            primary: '#1A1F37',
            secondary: '#0B1437',
            background: 'rgba(17, 25, 40, 0.65)',
            blue: '#0E4EFF',
            blueFocus: '#214CFF',
            orange: '#FDD447',
            green: '#13CF6E',
            purple: '#8B5CF6',
            red: '#EA2B2B',
            cyan: '#21D4FD',
            text: 'rgba(255, 255, 255, 0.8)',
            textSecondary: 'rgba(255, 255, 255, 0.6)',
            textMuted: 'rgba(255, 255, 255, 0.4)',
            border: 'rgba(255, 255, 255, 0.12)',
            palette: ['#0E4EFF', '#21D4FD', '#13CF6E', '#FDD447', '#EA2B2B', '#8B5CF6', '#FF6B35']
        };
    }

    // Tab 1: Overview Chart
    createOverviewChart(ctx, data) {
        if (this.charts.overview) {
            this.charts.overview.destroy();
        }

        // Create gradient backgrounds
        const gradientLodged = ctx.createLinearGradient(0, 0, 0, 350);
        gradientLodged.addColorStop(0, this.colors.blue + '60');
        gradientLodged.addColorStop(1, this.colors.blue + '10');
        
        const gradientGranted = ctx.createLinearGradient(0, 0, 0, 350);
        gradientGranted.addColorStop(0, this.colors.green + '60');
        gradientGranted.addColorStop(1, this.colors.green + '10');

        const chartData = {
            labels: data.yearly_data.map(d => d.year),
            datasets: [
                {
                    label: 'Visas Lodged',
                    data: data.yearly_data.map(d => d.lodged),
                    borderColor: this.colors.blue,
                    backgroundColor: gradientLodged,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: this.colors.blue,
                    pointBorderColor: this.colors.text,
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    borderWidth: 3
                },
                {
                    label: 'Visas Granted',
                    data: data.yearly_data.map(d => d.granted),
                    borderColor: this.colors.green,
                    backgroundColor: gradientGranted,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: this.colors.green,
                    pointBorderColor: this.colors.text,
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    borderWidth: 3
                }
            ]
        };

        this.charts.overview = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 800,
                    easing: 'easeOutQuart',
                    delay: (context) => {
                        let delay = 0;
                        if (context.type === 'data' && context.mode === 'default') {
                            delay = context.dataIndex * 50 + context.datasetIndex * 100;
                        }
                        return delay;
                    }
                },
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        position: 'top',
                        align: 'end',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            color: this.colors.text,
                            font: {
                                size: 12,
                                weight: '600'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: this.colors.secondary,
                        titleColor: this.colors.text,
                        bodyColor: this.colors.text,
                        borderColor: this.colors.border,
                        borderWidth: 1,
                        cornerRadius: 8,
                        titleFont: {
                            size: 13,
                            weight: '600'
                        },
                        bodyFont: {
                            size: 12
                        },
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + context.parsed.y.toLocaleString();
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: this.colors.border,
                            drawBorder: false
                        },
                        ticks: {
                            font: {
                                size: 11
                            },
                            color: this.colors.textSecondary,
                            callback: function(value) {
                                return (value / 1000) + 'K';
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 11
                            },
                            color: this.colors.textSecondary
                        }
                    }
                }
            }
        });
    }

    // Tab 2: Gender Chart
    createGenderChart(ctx, data) {
        if (this.charts.gender) {
            this.charts.gender.destroy();
        }

        const chartData = {
            labels: data.map(d => d.gender),
            datasets: [{
                data: data.map(d => d.count),
                backgroundColor: [this.colors.blue, this.colors.cyan],
                borderWidth: 0,
                hoverBorderWidth: 2,
                hoverBorderColor: this.colors.text
            }]
        };

        this.charts.gender = new Chart(ctx, {
            type: 'doughnut',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 15,
                            color: this.colors.text,
                            font: {
                                size: 11,
                                weight: '500'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: this.colors.secondary,
                        titleColor: this.colors.text,
                        bodyColor: this.colors.text,
                        borderColor: this.colors.border,
                        borderWidth: 1,
                        cornerRadius: 6,
                        padding: 10,
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return context.label + ': ' + context.parsed.toLocaleString() + ' (' + percentage + '%)';
                            }
                        }
                    }
                }
            }
        });
    }

    // Tab 2: Applicant Type Chart
    createApplicantTypeChart(ctx, data) {
        if (this.charts.applicantType) {
            this.charts.applicantType.destroy();
        }

        const chartData = {
            labels: data.map(d => d.type),
            datasets: [{
                data: data.map(d => d.count),
                backgroundColor: [this.colors.green, this.colors.orange],
                borderWidth: 0,
                hoverBorderWidth: 2,
                hoverBorderColor: this.colors.text
            }]
        };

        this.charts.applicantType = new Chart(ctx, {
            type: 'doughnut',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 15,
                            color: this.colors.text,
                            font: {
                                size: 11,
                                weight: '500'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: this.colors.secondary,
                        titleColor: this.colors.text,
                        bodyColor: this.colors.text,
                        borderColor: this.colors.border,
                        borderWidth: 1,
                        cornerRadius: 6,
                        padding: 10,
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return context.label + ': ' + context.parsed.toLocaleString() + ' (' + percentage + '%)';
                            }
                        }
                    }
                }
            }
        });
    }

    // Tab 2: Treemap
    createTreemap(container, data) {
        console.log('Creating treemap with data:', data);
        console.log('Container dimensions:', container.clientWidth, container.clientHeight);
        
        // Clear container
        d3.select(container).selectAll('*').remove();

        const width = container.clientWidth || 600;
        const height = (container.clientHeight || 400) - 60; // Account for title and padding

        const svg = d3.select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        // Create hierarchy
        const root = d3.hierarchy({children: data})
            .sum(d => d.lodged)
            .sort((a, b) => b.value - a.value);

        // Create treemap layout
        d3.treemap()
            .size([width, height])
            .paddingInner(2)
            .paddingOuter(2)(root);

        // Color scale
        const colorScale = d3.scaleSequential()
            .domain([0, d3.max(data, d => d.lodged)])
            .interpolator(d3.interpolateBlues);

        // Create rectangles
        const nodes = svg.selectAll('g')
            .data(root.leaves())
            .enter()
            .append('g')
            .attr('transform', d => `translate(${d.x0},${d.y0})`);

        nodes.append('rect')
            .attr('class', 'country-rect')
            .attr('width', d => d.x1 - d.x0)
            .attr('height', d => d.y1 - d.y0)
            .attr('fill', d => colorScale(d.data.lodged))
            .on('mouseover', function(event, d) {
                d3.select(this).style('opacity', 0.8);
                showTreemapTooltip(event, d);
            })
            .on('mouseout', function() {
                d3.select(this).style('opacity', 1);
                hideTreemapTooltip();
            });

        // Add text labels
        nodes.append('text')
            .attr('x', 6)
            .attr('y', 20)
            .text(d => {
                const width = d.x1 - d.x0;
                const name = d.data.country;
                if (width < 80) return '';
                return name.length > 10 && width < 120 ? name.substring(0, 8) + '...' : name;
            })
            .attr('font-size', d => {
                const width = d.x1 - d.x0;
                return Math.min(12, Math.max(8, width / 10)) + 'px';
            })
            .attr('fill', '#ffffff')
            .attr('font-weight', '600')
            .style('pointer-events', 'none');

        // Tooltip
        const tooltip = d3.select('body')
            .append('div')
            .attr('class', 'treemap-tooltip')
            .style('opacity', 0)
            .style('position', 'absolute')
            .style('background', '#1f2937')
            .style('color', 'white')
            .style('padding', '8px 12px')
            .style('border-radius', '6px')
            .style('font-size', '12px')
            .style('pointer-events', 'none')
            .style('z-index', '1000');

        function showTreemapTooltip(event, d) {
            tooltip.transition().duration(200).style('opacity', 1);
            tooltip.html(`
                <strong>${d.data.country}</strong><br/>
                Lodged: ${d.data.lodged.toLocaleString()}<br/>
                Granted: ${d.data.granted.toLocaleString()}<br/>
                Success Rate: ${((d.data.granted / d.data.lodged) * 100).toFixed(1)}%
            `)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');
        }

        function hideTreemapTooltip() {
            tooltip.transition().duration(200).style('opacity', 0);
        }
    }

    // Tab 3: World Map - Fixed version
    async createWorldMap(container, data) {
        const width = container.clientWidth || 800;
        const height = container.clientHeight || 500;

        // Clear container and remove any existing tooltips
        d3.select(container).selectAll('*').remove();
        d3.selectAll('.map-tooltip').remove();

        const svg = d3.select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        const g = svg.append('g');

        try {
            // Load world topology
            const world = await d3.json('https://unpkg.com/world-atlas@2/countries-110m.json');
            const countries = topojson.feature(world, world.objects.countries).features;

            // Create country data map
            const countryDataMap = {};
            data.forEach(d => {
                // Map both ISO codes and country names for better matching
                countryDataMap[d.iso_code] = d.lodged || 0;
                countryDataMap[d.country] = d.lodged || 0;
                // Also map common variations
                if (d.country === 'United States') countryDataMap['United States of America'] = d.lodged;
                if (d.country === 'United Kingdom') countryDataMap['United Kingdom of Great Britain and Northern Ireland'] = d.lodged;
            });

            // Color scale with light theme appropriate colors
            const extent = d3.extent(Object.values(countryDataMap));
            const colorScale = d3.scaleSequential(d3.interpolateOranges)
                .domain([0, extent[1] || 1]);

            // Projection
            const projection = d3.geoNaturalEarth1()
                .fitSize([width, height], {type: 'Sphere'});
            const path = d3.geoPath(projection);

            // Draw sphere background
            g.append('path')
                .datum({type: 'Sphere'})
                .attr('d', path)
                .attr('fill', '#eef2ff')
                .attr('stroke', '#e5e7eb');

            // Use existing tooltip or create new one
            let tooltip = d3.select('#country-tooltip');
            if (tooltip.empty()) {
                tooltip = d3.select('body')
                    .append('div')
                    .attr('id', 'country-tooltip')
                    .attr('class', 'tooltip');
            }

            // Draw countries
            g.selectAll('path.country')
                .data(countries)
                .join('path')
                .attr('class', 'world-country')
                .attr('d', path)
                .attr('fill', d => {
                    const value = countryDataMap[d.properties.ISO_A3] || 
                                  countryDataMap[d.properties.NAME] || 
                                  countryDataMap[d.properties.name] || 0;
                    return value > 0 ? colorScale(value) : '#f3f4f6';
                })
                .attr('stroke', 'white')
                .attr('stroke-width', 0.5)
                .on('mousemove', function(event, d) {
                    const countryName = d.properties.NAME || d.properties.name;
                    const value = countryDataMap[d.properties.ISO_A3] || 
                                  countryDataMap[countryName] || 0;
                    
                    tooltip.classed('show', true)
                        .style('left', (event.pageX + 12) + 'px')
                        .style('top', (event.pageY - 28) + 'px')
                        .html(`<strong>${countryName}</strong><br/>Applications: ${value.toLocaleString()}`);
                    
                    d3.select(this)
                        .attr('stroke', this.colors?.accent_blue || '#2563eb')
                        .attr('stroke-width', 2);
                })
                .on('mouseleave', function() {
                    tooltip.classed('show', false);
                    d3.select(this)
                        .attr('stroke', 'white')
                        .attr('stroke-width', 0.5);
                });

            // Zoom functionality
            const zoom = d3.zoom()
                .scaleExtent([1, 8])
                .on('zoom', (event) => g.attr('transform', event.transform));
            
            svg.call(zoom);

        } catch (error) {
            console.error('Error loading world map:', error);
            svg.append('text')
                .attr('x', width / 2)
                .attr('y', height / 2)
                .attr('text-anchor', 'middle')
                .attr('fill', 'var(--text-secondary)')
                .text('Unable to load world map data');
        }
    }

    // Tab 4: Enhanced Sankey Diagram
    createSankeyDiagram(container, data) {
        const width = container.clientWidth;
        const height = container.clientHeight - 40;
        const margin = {top: 20, right: 150, bottom: 20, left: 150};

        // Clear container
        d3.select(container).selectAll('*').remove();

        const svg = d3.select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        console.log('Sankey data:', data);

        const sankey = d3.sankey()
            .nodeWidth(20)
            .nodePadding(15)
            .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]]);

        const {nodes, links} = sankey({
            nodes: data.nodes.map(d => ({...d})),
            links: data.links.map(d => ({...d}))
        });

        // Color function
        const getNodeColor = (d) => {
            if (d.category === 'country') return this.colors.blue;
            if (d.category === 'applications') return this.colors.orange;
            if (d.name === 'Granted') return this.colors.green;
            if (d.name === 'Rejected') return this.colors.red;
            return this.colors.primary;
        };

        const getLinkColor = (d) => {
            if (d.type === 'applications') return this.colors.blue;
            if (d.type === 'granted') return this.colors.green;
            if (d.type === 'rejected') return this.colors.red;
            return this.colors.primary;
        };

        // Draw links
        svg.append('g')
            .selectAll('.sankey-link')
            .data(links)
            .enter()
            .append('path')
            .attr('class', 'sankey-link')
            .attr('d', d3.sankeyLinkHorizontal())
            .attr('stroke', getLinkColor)
            .attr('stroke-width', d => Math.max(2, d.width))
            .attr('fill', 'none')
            .style('opacity', 0.7)
            .on('mouseover', function(event, d) {
                d3.select(this).style('opacity', 0.9);
                showSankeyTooltip(event, d);
            })
            .on('mouseout', function() {
                d3.select(this).style('opacity', 0.7);
                hideSankeyTooltip();
            });

        // Draw nodes
        const node = svg.append('g')
            .selectAll('.sankey-node')
            .data(nodes)
            .enter()
            .append('g')
            .attr('class', 'sankey-node')
            .attr('transform', d => `translate(${d.x0},${d.y0})`);

        node.append('rect')
            .attr('height', d => d.y1 - d.y0)
            .attr('width', sankey.nodeWidth())
            .attr('fill', getNodeColor)
            .attr('rx', 3);

        // Add node labels
        node.append('text')
            .attr('x', d => d.x0 < width / 2 ? sankey.nodeWidth() + 6 : -6)
            .attr('y', d => (d.y1 - d.y0) / 2)
            .attr('dy', '0.35em')
            .attr('text-anchor', d => d.x0 < width / 2 ? 'start' : 'end')
            .text(d => d.name)
            .attr('font-family', 'Inter, sans-serif')
            .attr('font-size', '12px')
            .attr('font-weight', '600')
            .attr('fill', '#374151');

        // Add value labels on nodes
        node.append('text')
            .attr('x', d => d.x0 < width / 2 ? sankey.nodeWidth() + 6 : -6)
            .attr('y', d => (d.y1 - d.y0) / 2 + 15)
            .attr('dy', '0.35em')
            .attr('text-anchor', d => d.x0 < width / 2 ? 'start' : 'end')
            .text(d => {
                // Calculate node value (sum of incoming or outgoing links)
                const nodeValue = d.value || 0;
                return nodeValue > 0 ? `(${nodeValue.toLocaleString()})` : '';
            })
            .attr('font-family', 'Inter, sans-serif')
            .attr('font-size', '10px')
            .attr('font-weight', '500')
            .attr('fill', '#6b7280');

        // Tooltip
        const tooltip = d3.select('body')
            .append('div')
            .attr('class', 'sankey-tooltip')
            .style('opacity', 0)
            .style('position', 'absolute')
            .style('background', '#1f2937')
            .style('color', 'white')
            .style('padding', '10px 14px')
            .style('border-radius', '8px')
            .style('font-size', '12px')
            .style('pointer-events', 'none')
            .style('z-index', '1000')
            .style('box-shadow', '0 4px 6px -1px rgb(0 0 0 / 0.1)');

        function showSankeyTooltip(event, d) {
            tooltip.transition().duration(200).style('opacity', 1);
            tooltip.html(`
                <div style="font-weight: 600; margin-bottom: 4px;">
                    ${d.source.name} → ${d.target.name}
                </div>
                <div>Volume: ${d.value.toLocaleString()}</div>
            `)
            .style('left', (event.pageX + 12) + 'px')
            .style('top', (event.pageY - 10) + 'px');
        }

        function hideSankeyTooltip() {
            tooltip.transition().duration(200).style('opacity', 0);
        }
    }

    // Tab 5: Forecast Chart
    createForecastChart(ctx, data) {
        if (this.charts.forecast) {
            this.charts.forecast.destroy();
        }

        // Create gradient backgrounds
        const gradientHistorical = ctx.createLinearGradient(0, 0, 0, 350);
        gradientHistorical.addColorStop(0, this.colors.blue + '60');
        gradientHistorical.addColorStop(1, this.colors.blue + '10');
        
        const gradientForecast = ctx.createLinearGradient(0, 0, 0, 350);
        gradientForecast.addColorStop(0, this.colors.orange + '60');
        gradientForecast.addColorStop(1, this.colors.orange + '10');

        const allData = [...data.historical, ...data.forecast];
        
        const chartData = {
            labels: allData.map(d => d.year),
            datasets: [{
                label: 'Historical Data',
                data: [...data.historical.map(d => d.value), ...Array(data.forecast.length).fill(null)],
                borderColor: this.colors.blue,
                backgroundColor: gradientHistorical,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: this.colors.blue,
                pointBorderColor: this.colors.text,
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 8,
                borderWidth: 3
            }, {
                label: 'Forecast',
                data: [...Array(data.historical.length - 1).fill(null), 
                       data.historical[data.historical.length - 1].value,
                       ...data.forecast.map(d => d.value)],
                borderColor: this.colors.orange,
                backgroundColor: gradientForecast,
                borderDash: [8, 4],
                fill: true,
                tension: 0.4,
                pointBackgroundColor: this.colors.orange,
                pointBorderColor: this.colors.text,
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 8,
                borderWidth: 3,
                pointStyle: 'triangle'
            }]
        };

        this.charts.forecast = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        position: 'top',
                        align: 'end',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                size: 12,
                                weight: '600'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: this.colors.primary,
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: this.colors.primary,
                        borderWidth: 1,
                        cornerRadius: 8,
                        titleFont: {
                            size: 13,
                            weight: '600'
                        },
                        bodyFont: {
                            size: 12
                        },
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                if (context.parsed.y !== null) {
                                    return context.dataset.label + ': ' + context.parsed.y.toLocaleString();
                                }
                                return '';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#e5e7eb',
                            drawBorder: false
                        },
                        ticks: {
                            font: {
                                size: 11
                            },
                            color: '#6b7280',
                            callback: function(value) {
                                return (value / 1000) + 'K';
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 11
                            },
                            color: '#6b7280'
                        }
                    }
                }
            }
        });
    }

    // Apply year filter
    applyFilter(filterValue, allData) {
        this.currentFilter = filterValue;
        
        let filteredData = JSON.parse(JSON.stringify(allData)); // Deep copy
        
        if (filterValue === 'recent') {
            // Last 5 years
            filteredData.overview.yearly_data = filteredData.overview.yearly_data.slice(-5);
        } else if (filterValue === 'decade') {
            // Last 10 years
            filteredData.overview.yearly_data = filteredData.overview.yearly_data.slice(-10);
        }
        
        // Recalculate all metrics
        const newTotalGranted = filteredData.overview.yearly_data.reduce((sum, d) => sum + d.granted, 0);
        const newTotalLodged = filteredData.overview.yearly_data.reduce((sum, d) => sum + d.lodged, 0);
        const newTotalRejected = newTotalLodged - newTotalGranted;
        const newSuccessRate = newTotalLodged > 0 ? (newTotalGranted / newTotalLodged * 100) : 0;
        
        filteredData.overview.total_granted = newTotalGranted;
        filteredData.overview.total_lodged = newTotalLodged;
        filteredData.overview.total_rejected = newTotalRejected;
        filteredData.overview.success_rate = Math.round(newSuccessRate * 10) / 10; // Round to 1 decimal
        
        return filteredData;
    }

    // Destroy all charts
    destroyCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};
        
        // Remove tooltips
        d3.selectAll('.treemap-tooltip, .map-tooltip, .sankey-tooltip').remove();
    }
}

const chartManager = new ChartManager();