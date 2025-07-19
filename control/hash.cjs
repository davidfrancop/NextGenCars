// hash.js
const bcrypt = require("bcryptjs");

bcrypt.hash("16Ignacio16", 10).then((hash) => {
  console.log("Hash generado:", hash);
});
