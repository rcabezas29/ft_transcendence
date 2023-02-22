---
layout: default
title: Friendships
parent: API 
---

## Friendships

### GET /friendships

Returns all friendships

```json
{
	"id": 1,
	"user1Id": 16,
	"user2Id": 19,
	"status": 0
},
{
  ...
}
```

### GET /friendships/:id

Returns one friendship between two users by friendship id.

```json
{
	"id": 1,
	"user1Id": 16,
	"user2Id": 19,
	"status": 0
}
```

### GET /friendships/:id/request-direction

Returns a `FriendRequestDirection` that indicates whether the user is the friend request sender or the receiver.

If the friendship status is not `Pending`, the friendship is not a friend request and the `FriendshipService`
will throw a `BadRequestException`.

The `FriendRequestDirection` is simply an enum, with value `0` if the user is the `sender`, and `1` if the user
is the `receiver`. This is determined by the order of the `user1Id` and `user2Id` columns in the `friendship` table in the database.

### GET /friendships/:id/block-direction
Returns a `BlockDirection` that indicates whether the user is the blocker or the blocked user.

The `BlockDirection` is an enum, with value `0` if the user is the `blocker`, and `1` if the user
is `blocked`. This is determined by the `userId` and `blockedUserId` columns in the `blocked_friendship` table in the database.

### POST /friendships

Creates new friendship relationship and returns the created friendship

Expected body:
```json
{
	"user1Id": 16,
	"user2Id": 19,
	"status?": 0 // optional; default = 0
}
```

### PATCH /friendships/:id

Updates a friendship's status by friendship id.


Expected body:
```json
{
	"status?": 0
}
```

### PATCH /friendships/:id/block

Blocks a user (i.e. sets the friendship's status to 2 and creates a row in the `blocked_friendship` table
in the database).

No expected body.

### PATCH /friendships/:id/unblock

Unblocks a user (i.e. sets the friendship's status to 1 and deletes the corresponding row from
the `blocked_friendship` table in the database).

No expected body.

### PATCH /friendships/:id/accept-request

Accepts a friend request (i.e. sets the friendship's status to 1).

No expected body.

Returns the updated friendship.

### DELETE /friendships/:id/deny-request

Denies a friend request (i.e. removes the friendship). The difference with a simple `DELETE /frieds/:id`
is that the `deny-request` one includes some extra logic.

### DELETE /friendships/:id

Deletes a friendship by friendship id.
