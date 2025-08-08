# VisaFlow Analytics Dashboard

A modern, Vision UI-inspired analytics dashboard for Australian Temporary Graduate Visa (subclass 485) data visualization.

## Features

- 🎨 **Glassmorphism Design**: Dark theme with backdrop blur effects
- 📊 **Interactive Charts**: Line charts, donut charts, treemap, world map, and Sankey diagrams
- 📱 **Responsive Layout**: Mobile-friendly with collapsible sidebar
- 🔍 **Data Filtering**: Year-based filtering across all visualizations
- ♿ **Accessible**: WCAG 2.2 compliant with proper focus indicators

## Quick Start

1. Install dependencies:
   ```bash
   pip install flask pandas numpy openpyxl
   ```

2. Run the application:
   ```bash
   python app.py
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:9000
   ```

## Project Structure

```
├── app.py                          # Main Flask application
├── templates/index.html            # HTML template
├── static/
│   ├── css/styles.css              # Vision UI styles
│   └── js/
│       ├── api.js                  # API communication
│       ├── charts.js               # Chart visualizations
│       └── app.js                  # Main application logic
└── *.xlsx                          # Australian visa data files
```

## Tech Stack

- **Backend**: Flask, Pandas, NumPy
- **Frontend**: Vanilla JavaScript, D3.js, Chart.js
- **Design**: CSS3 with glassmorphism effects
- **Data**: Excel files with visa statistics

## Dashboard Sections

1. **Overview**: Total statistics and trends over time
2. **Demographics**: Country breakdown and applicant analysis  
3. **Global Flow**: Interactive world map visualization
4. **Application Flow**: Sankey diagram showing visa processing
5. **Future Trends**: Historical data with forecasting

---

## 📜 Acknowledgements & Credits

### Data Source
- **Data Provider**: Department of Home Affairs, Australian Government
- **Dataset**: Temporary Graduate Visas (Subclass 485) - Granted and Lodged Reports
- **Data Lock Date**: 30 June 2025
- **Citation Requirement**: All publications and reports using this data must cite the Department of Home Affairs as the source

### Design & Technology Credits
- **Design Inspiration**: Vision UI Dashboard design principles
- **Visualization Libraries**: 
  - D3.js v7 for advanced interactive visualizations
  - Chart.js for standard chart components
  - Flatpickr for date range selection
- **UI Framework**: Custom CSS with glassmorphism effects and light theme
- **Backend**: Flask with pandas for data processing

### Legal Compliance
This dashboard is built for educational and analytical purposes. Users must:
1. Cite the Department of Home Affairs as the data source in any publications
2. Comply with Australian Government data usage policies
3. Respect intellectual property rights of visualization libraries used

### Open Source Libraries
- **Flask**: BSD-3-Clause License
- **D3.js**: BSD-3-Clause License  
- **Chart.js**: MIT License
- **Flatpickr**: MIT License
- **Pandas**: BSD-3-Clause License
- **NumPy**: BSD-3-Clause License

---

Built with ❤️ for Australian immigration data analysis and visualization.