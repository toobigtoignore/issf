Server Stack 
=========================


Overview
--------
The ISSF project runs on a Compute Canada instance named ``issfportal`` on 
the address ``https://issfcloud.toobigtoignore.net`` the 
domain itself, (``toobigtoignore.net``) was purchased with 
1and1 hosting. That's the place to go for domain renewal, for example.
The information such as hosting plan, billing, etc aren't currently
tracked in documentation so ask whomever is managing the project. 
The subdomain (``issfcloud``) is a redirect setup on the web hosting 
panel that points to  ``issfportal`` Compute 
Canada instance. Clear as mud.


Production Server 
-----------------

- ``issfportal`` 

- ``https://issfcloud.toobigtoignore.net``

- Ubuntu 16.04LTS

- Compute Canada (p2-1.5)


- Is always angry, one day will be replaced by a improved snapshot of dev.


Development Server
------------------

- ``issfdev`` 

- Ubuntu 16.04LTS

- Compute Canada (p2-1.5)

- Cool and new 

It should be stated that ``issfportal`` is the *production* server and as 
such extreme care should be made when doing anything to or on it. Which 
is why ``issfportaldev`` exists, it is a carbon copy also on Compute 
Canada. It has an IP of and is where any and all 
development or server configuration should be done. Once you've made a 
change *and verified that it doesn't break* you can then safely apply 
that same change on production. There is an instance snapshot of 
``issfdev`` that exists for the purpose of rolling back dev in 
case you break it. If you're purposely trying to break things 
(i.e pentesting) I'd recommend running a local dev environment in 
VirtualBox (optionally based off an OpenStack snapshot) and doing 
your breaking there. 



Creating an OpenStack Instance
---------------------------------

  - It's important that you add a Key Pair during the instance creation in order to 
    have something to SSH in with on first login.
  - After the server is set up you can ``ssh-copyid``, ``scp``, or copy-paste the rest of the
    public keys in whichever matter you deem secure. More on this below.

Adding & Securing UNIX Users
---------------------------------

  - Special UNIX Users:
        - ``postgres`` 
        - ``apache``
  - Manually Added UNIX Users:
        - ``issf`` 
        - And a user for each developer working on the project.  

SSH Access & Deploy Keys
---------------------------------
  - Development Server:
        - ``issfdev``
        - ``issfdev.pub``
        - ``issfdeploy.pub``
          
  - Production Server:
        - ``issfcloud``
        - ``issfcloud.pub``
        - ``issfdeploy.pub`` 

``issfdeploy`` is a Deploy Key used by GitHub so that a user on the server has pull access to the Git repo, without having to store someones private keys on the server that belong to them. This way if the server is compromised they only gain access to the git repo, not to one or more developers entire accounts. That's also why we have off-site backups.

Most likely the easiest thing to do for setting up SSH keys is to simply copy Both servers have each others keys added in their authorized_keys and known_hosts files so that data may be transferred in between them accodingly. 

SSH Configuration Settings
---------------------------------

It's important to use a ``config`` file in ``~/.ssh`` on the server (and your development machine!) when using git to pull or push to the repo. When you use SSH, you have the option to pass the ``-i`` flag specifiying which SSH Key you want to use. Git doesn't seem to provide this option when cloning over SSH, so you can tell Git implicitly what to use by making a configuration file for the SSH client. Its contents should be as follows:

.. code-block:: bash

    Host github.com
        User git
        Hostname github.com
        PreferredAuthentications publickey
        IdentityFile /home/user/.ssh/issfdeploy

This will tell SSH that when we're connecting to hostname ``github.com`` we want to use a specific key, in the case of the dev and prod servers that would be the special ``issfdeploy`` key.


Locale Generation
---------------------------------

You may need to set the locales for the Ubuntu instance.
Locales over SSH (and in containerized virtual environments) seem to get choosy. There are several ways to solve and regenerate locales but the only one I've found that really works is the following:

.. code-block:: bash

    sudo locale-gen en en_US en_US.UTF-8
    #This one will open up an ncurses gui, select en_US.UTF-8
    sudo dpkg-reconfigure locales
    export LC_ALL="en_US"

