#!/bin/bash
find ../../ -name '*.DS_Store' -type f -delete
shopt -s nullglob
array=(../debs/*)
shopt -u nullglob # Turn off nullglob to make sure it doesn't interfere with anything later
for i in "${array[@]}"
do
   info=$(dpkg-deb --field $i)
   echo $info
done
