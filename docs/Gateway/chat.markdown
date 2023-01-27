---
layout: default
title: Chat 
parent: Gateway 
---

# Chat

## Frontend

In the frontend the `ChatController` is in charge of managing all events related to the Chat.


## Backend

In the backend the `chat.gateway` and `chat.service` are in charge of managing all the events related to the Chat.
The `gateway-manager.service` is injected into `chat.gateway`, use it to manage the users that are connected to the server.

## Event relation between the Frontend and Backend

- **On client connection to the server**: the server sends to the connected client a `connected-friends` event with an array of connected friends.
Any friend of the connected client who was already online when the new client connected will receive `friend-online` event from the server with the
newly connected client.

- **On client disconnection from the server**: the server sends to all the friends of the disconnected user a `friend-offline` event with the disconnected
client.

- **On direct message**: When a client sends a direct message to a friend, the user sends to the server a `direct-message` event containing the addressee
friend and the message. When the server receives the event it checks if the client and the addressee are friends. If that is the case the server sends a 
`direct-message` event to the addressee with the sender and the message.

## Channels

- **channel-create**: Event from client to server to create a channel
- **channel-created**: Event from server to client to notify the creator of a channel that the creation was successful.
- **new-channel**: Event from server to client when a new channel is created (but the client did not create it), so that the client can include it in their list of `allChannels`.
- **all-channels**: Event from server to client containing an array of all existing channels. Sent to the client when he joins, and sent to everyone whenever a user leaves (in case any channels were deleted, because if a user disconnects and he was the only one remaining in a channel, the channel is removed from the list of channels, so the `allChannels` list must be updated).
- **join-channel**: Event from client to server to join a channel.
- **channel-joined**: Event from server to client to notify the user that they have joined a channel successfully.
- **new-user-joined**: Event from server to clients members of a channel, to notify them that a new user has joined the channel.