const mock_data =
  './chrous_data_mock.json';


async function chorus_data() 
{
    //This didnt work on testing local host will be sorted for prod using mock data in mean time
    //To set out properly make function async and decomment below code and comment out code in area


    // const response = await fetch("https://api.chorus.co.nz/events/v3/incidents", {
    //   "headers": {
    //     "accept": "application/json, text/plain, */*",
    //     "accept-language": "en-US,en;q=0.9",
    //     "authorization": "Basic NDlkY2Q3ZDU5OGM2NGRiNzk4YTA1OTg3OWFhMDAxOTE6M2Q0YTUyM2ZiNjc4NGU2NzhBOTU2M0QyOEUyNTUyRDY=",
    //     "sec-ch-ua": "\"Chromium\";v=\"116\", \"Not)A;Brand\";v=\"24\", \"Google Chrome\";v=\"116\"",
    //     "sec-ch-ua-mobile": "?1",
    //     "sec-ch-ua-platform": "\"Android\"",
    //     "sec-fetch-dest": "empty",
    //     "sec-fetch-mode": "cors",
    //     "sec-fetch-site": "same-site",
    //     "Referer": "https://www.chorus.co.nz/",
    //     "Referrer-Policy": "strict-origin-when-cross-origin"
    //   },
    //   "body": null,
    //   "method": "GET",
      
    // });    

    //const data = await response.json();
    
    

    //End of comment out region

    //Format the data into geojson format
    return await fetch_mock_data()
    
}


function format_chorus_api_data(data)
{
    let formattedData = data.map((item)=> 
    (
        {
            type:"Feature",
            geometry:JSON.parse(item.sites[0].poly)
        }
    )
    )

    return formattedData
 

}

async function fetch_mock_data()
{
    let data = []

    return fetch(mock_data).then((response) =>
    {
        return response.json();
    })
    .then((json) =>
    {
        return data = format_chorus_api_data(json);
    })
    .then((data) =>{return data});
    
}


  export default chorus_data