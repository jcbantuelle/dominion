# Dominion [![Code Climate](https://codeclimate.com/github/jcbantuelle/dominion-meteor/badges/gpa.svg)](https://codeclimate.com/github/jcbantuelle/dominion-meteor)

A website implementation of the board game Dominion, based off the former site dominion.isotropic.org.

## Installation

This game is built on Meteor and is backed by MongoDB. To run the game, just make sure you've got [Meteor](https://www.meteor.com/install) installed, then clone down the repository and run it!

## Usage

This game is built with the expectation that it'll be run as a private server. Once a user has signed up, an admin will need to verify the account before they're allowed to play. To create the admin account, just sign up as normal, then in the mongo console, set an attribute of `admin: true`. This will allow you to access the `accounts` page when you're signed in, where you can approve/unapprove users who have signed up.
