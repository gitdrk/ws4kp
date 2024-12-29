// express
const express = require('express');
const serveIndex = require('serve-index');


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

// 1. Define your XMLTV content as a string (or load it from a file).
const xmltvData = `<?xml version="1.0" encoding="UTF-8"?>
<tv generator-info-name="Example XMLTV">
  <channel id="myweatherchannel">
    <display-name>My Weather Channel</display-name>
  </channel>
  <programme 
      start="20200101000000 +0000" 
      stop="20400101000000 +0000" 
      channel="myweatherchannel">
    <title>My Weather Channel – Continuous Forecast</title>
    <desc>A single 24/7 program running from 2020-01-01 to 2040-01-01.</desc>
  </programme>
</tv>`;

// 2. Create a route to serve the XMLTV.
app.get('/epg.xml', (req, res) => {
	// Set the content type to XML.
	res.type('application/xml');
	// Send the XMLTV as the response body.
	res.send(xmltvData);
});

app.use('/live', express.static('./server/live'));
app.use('/live', serveIndex('./server/live', { icons: true }));

const m3uData = `#EXTM3U
#EXTINF:-1 tvg-id="myweatherchannel" tvg-name="My Weather Channel" tvg-logo="https://example.com/logo.png" group-title="Weather",My Weather Channel
http://192.168.1.100:8080/live/myweather.m3u8
`;

app.get('/playlist.m3u', (req, res) => {
	// Set the content type to M3U (also commonly "audio/x-mpegurl")
	res.type('audio/x-mpegurl');
	// Send the M3U data
	res.send(m3uData);
});

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

app.get('/api/ping', (req, res) => {
	res.sendStatus(200);
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
	app.use('/live', express.static(path.join(__dirname, '/server/live')));
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
