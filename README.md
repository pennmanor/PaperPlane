# _PaperPlane_
_A node.js powered link and file sharing application designed for use in the classroom._

## Install

1. Install node.js and npm.
2. Download PaperPlane and run install.sh
3. You're done! PaperPlane will now be running on port 80

## Updating
install.sh will detect if PaperPlane is already installed and replace the system version with the version in the directory it is ran from.

Alternatively, you can run git pull in /var/local/paperplane and restart the daemon.


## Configuration
The configuration file is located at _/var/local/paperplane/config.json_

Parameters:

* autoTitle - Attempt to fetch the title from submitted links
* changeUser - Should PaperPlane change uid and gid
* user - The user to change to
* group - The group to change to

## Dependencies
* Node.js ( tested on v0.10.15 ) 
* cheerio
* express
* socket.io
* node-schedule

_Note: All required node modules will be installed by install.sh or npm link_ 

## Install Locations
* Application directory: /var/local/paperplane
* Log file: /var/log/paperplane.log
* Upstart script: /etc/init/paperplane.conf

## Additional Information
* All files and links are removed at 12AM each day.
* Uploads are stored in /var/local/paperplane/uploads



