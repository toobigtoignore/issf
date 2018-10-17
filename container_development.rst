Container Development
---------------------

This sections covers the development of the scaffolding that holds up the ISSF, but is not
part of the ISSF software unto itself.

As you develop the ISSF, you may sometimes find yourself needing to update a library. The proper way of doing this, much like
in a non-containerized environment, is to update the library in pip/npm on the shell. The difference now, is to use the 
``scripts/docker_shell.sh`` script to give you shell access to the container. **Take note!** If you do this, you will lose those 
changes after you restart the container. In a pinch, this won't be an issue. But you wouldn't want to keep doing this. So below
will explain how you can rebuild the container to make the changes persistent on your local machine.




As you should already know, ISSF has been re-designed around the principle of containerization, 
whereby the software is put into a container (like a virtual machine but smaller with less overhead) and run from there.

The advatanges of containerization are:

- Helpful if we need to migrate server infrastructure 
- Makes development really easy. It runs identically on any major OS. 
- Easy to spin up, break, trash, etc. Just delete and start anew if you break it! 
- Extra security options by compartmentalizing the main software from the database and the host OS.


Building the ISSF container
^^^^^^^^^^^^^^^^^^^^^^^^^^^
Navigate to the root of the project directory that contains the dockerfile.

You will notice the commented out the lines ``#build`` and below it, ``#context: './'``, 
this is for when you have to build the ISSF container yourself locally, as opposed to pulling 
the pre-built image from the Docker Hub, but still need the rest of the containers and your 
orchestration of them to continue as if nothing has changed. This is needed for doing development
on the containre itself, because you’re now working locally with the container and making changes
that are reflected on your system only.

If you’re building the container and need to work on it independently from the other containers, run:

``docker build -t tbti/web -f Dockerfile .`` 

to build the container into an image, based on the Dockerfile in the . directory, which is where 
we are currently. Notice that if you’re building the container for use with docker-compose 
we use the context : './' notation in the docker-compose file to symbolize that we want to build
the container locally, not pull a pre-built image.

Launch the container, with:

``docker run --name="web" tbti/web /bin/bash``

Next, we need to commit this build. This is a little reminiscent of git, but not nearly as powerful.

``docker commit -m "Commit message" -a "Firstname Lastname" issf tbti/web:latest``

Now log into docker and push your commit: 

``docker login && docker push tbti/web``

Building the other containers
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
Don’t bother, both the pg_admin and postgres containers require no custom work done to them, 
so there’s no point in building those from scratch. Just simply pull the image for the docker hub.

Container Development Workflow Tips
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
Many of the changes you make to the container will involve, at the very least, you restarting the container. 
But sometimes you need to actually destroy the container and start again. This is why dockernuke.sh in the 
scripts directory exists. Be careful as it will erase all docker containers and images, giving you a 
superficial fresh install of docker.

Submitting build changes
^^^^^^^^^^^^^^^^^^^^^^^^

Changes to the container can be submitted through GitHub with the same process as if it was regular code. 
Publishing docker images to the Docker Hub is currently only done by the Project Maintainer.

When the Project Maintainer receives a PR on the ``container`` branch, they will review it and rebuild the container so that 
the new and updated version of the image will be available on Docker Hub, and downloaded as per usual with ``tbti/web:latest``
jargon in the ``docker-compose.yml`` file.

If you haven’t already read up on the regular development/contribution process, do so before submitting a Pull Request.
