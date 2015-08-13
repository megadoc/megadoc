Support Week
============

What you do
-----------

Monitor #donk_users, work on high priority bugs and help with reviews.

How you do it
-------------

Support week tasks often involve console access.

### Poking around in the console

Edge

1. `dongo shell donk_deploy_edge`
2. `./bin/appssh -s donk-edge -g us-west-2`
3. `./bin/rails console`

Master

1. `dongo shell donk_deploy`
2. `./bin/appssh -s donk-master`
3. `./bin/rails console`

Production

1. `dongo shell donk_deploy`
2. `./bin/appssh -s donk-production`
3. `./bin/rails console`

### Poking around on the host
Sometimes you need to check out the docker container on the host or look in some of the logs that are found on the host. You can do that by running the following:

bin/appssh command with the `-t host` option like so:

First box: `./bin/appssh -s donk-edge -g us-west-2 -t host`

Second box: `./bin/appssh -s donk-edge -g us-west-2 -t host -i 1`

Worker box: `./bin/appssh -s donk-edge -g us-west-2 -t host -r work`
