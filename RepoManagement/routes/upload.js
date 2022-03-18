const express = require('express'),
      router = express.Router(),
      formidable = require('formidable');

//Retrieve filepond data using formidable
router.post("/", function(req, res){
  const form = formidable({ multiples: true });

  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }
    //send filepond data to body, to be retrieved in /save
    res.json(files);
  });
})
module.exports = router;
