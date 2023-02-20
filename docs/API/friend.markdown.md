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

### PATCH /friendships/:id/accept-request

Accepts a friend request (i.e. sets the friendship's status to 1).

No expected body.

Returns the updated friendship.

### DELETE /friendships/:id/deny-request

Denies a friend request (i.e. removes the friendship). The difference with a simple `DELETE /frieds/:id`
is that the `deny-request` one includes some extra logic.

No expected body.

### DELETE /friendships/:id

Deletes a friendship by friendship id.
