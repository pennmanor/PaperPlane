#!/bin/sh

if [ -d "/var/local/paperplane" ]; then
	echo "Updating existing install"
	stop paperplane
	cp -R . /var/local/paperplane
	chown -R paperplane:paperplane /var/local/paperplane
	start paperplane
fi

if [ ! -d "/var/local/paperplane" ]; then
	# Add user
	adduser --system --group --gecos 'User for PaperPlane webapp' --disabled-password --home /home/paperplane paperplane
	
	# Copy upstart config
	cp upstart.conf /etc/init/paperplane.conf
	
	# Copy application folder and create log file
	cp -R . /var/local/paperplane
	touch /var/log/paperplane.log
	chown paperplane:paperplane /var/log/paperplane.log
	
	# Install node deps
	cd /var/local/paperplane; npm link
	chown -R paperplane:paperplane /var/local/paperplane
	
	start paperplane
fi