Installing the other EN locales is probably overkill, but look at it the wrong way and the locales just fall apart. This method works and stays out of our way.


System Package Provisioning
---------------------------------


.. code-block:: bash

   #Weigh the importance of security updates vs. stability before updating:
   sudo apt-get update && sudo apt-get upgrade 
   sudo apt-get install docker docker-compose  

Whether or not you choose to update the system is up to you. There are 
likely important security updates waiting, so perhaps configure the server, 
create a snapshot, patch the server, and if something breaks then roll 
back the snapshot.

Python Environment Configuration
---------------------------------

.. code-block:: bash

    #It's important we install this package globally,
    #and not in a virtual environment. 
    pip install virtualenvwrapper
    echo export WORKON_HOME=~/envs >> ~/.bashrc

    #Create directory with the path of WORKON_HOME    
    mkdir -p $WORKON_HOME     
    
    #This path may change between Ubuntu versions.
    echo source ~/.local/bin/virtualenvwrapper.sh >> ~/.bashrc 
    
    source ~/.bashrc
    mkvirtualenv issf    
    pip install -r requirements.txt

    #Close your virtualenv (and open after creating)
    deactivate 
    workon issf


Django Environment & Settings Configuration
---------------------------------

Perhaps the most important piece thing to keep in mind is to always
use ``manage.py`` instead of django-admin. ``manage.py`` basically 
does a bunch of stuff for you already, like adding your project 
to Python's sys path. 

Every Django project requires a settings file in order to to understand what 
and where the database engine is, credentials, etc. Which is why any 
``settings.py`` files are most likely a secure artifact that should not be 
stored in version control. 

.. code-block:: bash
    
    #In the case of a production environment:
    echo export DJANGO_SETTINGS_MODULE=issf_prod.settings.production >> ~/.bashrc
    #In the case of a development environment:
    echo export DJANGO_SETTINGS_MODULE=issf_prod.settings.debug >> ~/.bashrc
    source ~/.bashrc

This has now permanently set which settings file to use. To switch temporarily, run:

.. code-block:: bash

    export DJANGO_SETTINGS_MODULE=issf_prod.settings.changedmymind

Database Configuration
---------------------------------

As explained in the step on system package provisioning you will already 
have everything needed. If not already done, you must create a special 
database user. 


Add a line like this into  ``/etc/postgresql/9.5/main/pg_hba.conf`` there 
may be a similar line that exists already that needs to be changed. Try adding 
it first, if things don't shape up then try replacing the similar looking 
line with this one: 


.. code-block:: bash

    local   all             postgres                                md5 


Installing mod_wsgi
---------------------------------

The proper way of running Django in production is to use ``mod_wsgi`` as a 
module with Apache2, this way you end up with a run of the mill Apache server. 
Because our ``issfdev`` instance must match ``issfportal`` in order to create 
a reproducible environment for development, ``issfdev`` also runs Apache2 
and ``mod_wsgi``. For a more detailed guide on installing ``mod_wsgi`` should you 
run into issues, read it here_.

Next we must make changes to the ``httpd.conf`` file 

First, install ``mod_wsgi``:

.. code-block:: bash
    
    wget https://github.com/GrahamDumpleton/mod_wsgi/archive/4.5.22.zip
    unzip 4.5.22.zip
    cd ./mod_wsgi-4.5.22/
    ./configure
    make
    sudo make install

Next we must make changes to the ``httpd.conf`` file to tell Apache to load the ``mod_wsgi`` module. In the ``httpd.conf`` file (``/etc/apache2/apache2.conf``) and add this line into the file

.. code-block:: bash
    
    LoadModule wsgi_module /usr/lib/apache2/modules/mod_wsgi.so 


After ``mod_wsgi`` has been installed, modifications must be made to your 
``httpd.conf`` file. In Ubuntu this is located at ``/etc/apache2/apache2.conf`` 
and changes to it should never be made on production *unless* they've been 
tested out on ``issfdev`` first.

.. _here: https://modwsgi.readthedocs.io/en/develop/user-guides/quick-installation-guide.html



