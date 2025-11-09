const fs = require('fs');

// Read the GeoJSON file
const geojson = JSON.parse(fs.readFileSync('./data/poland-voivodeships.json', 'utf8'));

// Map extent for Poland
const extent = {
  minLon: 14.0,
  maxLon: 24.2,
  minLat: 49.0,
  maxLat: 54.9
};

// Calculate proper aspect ratio
// Lon range: 24.2 - 14.0 = 10.2
// Lat range: 54.9 - 49.0 = 5.9
// However, we need to account for latitude distortion
// Poland appears roughly 0.85:1 (width:height) in standard projections
// Use consistent dimensions that match the reference image
const viewBox = { width: 400, height: 470 };

// Function to convert lon/lat to SVG coordinates
function lonLatToSVG(lon, lat) {
  const x = ((lon - extent.minLon) / (extent.maxLon - extent.minLon)) * viewBox.width;
  const y = viewBox.height - ((lat - extent.minLat) / (extent.maxLat - extent.minLat)) * viewBox.height;
  return { x, y };
}

// Function to convert GeoJSON coordinates to SVG path
function coordsToPath(coords) {
  if (!coords || coords.length === 0) return '';

  let path = '';
  coords.forEach((ring, ringIndex) => {
    ring.forEach((point, i) => {
      const { x, y } = lonLatToSVG(point[0], point[1]);
      if (i === 0) {
        path += `M ${x.toFixed(2)} ${y.toFixed(2)} `;
      } else {
        path += `L ${x.toFixed(2)} ${y.toFixed(2)} `;
      }
    });
    path += 'Z ';
  });
  return path.trim();
}

// Convert each feature and store with voivodeship name
const voivodeships = {};

geojson.features.forEach((feature) => {
  const name = feature.properties.nazwa;
  const geometry = feature.geometry;

  let pathData = '';
  if (geometry.type === 'Polygon') {
    pathData = coordsToPath(geometry.coordinates);
  } else if (geometry.type === 'MultiPolygon') {
    geometry.coordinates.forEach(polygon => {
      pathData += coordsToPath(polygon) + ' ';
    });
  }

  // Calculate centroid for red dot placement
  const firstRing = geometry.type === 'Polygon'
    ? geometry.coordinates[0]
    : geometry.coordinates[0][0];

  let sumX = 0, sumY = 0, count = 0;
  firstRing.forEach(coord => {
    sumX += coord[0];
    sumY += coord[1];
    count++;
  });

  const centroidLon = sumX / count;
  const centroidLat = sumY / count;
  const centroid = lonLatToSVG(centroidLon, centroidLat);

  voivodeships[name] = {
    path: pathData.trim(),
    centroid: { x: Math.round(centroid.x), y: Math.round(centroid.y) }
  };
});

// Write output
fs.writeFileSync(
  './data/poland-voivodeships-svg.json',
  JSON.stringify(voivodeships, null, 2)
);

console.log('Conversion complete! Output saved to data/poland-voivodeships-svg.json');
console.log(`Converted ${Object.keys(voivodeships).length} voivodeships`);
Object.keys(voivodeships).forEach(name => {
  console.log(`  - ${name}`);
});
