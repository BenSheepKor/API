#!/bin/bash

# This is a script that pulls from git, runs npm install and restarts the pm2 process

# Scirpt is placed in root of remote server. We have to cd into the API directory

cd server/API

# Pull latest changes from git
git pull

# Run npm install. Yes @Dimos I am looking at you ¯\_(ツ)_/¯.
npm install

sleep 1

npm run seed

# Run database seeder
node seeder.js

# Restart the node server so the changes apply
pm2 restart server

# Wait two seconds
sleep 2

# Check that server is up and running after latest updates
pm2 status server

