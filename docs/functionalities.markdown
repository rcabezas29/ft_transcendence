---
layout: default
title: Functionalities 
---

In this page are specified all the functionalities the project must fulfill

## User Account

- A user must log in using the OAuth system of 42 intranet
- A user must be able to choose a unique name that will be displayed on the website
    - The default username will be the intranet login
    - The user would be able to change it at the user settings page.
- A user must have several stats.
    - Wins / Losses / Draws
    - Win / Loss ratio
    - Level
        - For every match won / loss the user will recieve experience
    - Goal average
- A user must have an avatar generated or uploaded by the user.
    - The default user avatar will be the intranet photo.
    - The user would be able to change it at the user settings page.
- A user must be able to activate a 2-factor authentication
- A user can add other users as friends, and see their current status (online, offline, in a game...)
- Each user has a match history (including duel, ladder) that can be consulted by anyone logged-in

## Chat

- Users must be able to create channels public/private or protected by a password
- Users must be able to send direct messages to other users
- Users must be able to block other user and therefore they will not see their messages anymore
- A user that creates a new channel is automatically its owner until he leaves the channel
    - owner of a channel can add/change/remove a password to access the channe
    - owner can select a user to be an administrator and is also an administrator of the channel
        - administrator can ban or mute users for a certain amount of time
- Through the chat interface users should be able to ask other players to do a Pong match
- Through the chat interface users must be able to see other players profiles

## Game

