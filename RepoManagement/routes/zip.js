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
        //find directory that contains DEBIAN/control
        if(entry.isDirectory){
          //is a directory, start searching for DEBIAN/control

          for(const e of Object.values(zip.entries())) {
            if(e.name === entry.name + "DEBIAN/control") {
              baseDir = entry.name;
              break;
            }
          }
        }
      }

      //if we've found a control file, great! Extract. Otherwise, end here
      if(baseDir) {
        zip.extract(null, './tmp', (err, count) => {

            //By using this zip extraction method, there are sometimes extra folders
            //  extracted. Remove all parent dirs except for the package folder
            fs.readdir('./tmp/', (err, dirs) => {
              dirs.forEach(dir => {
                if(dir !== baseDir.replace('/', ''))
                   fs.rmSync('./tmp/'+dir, { recursive: true });
               })
            })
            //done extracting
            zip.close();
            res.end();
        });
      } else res.status(406).json({error: "No path /DEBIAN/control in the zip you are uploading.\nInvalid Zip File"});
    });
  });
});

//Handler for deleting an uploaded file
router.delete("/", function(req, res) { res.end(); })

module.exports = router;
