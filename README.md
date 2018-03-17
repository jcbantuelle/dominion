# Dominion [![Code Climate](https://codeclimate.com/github/jcbantuelle/dominion-meteor/badges/gpa.svg)](https://codeclimate.com/github/jcbantuelle/dominion-meteor)

A website implementation of the board game Dominion, based off the former site dominion.isotropic.org. Built on Meteor and backed by MongoDB.

## Development

To run the game locally, just make sure you've got [Meteor](https://www.meteor.com/install) installed, then clone down the repository and run it!

    meteor run --settings=settings-dev.json

## Production

Meteor apps can be built into optimized node applications which don't require the `meteor` tool to run. Instead, node and MongoDB must be available. `dominion-meteor` has been tested with node 4.x and node 6.x, and with MongoDB 3.2.

Copy `settings-dev.json` to `settings-prod.json` and edit it to match your deployment details. Export the following env variables:

    export METEOR_SETTINGS=$(cat settings-prod.json)
    export MONGO_URL=mongodb://localhost:27017/example
    export ROOT_URL=http://example.com

Build the optimized bundle as a directory:

    npm install
    meteor build /path/to/build --directory

Install the compiled dependencies and run the app:

    cd /path/to/build/bundle
    (cd programs/server && npm install)
    node main.js

## Docker Compose

Alternatively you may run the game in a Docker Compose stack. Both the development and the production modes are supported. Refer to the `README` in the `compose` directory.

## Usage

This game is built with the expectation that it'll be run as a private server. Once a user has signed up, an admin will need to verify the account before they're allowed to play. To create the admin account, just sign up as normal, then in the mongo console, set an attribute of `admin: true`. This will allow you to access the `accounts` page when you're signed in, where you can approve/unapprove users who have signed up.
