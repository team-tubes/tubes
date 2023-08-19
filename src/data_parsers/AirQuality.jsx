function getClosestAirPointData(airGeojsonData, longitude, latitude) {
  if (
    airGeojsonData === undefined ||
    airGeojsonData === null ||
    airGeojsonData.features === undefined
  )
    return null;

  let features = airGeojsonData.features;
  let closestPoint = features[0];
  let closestPointDist = 100000;

  for (const feature of features) {
    let geometry = feature.geometry;

    let coordinates = geometry.coordinates;
    let long = coordinates[0];
    let lat = coordinates[1];

    let longOffset = long - longitude;
    let latOffset = lat - latitude;

    let distance = Math.sqrt(longOffset * longOffset + latOffset * latOffset);

    if (distance < closestPointDist) {
      closestPoint = feature;
      closestPointDist = distance;
    }
  }

  return closestPoint;
}

var recentAirQuality = "";

export function getAirQuality(airGeojsonData, longitude, latitude) {
  let airQualityData = getClosestAirPointData(
    airGeojsonData,
    longitude,
    latitude
  );

  return airQualityData.properties;
}

export function getAirQualityTooltipInfo() {
  // tooltip is temporary
  return recentAirQuality;
}

export default { getAirQuality, getAirQualityTooltipInfo };
