Security
=========================

Handling of Secure Artifacts and SECRET_KEY
---------------------------------------------

A secure artifact is defined as any piece of senstitive data existing in a
project that you wouldn't want to be publicly available, tracked in VCS, etc. A
prime example of this is the ``SECRET_KEY`` variable that is stored in a
``.env``` file, which is used by  ``settings.py`` (with the help of
``python-decouple``) to get important (and secret!) credentials while keeping
them decoupled from the actual ``settings.py`` file, or even from a ``.py``
file period. Every Django project uses a hash called a ``SECRET_KEY`` which is
what is uses for sessions, authentication, etc.  *If this key is compromised,
so is user information, sessions, etc.* The key is also difficult to change, so
it's equally important the key is never *lost*.  


