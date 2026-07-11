const axios = require('axios');
(async () => {
  try {
    const res = await axios.get('http://localhost:5001/api/interactions/offers');
    console.log(res.status);
  } catch (err) {
    console.error(err.message, err.response ? err.response.status : '');
  }
})();
