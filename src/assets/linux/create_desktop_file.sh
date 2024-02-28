#!/bin/sh
set -e
WORKING_DIR=`pwd`
THIS_PATH=`readlink -f $0`
cd `dirname ${THIS_PATH}`
FULL_PATH=`pwd`
cd ${WORKING_DIR}
cat <<EOS > grommunio.Desktop
[Desktop Entry]
Name=Mattermost
Comment=grommunio Desktop application for Linux
Exec="${FULL_PATH}/grommunio-desktop" %U
Terminal=false
Type=Application
Icon=${FULL_PATH}/app_icon.png
Categories=Network;InstantMessaging;
EOS
chmod +x grommunio.Desktop
