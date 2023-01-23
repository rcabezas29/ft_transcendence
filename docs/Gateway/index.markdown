---
layout: default
title: Gateway
has_children: true
---

# Gateway

The gateway part of the project defines how the socket communication between the client
and the server works.

In the backend the `gateway-manager` is in charge of managing the connection and disconnection of the
user socker. The `gateway-manager.service` must be used to manage the users that are connected to the server.
The `gateway-manager.service` contains an attribute `users` which is an array of the connected users.