---
layout: default
title: Chat 
parent: Gateway 
---

# Chat

## Frontend

In the frontend the `directMessageConntroller` is in charge of managing all events related to the Chat Direct Messages,
and the `channelController` manages all events related to the Chat Channels.


## Backend

In the backend the `chat.gateway` and `chat.service` and `channels.service` are in charge of managing all the events
related to the Chat.

The `gateway-manager.service` is injected into `chat.gateway`, use it to manage the users that are connected to the server.

The `gateway-manager.gateway` is injected into `chat.gateway`, use it to access the server instance.

## Event relation between the Frontend and Backend

### Direct messages

- **On client connection and disconnection to the server**: when the client gets a `connected-friends`, `friend-online` or a `friend-offline` event, it is managed through the `friendsController`, which at the same time calls some relevant connection
and disconnection functions in the `directMessageController` in order to add/remove the newly connected/disconnected
friends and chats.

- **On direct message**: When a client sends a direct message to a friend, the user sends to the server a `direct-message` event containing the addressee
friend and the message. When the server receives the event it checks if the client and the addressee are friends. If that is the case the server sends a 
`direct-message` event to the addressee with the sender and the message.

### Channels

- **On client connection to the server**: the server sends to the connected client an `all-channels` event,
containing an array of all existing channels (without a `Chat`).
- **On channel creation**: the client sends a `channel-create` event to the server, and the server sends
back a `channel-created` event to notify the creator of the channel that the creation was successful. The
creator becomes the channel owner. The server also sends a `new-channel` event to all other clients
(except the creator), so that they can include the newly-created channel in their map of `channels`.
- **Join channel**: the client sends a `join-channel` event to the server to join a channel. The server
sends back a `channel-joined` event to notify the user that they have joined the channel successfully. The
server also sends a `new-user-joined` event to the other clients members of the channel, to notify them that a new
user has joined the channel.
- **Leave channel**: the client sends a `leave-channel` event to the server to leave a channel. If the user was
the channel owner, the next user in the channel's `users` array becomes the owner. If the user was
the last member of the channel, the channel is deleted. Otherwise, the server sends back a `channel-left`
event to notify the user that they have left the channel successfully. The server also sends a
`user-left` event to tell the other members of the channel that the user left the channel. 
- **On channel deletion**: the server sends a `deleted-channel` event to the clients to notify them of deleted
channels.
- **On channel message**: when a client sends a message to a channel,  the client sends to the server a
`channel-message` event containing the name of the channel, the username of the sender and the message. 
The server checks if the client is muted and, if that is not the case, sends a `channel-message` event to
the room of that channel.
- **On user ban**: the client sends a `ban-user` event to the server to ban a user. The user is kicked out
from the channel and added to the `bannedUsers` map of that channel. When a user is banned successfully,
the server sends a `user-left` event to members of the channel. Only channel admins can
ban other users. If a client attempts to join a channel but they have been previously banned from it,
the server will send a `user-banned` event to the client. Within this
event's payload, the client also gets the amount of time remaining for the ban to be lifted.
- **On user mute**: the client sends a `mute-user` to the server to mute a user. Only channel admins can
mute other users. When a client attempts to write a message on a channel but they have been
previously muted, the server will send a `user-muted` event to the client. Within this event's
payload, the client also gets the amount of time remaining for the mute to be lifted.
- **On admin set/unset**: the client sends a `set-admin` or `unset-admin` to the server in order to set or unset
a user as channel admin. Then, the server sends a `admins-updated` event to notify all clients that a channel's
admin has been set/unset. Only channel owners can set/unset admins.
- **Passwords**: the client sends a `set-password` to the server to set/change a channel's password.
The client sends an `unset-password` event to the server to unset a channel's password (i.e. make it public again).
Only channel owners can manage a channel's password. When a channel's password has been
set/changed/unset successfully, the server sends a `password-updated` event to all
clients, its payload contains a bool `password` property which is `true` if the password is set, or `false` if unset
(so client can know whether the channel is password-protected or not). If a client attemps to join a
password-protected channel using an incorrect password, the server will send a `wrong-password` event to the client.
