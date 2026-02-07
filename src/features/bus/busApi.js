export function busDataApi(data) {
  return new Promise(async (resolve, reject) => {
    try {
      const resp = await fetch("https://api.hbadigitalindia.com/buses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data), // Including body with GET
      });

      if (!resp.ok) {
        return reject(new Error(`HTTP error! status: ${resp.status}`));
      }

      const result = await resp.json(); // Parse the response body

      resolve(result.data); // Pass resolved data
    } catch (error) {
      console.log(error);
      reject(error); // Handle errors
    }
  });
}

export function busChartApi(data) {
  return new Promise(async (resolve, reject) => {
    try {
      const resp = await fetch("https://api.hbadigitalindia.com/busChart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data), // Including body with GET
      });

      if (!resp.ok) {
        return reject(new Error(`HTTP error! status: ${resp.status}`));
      }

      const result = await resp.json(); // Parse the response body

      resolve(result.data); // Pass resolved data
    } catch (error) {
      console.log(error);
      reject(error); // Handle errors
    }
  });
}
