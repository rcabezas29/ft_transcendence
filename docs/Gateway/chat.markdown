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

## Event relation between the Frontend and Backend

- **On client connection to the server**: the server sends to the connected client a `connected-friends` event with an array of connected friends.
Any friend of the connected client who was already online when the new client connected will receive `friend-online` event from the server with the
newly connected client.

- **On client disconnection from the server**: the server sends to all the friends of the disconnected user a `friend-offline` event with the disconnected
client.

- **On direct message**: When a client sends a direct message to a friend, the user sends to the server a `direct-message` event containing the addressee
friend and the message. When the server receives the event it checks if the client and the addressee are friends. If that is the case the server sends a 
`direct-message` event to the addressee with the sender and the message.