DIRECTORY STRUCTURE:

-- cydia
  ** Base Folder that is publicly viewable and added to Package Manager
  -- debs
    ** All .deb files that are publicly available via github repo
  -- Packages
    ** Data regarding every .deb file that exists in the /debs folder
  -- Release
    ** Data regarding repo
  -- depictions
    ** The info to show when viewing package in Package Manager (such as Cydia, Zebra, or Sileo)
    -- screenshots
      ** All folders are named after their package
        ~(eg) com.ghxstdev.sodapop
        ** Each folder contains the screenshots that will be displayed when viewing package in Package Manager
  -- RepoManagement
    ** RepoMgmt Web App files

NEW PACKAGE:
-- Filepond ZIP upload
  -- When a ZIP file is uploaded to Filepond, post /zip
    -- This /zip will take an uploaded zip file and extract it to the /tmp folder
    -- At this point, a .deb file will be created and moved to the /debs folder
    -- This newly-extracted folder will contain a file control in
        -- DEBIAN subfolder
    -- Once this zip has been uploaded to Filepond, it will call get /readControl
    -- /readControl will populate the popup with the data from DEBIAN/control

OPENING POPUPS:
-- When opening the popup by clicking on '.button', call post /popup/:id
    -- where :id is one of the following (gathered from (this).attr(id))
        --newPkg
        --newVersion
        --updatePkg
        --updateVersion
        --deletePkg
        --deleteVersion
        --deleteAllPkg
        --deleteAllVersion
-- Get the package to update/create/delete from the input text field
    -- If the :id is newPkg, there is no input text field
      -- In this case, the popup content is populated through /readControl
    -- Otherwise, currently the data is HardCoded
    -- The goal is to retrieve the data for corresponding package from the database
    -- and populate the form with this data

PACKAGES:
-- Once popup is populated, we also need to populate the filepond with the
    -- already-existing screenshots from the proper depictions folder
    -- This is done with get /currentScreenshots
      -- This will return list of all current screenshots as well as moving
          -- all current screenshots to /tmp/sc folder

VERSIONS:
-- If Updating or Deleting version, we need to populate the <select> with all
  -- current versions for package

FORM SUBMISSIONS:
-- Form goes to action=/save
-- In /save, the form data is gathered using npm formidable
    -- Form is checked to see if screenshots were uploaded
    -- If so, these screenshots need to be added to the proper depictions folder
-- Currently, /save returns JSON data of the submitted form.
-- The goal is to take this returned JSON data and update database

DATA:
-- Check if record matching package exists with packageExists()
-- JSON data from completed form is returned in /save
-- JSON data to populate form is currently hardcoded, in .button click event

PLANS TO INTEGRATE RESTAPI:

-- .GET sends JSON data from database to .button click event to populate form
-- .POST takes JSON data from /save and adds new package to database
-- .PUT takes JSON data from /save and updates package in database
-- .DELETE takes JSON data from /delete and deletes package record from database
