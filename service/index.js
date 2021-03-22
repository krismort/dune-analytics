const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 4200;

app.use(cors());

const testQuery1 = JSON.parse( fs.readFileSync(path.join(process.cwd(), 'query1.json')) );
const testQuery2 = JSON.parse( fs.readFileSync(path.join(process.cwd(), 'query2.json')) );

app.get('/', (req, res) => {
  res.send('ok');
});

let ctr = 0;
app.get('/query', (req, res) => {
	if ( ctr++ % 2 == 0 ) {
		res.send(testQuery1);
		return;
	}
  res.send(testQuery2);
});

app.get('/query1', (req, res) => {
	res.send(testQuery1);
});

app.get('/query2', (req, res) => {
	res.send(testQuery2);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});
