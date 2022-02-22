#!/bin/bash
find ./ -name Packages.bz2 -delete
bzip2 -k Packages
