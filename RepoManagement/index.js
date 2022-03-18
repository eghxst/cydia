const express = require('express'),
      sqlite3 = require('sqlite3'),
      FilePond = require('filepond');
//Filepond: https://github.com/pqina/filepond


const app = express();
const port = 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//Needed for style.css
app.use(express.static(__dirname));

//Routes
const upload = require('./routes/upload'),
      save = require('./routes/save'),
      currentScreenshots = require('./routes/currentScreenshots'),
      packages = require('./routes/packages'),
      readControl = require('./routes/readControl'),
      zip = require('./routes/zip'),
      popup = require('./routes/popup');
app.use('/upload', upload);
app.use('/save', save);
app.use('/currentScreenshots', currentScreenshots);
app.use('/packages', packages);
app.use('/readControl', readControl);
app.use('/zip', zip);
app.use('/popup', popup);

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/index.html'));
})

app.listen(port);
