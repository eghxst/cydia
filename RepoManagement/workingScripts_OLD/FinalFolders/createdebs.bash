#!/bin/bash
./removeds.bash
shopt -s nullglob
array=(*/)
shopt -u nullglob # Turn off nullglob to make sure it doesn't interfere with anything later
for i in "${array[@]}"
do
   :
   if [ ! -f $i ]; then dpkg -b $i
  fi
done
mv -f ./*.deb ../../cydia/debs
