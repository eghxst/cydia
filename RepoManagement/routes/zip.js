const express = require('express'),
      router = express.Router(),
      fs = require('fs'),
      formidable = require('formidable'),
      childProcess = require('child_process'),
      StreamZip = require('node-stream-zip');

//Handle zip upload using formidable and filepond
router.post("/", function(req, res){
  // Remove /tmp folder if it hasn't been removed already, to start
  //    from scratch
  if (fs.existsSync('./tmp'))
    fs.rmSync('./tmp', { recursive: true });

  const form = formidable({ multiples: true });

  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }
    // Take the uploaded zip file and prepare for extraction using StreamZip
    const zip = new StreamZip({ file: files.filepond.filepath });
    zip.on('ready', () => {

      let baseDir;
      for (const entry of Object.values(zip.entries())) {
        //first extracted entry will always be top directory
        baseDir = entry.name;
        break;
      }

      zip.extract(null, './tmp', (err, count) => {

          //By using this zip extraction method, there are sometimes extra folders
          //  extracted. Remove all parent dirs except for 'sc' and the package folder
          fs.readdir('./tmp/', (err, dirs) => {
            dirs.forEach(dir => {
              if(dir !== baseDir.replace('/', ''))
                 fs.rmSync('./tmp/'+dir, { recursive: true });
             })
          })
          //done extracting
          zip.close();

          //now to create deb file from extracted folder
          var createDebs = childProcess.exec('./scripts/createdebs.bash');
          res.end();
      });
    });
  });
});

//Handler for deleting an uploaded file
router.delete("/", function(req, res) { res.end(); })

module.exports = router;
