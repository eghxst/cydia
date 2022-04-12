const express = require('express'),
      sqlite3 = require('sqlite3'),
      path = require('path');


const app = express();
const port = 3001;

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
      templates = require('./routes/templates'),
      versionSelect = require('./routes/versionSelect'),
      processDeb = require('./routes/processDeb');
app.use('/upload', upload);
app.use('/save', save);
app.use('/currentScreenshots', currentScreenshots);
app.use('/packages', packages);
app.use('/readControl', readControl);
app.use('/zip', zip);
app.use('/templates', templates);
app.use('/versionSelect', versionSelect);
app.use('/processDeb', processDeb);

app.listen(port);
