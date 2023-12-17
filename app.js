const express = require('express');
const { PORT = 3001 } = process.env;
const app = express();

app.listen(PORT, () => {
  console.log(`app listening at port ${PORT}`);
  console.log('This is working');
})

