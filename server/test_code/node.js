async function run() {
  const url = new URL(
    "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest",
  );

  url.search = new URLSearchParams({
    start: "1",
    limit: "10",
    convert: "USD",
  }).toString();

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "X-CMC_PRO_API_KEY": "210c86768cda4029aa86b0dba358ee7c",
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log(data);
}

run().catch(console.error);