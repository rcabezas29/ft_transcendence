---
layout: default
title: Friends 
parent: API 
---

## Friends

### GET /friends

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

### GET /friends/:id

Returns one friendship between two users

```json
{
	"id": 1,
	"user1Id": 16,
	"user2Id": 19,
	"status": 0
}
```

### POST /friends

Creates new friendship relationship and returns the created friend

Expected body:
```json
{
	"user1Id": 16,
	"user2Id": 19,
	"status": 0
}
```

### PATCH /friends/:id

Updates a friendship's status


Expected body:
```json
{
	"status": 0
}
```

### DELETE /friends/:id

Deletes a friend
