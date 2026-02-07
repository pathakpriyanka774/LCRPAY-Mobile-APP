export function allCities() {
  return new Promise(async (resolve, reject) => {
    try {
      const resp = await fetch("https://api.hbadigitalindia.com/cityList"); // Make sure this is your correct IP address

      if (!resp.ok) {
        return reject(new Error(`HTTP error! status: ${resp.status}`));
      }

      const result = await resp.json(); // Parse the response body as JSON
      console.log(result);
      resolve(result.data); // Resolve the promise with the JSON data
    } catch (error) {
      reject(error); // Reject the promise if there was an error
    }
  });
}
