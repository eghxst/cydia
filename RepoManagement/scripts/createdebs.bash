#!/bin/bash
find ../../ -name '*.DS_Store' -type f -delete
shopt -s nullglob
folder=(tmp/*)
shopt -u nullglob # Turn off nullglob to make sure it doesn't interfere with anything later
if [ ! -f $folder ]; then dpkg -b $folder
fi
mv -f tmp/*.deb ../debs
