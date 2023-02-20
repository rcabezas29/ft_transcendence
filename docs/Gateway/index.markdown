---
layout: default
title: Gateway
has_children: true
---

# Gateway

The gateway part of the project defines how the socket communication between the client
and the server works.

In the backend the `gateway-manager` is in charge of managing the connection and disconnection of the
user socket. The `gateway-manager.service` must be used to manage the users that are connected to the server.
The `gateway-manager.service` contains an attribute `users` which is an array of the connected users.

The `gateway-manager.service` contains two `Function` arrays: `onNewConnectionCallbacks` and `onDisconnectionCallbacks`,
which contain all the callbacks that will be called by the `gateway-manager.gateway` on client connect and
disconnect, respectively. All services which intend to add events on connection/disconnection to the gatewayManager, must
make use of those callback arrays using the GatewayManagerService's `addOnNewConnectionCallback()` and 
`addOnDisconnectionCallback()` methods. This is necessary because the `gateway-manager.gateway` will do some generic
checks and actions before it starts calling the callbacks.

There are three websockets events that are sent directly from the `gateway-manager.service`:
* **On client connection to the server**: the server sends to the connected client a `connected-friends`
event with an array of connected friends. Any friend of the connected client who was already online when
the new client connected will receive a `friend-online` event from the server with the newly connected client.

* **On client disconnection from the server**: the server sends to all the friends of the disconnected
user a `friend-offline` event with the disconnected client.

In the frontend, these events are handled from the `friendsController`. The rest of events are handled from
their respective sections, in either the chat or game controllers.
