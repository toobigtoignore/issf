Information System on Small-Scale Fisheries (ISSF)
==================================================

A global, open-source collaborative database of information on small-scale
fisheries

|docs|

.. image:: screenshot.png

The ISSF homepage, accessible `here <https://www.issfcloud.toobigtoignore.net>`_.

About
-----

The Information System on Small-Scale Fisheries (ISSF) is an open-source
research project to source information on small-scale fisheries from across
the globe. The project is built on top of Python and Django, PostGIS,
Foundation, and Docker.

Development
-----------

Ensure that you have ``docker`` and ``docker-compose`` installed::

    cd /path/to/issf/
    ./first_run

Some issues may occur during setup, but irregardless attempt to run::

    docker-compose up

Roadmap
-------

- v2.0.0

  - Upgrade to Django 2.0 and updated major Python libs
  - Migrated entire system to Docker containers with Docker Compose
  - Set up TravisCI
  - Set up NPM and Webpack
  - Added project documentation, written with Sphinx
  - Address all currently known bugs

Contributing
---------------------------------------------
Read our documentation `here <https://issf.readthedocs.io/en/latest/contributing.html>`_ to contribute. Thank you for contributing!

See our list of contributors `here. <https://github.com/toobigtoignore/issf/graphs/contributors>`_

.. |build-status| image:: https://img.shields.io/travis/rtfd/readthedocs.org.svg?style=flat
    :alt: build status
    :scale: 100%
    :target: https://travis-ci.org/issf/readthedocs.org

.. |docs| image:: https://readthedocs.org/projects/issf/badge/?version=latest
    :target: http://issf.readthedocs.io/en/latest/?badge=latest
    :alt: Documentation Status
