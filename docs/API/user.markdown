---
layout: default
title: User 
parent: API 
---

## User

### POST /auth/login

Returns JWT token

```json
{
	"email": "email@example.com",
	"passowrd": "password"
}
```

### POST /auth/register

Creates new user and returns the created user

```json
{
	"username": "username"
	"email": "email@example.com",
	"passowrd": "password"
}
```