export async function get_auckland_council_water_outages() {
  //Get all outages
  const response = await fetch("https://api.watercare.co.nz/outages/all");
  const all_outages = await response.json();

  //We then want to get the specific water outages data
  const all_outages_with_data = await Promise.all(
    all_outages.map(async (item) => ({
      ...item,
      outage_data: await get_water_outage_data_specific(item.outageId),
    }))
  );
  return all_outages_with_data;
}

function get_water_outage_data_specific(outage_id) {
  //Get all outages
  return fetch(
    "https://api.watercare.co.nz/outages/outage/" + outage_id + "/details"
  )
    .then((response) => response.json())
    .then((data) => {
      return data;
    });
}
