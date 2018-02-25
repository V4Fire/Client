const
	express = require('express');

const
	app = express();

app.get('/foo', (req, res) => {
	res.set('Content-Type', 'application/json');
	res.end(JSON.stringify({Hello: 'world'}));
});

app.listen(1989);
console.log('App launched');
