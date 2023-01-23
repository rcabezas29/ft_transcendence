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

### POST /users

Creates new user and returns the created user

Expected body:
```json
{
	"username": "rcabezas",
	"email": "rcabezas@student.42madrid.com",
	"password": "*********"
}
```

### PATCH /users/:id

Updates a user


Expected body:
```json
{
	"username": "apavel",
	"avatar": "photo.jpg",
	"password": "*********"
}
```

### DELETE /users/:id

Deletes a user
