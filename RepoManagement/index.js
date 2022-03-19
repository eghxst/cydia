const express = require('express'),
      sqlite3 = require('sqlite3'),
      path = require('path'),
      childProcess = require('child_process'),
      FilePond = require('filepond');
//Filepond: https://github.com/pqina/filepond


const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//Needed for style.css
app.use(express.static(path.join(__dirname,"public")));

//needed for filepond to get data from tmp sc folder
app.use("/tmp", express.static(path.join(__dirname,"tmp")));
//Routes
const upload = require('./routes/upload'),
      save = require('./routes/save'),
      currentScreenshots = require('./routes/currentScreenshots'),
      packages = require('./routes/packages'),
      readControl = require('./routes/readControl'),
      zip = require('./routes/zip'),
      popup = require('./routes/popup'),
      versionSelect = require('./routes/versionSelect');
app.use('/upload', upload);
app.use('/save', save);
app.use('/currentScreenshots', currentScreenshots);
app.use('/packages', packages);
app.use('/readControl', readControl);
app.use('/zip', zip);
app.use('/popup', popup);
app.use('/versionSelect', versionSelect);

app.get('/', function(req, res) {
  childProcess.exec("find ../../ -name '*.DS_Store' -type f -delete");
  res.sendFile(path.join(__dirname, './public/index.html'));
})

app.listen(port);
