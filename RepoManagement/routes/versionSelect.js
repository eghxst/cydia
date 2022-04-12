const express = require('express'),
      router = express.Router();
//Called to populate current versions
//Currently hardcoded, but will eventually get data from database
router.get('/:type', function(req, res){
  let versions = [1.0, 1.1, 1.2, 1.3, 2.0],
      select;
if(req.params.type === 'update') {
  select = "<label>Version Number<select name='version' id='versionNum' onchange='updateVersionDesc()'>";
} else if(req.params.type === 'delete') {
    select = "<label>Version Number<select name='version' id='versionNum'>";
} else res.end();

versions.forEach(version => {
  select += "<option name='"+version+"'>"+version+"</option>";
})
select += "</select></label>";
res.send(select);

});
module.exports = router;
