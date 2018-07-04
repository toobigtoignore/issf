Development Guide
----------------------------------------- 

For all technical details about contributing as a developer, see the
Development section. For logistical details, such as how to interacting
with other developers, submitting pull requests, etc. please continue 
reading. 

Creating a development environment
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

In order to contribute as a developer you will require a place to run and modify code in order to change or update features on the ISSF site. This process is covered in detail in the 


Using Git & GitHub
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
In order to contribute as developer, you must learn the basics of 
``git`` and GitHub, a place to collaborate on projects using ``git``. Git must be installed on your operating system. 

Follow this installation_ guide for Git, and then follow this Git tutorial_ if you are new to Git.

Using Git Branches Effectively
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

How to switch branches in order to work on separate features properly: 

.. code-block:: bash

    git fetch origin
    git checkout -b <local branch> <remote>/<remote branch>

    #Create your changes to the code!

    git add yourchangedfile.file
    git commit -m 'Brief explanation of changes you made'
    git push origin <remote branch> #Make sure this is the right branch!

    #Never commit directly to master, unless you would also immediately 
    #push it to the server at the same time, which is never!


Submitting Pull-Requests
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Opening an Issue on GitHub
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. _tutorial: https://try.github.io/
.. _installation:  https://git-scm.com/book/en/v2/Getting-Started-Installing-Git
