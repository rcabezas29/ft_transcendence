---
layout: default
title: Users 
parent: API 
---

## Users

### GET /users

Returns all users

```json
{
	"id": 1,
	"username": "rcabezas",
	"email": "rcabezas@student.42madrid.com",
	"avatar": "photo.jpg",
},
{
  ...
}
```

### GET /users/:id

Returns one user

```json
{
	"id": 1,
	"username": "rcabezas",
	"email": "rcabezas@student.42madrid.com",
	"avatar": "photo.jpg",
}
```

### GET /users/avatar/:id

Returns a user's avatar

### GET /users/:id/friends

Returns a user's friends in the `UserFriend[]` format:

```json
{
	"userId": 2,
	"username": "user2",
	"friendshipId": 20,
	"friendshipStatus": 1,
},
{
  ...
}
```

### GET /users/search/:username

Searches users by a fragment of a username, and returns an array with all the partial matches.

### POST /users/avatar/:id

Posts an image to replace the user's avatar image.

Expected body: `multipart/form-data` containing the image.

### PATCH /users/:id

Updates a user

Expected body:
```json
{
	"username?": "apavel",
	"avatar?": "photo.jpg",
	"elo?": "1000",
	"password?": "*********"
}
```

### DELETE /users/:id

Anonymizes a user
