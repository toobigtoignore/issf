Server Maintenance Guide
=================================

**Patching Schedule**

**Building a Compute Canada new instance:**


The following process is mostly for educational purposes. *Do not* do this on any server, because it has already been done. This is reference material in case you ever needed to know what was done to provision the existing servers.

- Install the necessary system packages:
    ``sudo apt-get install django blah blah postgres apache blah blah``

**Note:** *The development and production servers are designed to be near replicas of each other. The development server is also a place to perform a dry run of system updates, patches, migrations, backups, etc. Just about everything should probably be done on the development server first to make sure that it won't destroy the real thing.* 



