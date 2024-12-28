// express
const express = require('express');

const app = express();
const port = process.env.WS4KP_PORT ?? 8080;
const path = require('path');

// template engine
app.set('view engine', 'ejs');


// cors pass through
const fs = require('fs');
const corsPassThru = require('./cors');
const radarPassThru = require('./cors/radar');
const outlookPassThru = require('./cors/outlook');
const musicDir = path.join(__dirname, './server/music');


// cors pass-thru to api.weather.gov
app.get('/stations/*', corsPassThru);
app.get('/Conus/*', radarPassThru);
app.get('/products/*', outlookPassThru);

app.get('/api/music/', (req, res) => {
	const count = parseInt(req.query.count, 10) || 10;

	fs.readdir(musicDir, (err, files) => {
		if (err) {
			return res.status(500).send('Directory read error');
		}

		// Filter out only .mp3 files
		const mp3Files = files.filter((file) => file.toLowerCase().endsWith('.mp3'));

		const shuffled = shuffleArray(mp3Files);
		const randomSubset = shuffled.slice(0, count);

		// Render the 'index.ejs' template, passing the mp3Files array
		res.json({ files: randomSubset });
	});
});

function shuffleArray(array) {
	// If you want to avoid modifying the original array, make a copy
	const arrCopy = [...array];

	for (let i = arrCopy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arrCopy[i], arrCopy[j]] = [arrCopy[j], arrCopy[i]];
	}
	return arrCopy;
}

// version
const { version } = JSON.parse(fs.readFileSync('package.json'));

const index = (req, res) => {
	res.render(path.join(__dirname, 'views/index'), {
		production: false,
		version,
	});
};

// debugging
if (process.env?.DIST === '1') {
	// distribution
	app.use('/images', express.static(path.join(__dirname, './server/images')));
	app.use('/music', express.static(path.join(__dirname, './server/music')));
	app.use('/fonts', express.static(path.join(__dirname, './server/fonts')));
	app.use('/scripts', express.static(path.join(__dirname, './server/scripts')));
	app.use('/music', express.static(path.join(__dirname, './server/music')));
	app.use('/', express.static(path.join(__dirname, './dist')));
} else {
	// debugging
	app.get('/index.html', index);
	app.get('/', index);
	app.get('*', express.static(path.join(__dirname, './server')));
}

const server = app.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});

// graceful shutdown
process.on('SIGINT', () => {
	server.close(() => {
		console.log('Server closed');
	});
});
