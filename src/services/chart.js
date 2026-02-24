/**
 * Chart Service
 * Evaluates query results and generates a QuickChart Image URL if applicable.
 */

/**
 * Generate a chart URL for the given query results.
 * Only supports queries with exactly 2 columns where one is numerical.
 * @param {Array} rows - Database results
 * @param {Array} fields - Database fields metadata
 * @returns {string|null} - A QuickChart URL or null if a chart cannot be made
 */
function generateChartUrl(rows, fields) {
    if (!rows || rows.length === 0 || rows.length > 20) {
        return null; // Too many rows to chart or empty
    }

    if (fields.length !== 2) {
        return null; // Only chart simple 2-column aggregations
    }

    // Determine which column is labels and which is numerical data
    let labelCol, dataCol;

    // Check first field type
    if (['numeric', 'integer', 'bigint', 'double precision', 'real'].includes(fields[0].format)) {
        dataCol = fields[0].name;
        labelCol = fields[1].name;
    } else {
        labelCol = fields[0].name;
        dataCol = fields[1].name;
    }

    const labels = rows.map(r => String(r[labelCol]));
    const data = rows.map(r => Number(r[dataCol]));

    // Check if data is valid
    if (data.some(isNaN)) {
        return null; // Don't chart if we didn't find numerical data
    }

    // Determine chart type based on data
    const chartType = labels.length <= 5 ? 'pie' : 'bar';

    const chartConfig = {
        type: chartType,
        data: {
            labels: labels,
            datasets: [{
                label: dataCol.toUpperCase(),
                data: data,
                backgroundColor: chartType === 'pie'
                    ? ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
                    : 'rgba(54, 162, 235, 0.5)',
                borderColor: chartType === 'pie' ? '#fff' : 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: `${dataCol.toUpperCase()} by ${labelCol.toUpperCase()}`
                },
                legend: {
                    display: chartType === 'pie'
                }
            }
        }
    };

    // Encode the JSON config for the URL
    const encodedConfig = encodeURIComponent(JSON.stringify(chartConfig));
    return `https://quickchart.io/chart?c=${encodedConfig}&w=500&h=300`;
}

module.exports = { generateChartUrl };
