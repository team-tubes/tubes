var airGeojsonData = null;

export function setAirQualityData(airQualityGeojsonData)
{
    airGeojsonData = airQualityGeojsonData;
}

function getClosestAirPointData(longitude, latitude)
{
    if(airGeojsonData === undefined || airGeojsonData === null || airGeojsonData.features === undefined)
        return null;

    let features = airGeojsonData.features;
    let closestPoint = features[0];
    let closestPointDist = 100000;

    for(let featureIndex in features)
    {
        let feature = features[featureIndex];
        let geometry = feature.geometry;
        
        let coordinates = geometry.coordinates;
        let long = coordinates[0];
        let lat = coordinates[1];

        let longOffset = (long - longitude);
        let latOffset = (lat - latitude);

        let distance = Math.sqrt((longOffset * longOffset) + (latOffset * latOffset));

        if(distance < closestPointDist)
        {
            closestPoint = feature;
            closestPointDist = distance;
        }
    }

    return closestPoint;
}

var recentAirQuality = '';

export function getAirQuality(longitude, latitude)
{
    let airQualityData = getClosestAirPointData(longitude, latitude);

    if(airQualityData === undefined || airQualityData === null)
    {
        recentAirQuality = '';
    }
    else
    {
        let airQualityDataProperties = airQualityData.properties;
        let airConcentration = airQualityDataProperties.Concentration;
        let airIndicator = airQualityDataProperties.Indicator;
        let agency = airQualityDataProperties.Agency;

        recentAirQuality = `Air Quality: ${airConcentration} ${airIndicator} (${agency})`;
    }

    return recentAirQuality;
}

export function getAirQualityTooltipInfo() // tooltip is temporary
{
    return recentAirQuality;
}

export default {setAirQualityData, getAirQuality, getAirQualityTooltipInfo};