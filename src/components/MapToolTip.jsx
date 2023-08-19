import { getAirQualityTooltipInfo } from "../data_parsers/AirQuality";

function PrintTooltipData()
{
    return `${getAirQualityTooltipInfo()}`; // this is temporary
}

function MapToolTip() 
{
    return (
    {
        html: `<p>${PrintTooltipData()}</p>`,
        style: 
        {
            backgroundColor: 'white',
            color: 'black',
            opacity: 0.6
        }
    }); 
}

export default MapToolTip