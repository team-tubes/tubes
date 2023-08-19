async function chorus_data() {
  return await fetch_data();
}

function format_chorus_api_data(data) {
  const formattedData = data.reduce(
    (acc, { sites, ...rest }) => [
      ...acc,
      ...sites.map((site) => ({
        ...rest,
        ...site,
        type: "Feature",
        geometry: JSON.parse(site.poly),
      })),
    ],
    []
  );

  return formattedData;
}

async function fetch_data() {
  return fetch("https://api.infra.nz/api/chorus")
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      return format_chorus_api_data(json);
    });
}

export default chorus_data;
