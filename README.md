# Web Observatory Deployment Guide

First you need to install Nginx, MongoDB, Nodejs.

## Nginx settings

An annotated configuration file `wo` and SSL certificate `wo.pem` and key `wo.key` can be found under `nginx`. Please refer to the configurtion file for more details.

On Ubuntu copy `wo` to `/etc/nginx/sites-available` and create a soft link in `/etc/nginx/sites-enabled`. Check whether the configuration is valid using `nginx -t`.

    sudo cp nginx/wo /etc/nginx/sites-available
    sudo ln -s /etc/nginx/sites-available/wo /etc/nginx/sites-enabled/wo
    sudo nginx -t

Then copy SSL cert/key files to `/etc/nginx/ssl`

    sudo cp nginx/wo.* /etc/nginx/ssl

## Meteor settings

Meteor settings are available in a Upstart script `wo.conf`. For security the script is run under a normal user `wo`. To make it work you need to add the user `wo` first.

    sudo adduser --disabled-login wo
    sudo cp wo.conf /etc/init

In the settings given by `METEOR_SETTINGS`, if `public.environment` is dev, then some fake data will be loaded to the MongoDB database.

## Start WO

Extract `build/wo.tar.gz` to `/home/wo` and then start WO following `/home/wo/bundle/README`. Note that the same settings of wo.conf should be used.

Currently Meteor (1.2.1) works with Node v0.10.x. Make sure you have the right version of Node installed.

    sudo cp build/wo.tar.gz /home/wo
    cd /home/wo
    sudo tar -zxf wo.tar.gz
    cd bundle
    (cd programs/server && sudo npm install)
    sudo start wo

## Upgrade from Previous WO

### Export data from a previous WO

Edit `migrate/config.js` and set `from` to the source MongoDB address. Then do

    cd migrate
    npm install
    node migrate.js

Exported data can be found at `app/private`.

### Import

At `migrate/import`, set `MONGO_URL` to the MongoDB address, and run the meteor app.

    export MONGO_URL=mongodb://localhost:27017/wo
    meteor reset
    meteor

After this you can start your WO normally.
