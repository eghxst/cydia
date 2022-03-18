#!/bin/bash
find ../../ -name '*.DS_Store' -type f -delete
find ../ -name Packages.bz2 -delete
bzip2 -k ../Packages
