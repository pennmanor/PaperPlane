#!/bin/sh

adduser --system --shell /bin/bash --group --gecos 'User for PaperPlane webapp' --disabled-password --home /home/node paperplane
cp upstart.conf /etc/init/paperplane.conf
cp -R . /var/local/paperplane
touch /var/log/paperplane.log
chown paperplane:paperplane /var/log/paperplane.log
cd /var/local/paperplane; npm link
start paperplane