//call all initializing functions that should be called when body loads
function init() {
  //we will replace this with all names from tweaks table
  const tags = [
        'Soda Pop',
        'HS Border Pack',
        'HS Sidebar Pack',
        'HS Pill Pack',
        'HS Split Pack',
        'HS Diagonal Pack'
    ];
      //use jquery autocomplete to add suggestions box under input fields
    $('.field').autocomplete({ source: tags });
    $('.button').click(generatePopup);
    $('.field').on('input', function(e) {
      //if the field is empty, do not allow user to continue
      let nextBtn = $(this).parent().parent().find('.button');
      if($(this).val()) nextBtn.css('pointerEvents', 'auto');
      else nextBtn.css('pointerEvents', 'none');
    })


    //Initialize FilePond for the 'New Package' Zip Upload field
    FilePond.registerPlugin(FilePondPluginFileValidateType);
    FilePond.registerPlugin(FilePondPluginImagePreview);
    //get zip from filepond upload
    const zip = document.getElementById('zip');
    const zippond = FilePond.create( zip );
    zippond.setOptions({
      server: "/zip",
      acceptedFileTypes: ['application/zip'],
      labelIdle: '<span class="filepond--label-action">.zip File</span>',
      allowImagePreview: false,
      labelFileProcessingError: (error) => {
        if(error.code == 406)
          return 'No control file found';
      },
      onprocessfiles() {
        $.post('/processDeb', {}, function(data) {
          if(data.exist) {
            $('#zipNext').css('pointerEvents', 'auto');
            $.get('/readControl', {}, function(data) {
              //This is the data from the DEBIAN/control file that was uploaded.
              //This is in the form of Key:Value\nKey:Value\n
              //Parse this data with the function below to create object with keys/vals

              //Solution found here
              //https://stackoverflow.com/questions/1086404/string-to-object-in-js
              var properties = data.data.split('\n');
                var obj = {};
                properties.forEach(function(property) {
                    var tup = property.split(': ');
                    if(obj[tup[0]] !== "" && tup[1])
                      obj[tup[0]] = tup[1];
              });
              //some control files may not have a depends. It needs to be in obj regardless.
              if(!'Depends' in obj)
                obj.Depends = "";
              $.post('/templates/newPkg', {obj}, function(text){
                  $('#formWrap').html(text);
                  const screenshots = document.getElementById('screenshots')
                  const scpond = FilePond.create( screenshots );
                  scpond.setOptions({
                    server: "/upload",
                    allowMultiple: true,
                    allowImagePreview: true,
                    acceptedFileTypes: ['image/*']
                  });
              });
            })
          } else {
            // This is called when processDeb returns exists FALSE.
            // The checking of DEBIAN/control is done in BOTH /zip and processDeb.
            // If checking in /zip fails to return error, it will be caught in processDeb.
            alert('No path /DEBIAN/control in the zip you are uploading.\nInvalid Zip File');
            zippond.removeFile({ revert: true });
          }
        } );
      }
    });
}
function generatePopup() {
  let parent = $(this).parent(),
      id = parent.attr('id'),
      value = parent.find('.row .field').val(),
      obj;
  //newPkg will be handled on upload of zip file
  //    (onProcess() in filepond declaration), so it should not be executed here
  if(packageExists(value) && id !== 'newPkg') {

    //obj will contain the data that is needed to pass to /templates route
    // In /templates route, we will fetch a template HTML file and replace
    // the proper values for their values in this obj object.
    switch(id) {
      case 'newVersion':
      //TODO replace MostRecent with real data
        obj = {
          Package: value,
          MostRecent: "1.0",
          Options: "",
          Description: ""
        }

        //temporary solution. This is firing before the $.get returns obj.
        $.post('/templates/'+id, {obj}, function(text){
            $('#formWrap').html(text);
        });
        break;
      case 'updatePkg':
        //TODO replace this with real data
        obj = {
          Package: value,
          Name: "Package name",
          Author: "Author of Package",
          Maintainer: "Maintainer of package",
          Description: "Description of package",
          Section: "package section",
          Depends: "package depends"
        }
        $.post('/templates/'+id, {obj}, function(text){
            $('#formWrap').html(text);

            //In the popup, there will be an area to upload screenshots.
            // This should be declared as another filepond.
            const screenshots = document.getElementById('screenshots')
            const scpond = FilePond.create( screenshots );
            scpond.setOptions({
              server: "/upload",
              allowMultiple: true,
              allowImagePreview: true,
              acceptedFileTypes: ['image/*']
            });

            //Since we're updating the package, we should list all screenshots
            // that are currently uploaded.
            $.post('/currentScreenshots', {package: value}, function(data) {
              //data is the data from currentScreenshots. Pass to filepond
              data.forEach(file => { scpond.addFile('./tmp/sc/'+file); } );
            })
          });
        break;
      case 'updateVersion':
      $.get('/versionSelect/update', {}, function(data) {
        obj = {
          Package: value,
          Options: data,
          Description: "Description of version"
        }
          //temporary solution. This is firing before the $.get returns obj.
          $.post('/templates/'+id, {obj}, function(text){
              $('#formWrap').html(text);
          });
        })
        break;
      case 'deletePkg':
        break;
      case 'deleteVersion':
        $.get('/versionSelect/delete', {}, function(data) {
          obj = {
            Type: 'version',
            Package: value,
            MostRecent: "1.0",
            Options: data,
            Description: ""
          }
            //temporary solution. This is firing before the $.get returns obj.
            $.post('/templates/'+id, {obj}, function(text){
                $('#formWrap').html(text);
            });
          })
        break;
      case 'deleteAllPkg':
        break;
      case 'deleteAllVersion':
        break;
      default:
        console.log('error in id, ', id);
    }
  } else if(id !== 'newPkg') {
    $('#formWrap').html('<p class=\"error\">Package '+value+' Not Found</p><i class=\"fas fa-times-circle\" id=\"close\"></i>');
    $('#close').click(function(e) { $('.popupWrap').hide(); })
  }

showPopup();
}
function showPopup() {
  $('.popupWrap').show();
  //deleteAllPkg button should always have pointerevents true
  $('.button:not(#deleteAllPkg)').css('pointerEvents', 'none');
}
function packageExists(package) {
  return true;
}
function updateVersionDesc() {
  let version = document.getElementById('versionNum').value;
  //value = get from database
  let value = "Description For Version " + version;
  document.getElementById('description').innerHTML = value;
}
