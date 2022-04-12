const express = require('express'),
      router = express.Router(),
      fs = require('fs');
//Load the correct information in the popup
router.post('/:id', function(req, res){
  //req.body.obj holds all the data retrieved from db
  let replaceTxt = "";

  //Replace template with proper information
  switch(req.params.id) {
      case 'newPkg':
        replaceTxt = fs.readFileSync("./public/assets/templates/pkgInfo.html","utf-8");
        replaceTxt = replaceTxt.replace("${TITLE}", "Create New Package")
                                .replace("${NAME}", req.body.obj.Name)
                                .replace("${AUTHOR}", req.body.obj.Author)
                                .replace("${MAINTAINER}", req.body.obj.Maintainer)
                                .replace("${DESCRIPTION}", req.body.obj.Description)
                                .replace("${SECTION}", req.body.obj.Section)
                                .replace("${DEPENDS}", req.body.obj.Depends);
        break;
      case 'newVersion':
        replaceTxt = fs.readFileSync("./public/assets/templates/newVersion.html","utf-8");
        replaceTxt = replaceTxt.replace("${TITLE}", "Create New Version for ${PACKAGE}")
                                .replace("${MOSTRECENT}", req.body.obj.MostRecent)
                                .replace("${DESCRIPTION}", req.body.obj.Description)
                                .replace("${VERSIONINPUT}", "<label>Version Number*<input type='text' name='version'id='version' required></label>");
        break;
      case 'updatePkg':
        replaceTxt = fs.readFileSync("./public/assets/templates/pkgInfo.html","utf-8");
        replaceTxt = replaceTxt.replace("${TITLE}", "Update Package ${PACKAGE}")
                                .replace("${NAME}", req.body.obj.Name)
                                .replace("${AUTHOR}", req.body.obj.Author)
                                .replace("${MAINTAINER}", req.body.obj.Maintainer)
                                .replace("${DESCRIPTION}", req.body.obj.Description)
                                .replace("${SECTION}", req.body.obj.Section)
                                .replace("${DEPENDS}", req.body.obj.Depends);
        break;
      case 'updateVersion':
        type = "version";
        replaceTxt = fs.readFileSync("./public/assets/templates/updateVersion.html","utf-8");
        replaceTxt = replaceTxt.replace("${TITLE}", "Update Version for ${PACKAGE}")
                                .replace("${MOSTRECENT}", req.body.obj.MostRecent)
                                .replace("${OPTIONS}", req.body.obj.Options)
                                .replace("${DESCRIPTION}", req.body.obj.Description);
        break;
      case 'deletePkg':

        break;
      case 'deleteVersion':

        break;
      case 'deleteAllPkg':

        break;
      case 'deleteAllVersion':

        break;
  }
  replaceTxt = replaceTxt.replaceAll("${PACKAGE}", req.body.obj.Package);
  res.send(replaceTxt);
});
module.exports = router;
