const express = require('express'),
      router = express.Router(),
      childProcess = require('child_process'),
      fs = require('fs');

router.post('/', function(req, res){
  res.set("Content-type", "application/json");
  let status = false;

  //first, make sure that tmp contains file DEBIAN/control

  //First, make sure that something has been extracted
  //get contents of tmp
  fs.readdir('./tmp/', (err, dirs) => {
    if(dirs) {
      dirs.forEach(dir => {
        if(fs.existsSync('./tmp/'+dir+'/DEBIAN/control')) {
          status = true;
        }
    })
  } //otherwise, nothing has been extracted to tmp
  //TODO change this check to an error check from zip.js


  //now to create deb file from extracted folder
  if(status) childProcess.exec('./scripts/createdebs.bash');
  res.json({exist: status});
  })
});
module.exports = router;
