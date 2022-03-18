const express = require('express'),
      router = express.Router(),
      fs = require('fs');
//Called when new package is being uploaded
//Return data from control file
router.get('/', function(req, res){
  res.set("Content-type", "application/json");
  //collect data from control file
  let dirname = fs.readdirSync('./tmp/');
  let data = fs.readFileSync('./tmp/'+dirname[0]+'/DEBIAN/control', "utf8");
  res.json({data: data});
});
module.exports = router;
