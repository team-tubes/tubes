import mapboxgl from "mapbox-gl"
import { Marker, Popup } from "react-map-gl"
import { useRef,useMemo,useCallback } from "react"
const WaterOutageMarkers = ({outage_data}) =>{
    return(
        <>
            {outage_data.map((outage)=>{
                return <WaterOutageMarker key ={outage.outageId} latitude={outage.latitude} longitude={outage.longitude}/>
            })}
        </>
    )
}


const WaterOutageMarker = ({latitude,longitude}) =>{
    

    return(
        <>
            <Marker style={{zIndex:1000}}  onClick={(e)=>{e.stopPropagation(); console.log(e)}} latitude={latitude} longitude={longitude} color="red">
                {/* <Popup closeOnClick={true} latitude={latitude} longitude={longitude}>afasf</Popup> */}
                {/* Custom icon can be put her but gaf */}
            </Marker>
            
        </>
    )
}

export default WaterOutageMarkers