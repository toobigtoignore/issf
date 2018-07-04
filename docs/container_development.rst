Container Development 
----------------------------------------- 

As you should already know, ISSF is designed around the principle of
containerization, whereby the software is put into a container (like a virtual
machine but smaller with less overhead) and run from there. 

The advatanges of containerization are:

* OS independant

  - Helpful if we need to migrate server infrastructure
  - Makes development really easy. It runs identically on any major OS.
  - No iffy or unexpeected cross-platform behavior, vulnerable to changes in OS/Software/Hardware. 
    
* Easy to spin up, break, trash, etc. Just delete and start anew if you break it!

* Extra security options by compartmentalizing the main software from the database and the host OS.

Building the container 
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Use ``scripts/dockerbuild.sh`` to build the container into an image locally.
This is what we use to compile the container before publishing to the Docker
Hub. Make sure you take note of what this script does, as it takes the liberty
of clearing out old docker images/containers that have built up over time!

Submitting build changes
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Changes to the container can be submitted through GitHub with the same process
as if it was regular code. Publishing docker images to the Docker Hub is 
currently only done by the project maintainer. 

If you haven't already read up on the regular development/contribution process,
do so before submitting a Pull Request.

