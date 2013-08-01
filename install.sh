#!/bin/sh

adduser --system --shell /bin/bash --gecos 'User for PaperPlane webapp' --disabled-password --home /home/node paperplane
cp paperplane.conf /etc/init
cp -R . /var/local
touch /var/log/paperplane.log
start paperplane
