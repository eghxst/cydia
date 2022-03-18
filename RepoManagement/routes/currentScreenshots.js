const express = require('express'),
      router = express.Router(),
      fs = require('fs');
//Called when form is being populated with package info
//Return current screenshot list
router.post('/', function(req, res){
  res.set("Content-type", "application/json");

  //make tmp directory if not exists
  if (!fs.existsSync('./tmp'))
      fs.mkdirSync('./tmp');

  //make sc directory if not exists
  if (!fs.existsSync('./tmp/sc'))
      fs.mkdirSync('./tmp/sc');

  fs.readdir('../depictions/screenshots/'+req.body.package, (err, files) => {
    //move all images from depictions screenshots to tmp sc folder
    files.forEach(file => {
         fs.rename('../depictions/screenshots/'+req.body.package+'/'+file, './tmp/sc/'+file, err => {
             if (err) throw err;
         });
      })
    res.send(files);
  })
});
module.exports = router;
