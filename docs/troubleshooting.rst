ontainer Troubleshooting
-------------------------


* Docker won't start

 ``sudo systemctl enable docker && sudo systemctl start docker``

* Docker crashes on ``first_run.sh``

Try again with ``sudo``, ``chown -R $USER:$USER /path/to/your/issf/directory/`` Reboot  

