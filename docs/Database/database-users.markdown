---
layout: default
title: Users
parent: Database
nav_order: 1
---

### user table

The users are in the `user` table and are defined as:

| id  | username  |       email       |       avatar       |    password     |  elo |
|-----|-----------|-------------------|--------------------|-----------------|------|
|  1  |   user1   | user1@example.com | default-avatar.png | hashedpassw0rd1 | 1000 |
|  2  |   user2   | user2@example.com |      user2.png     | hashedpassw0rd2 | 2000 |
|  3  |   user3   | user3@example.com | default-avatar.png | hashedpassw0rd3 | 1000 |

- **username**: unique username
- **email**: unique email
- **avatar**: avatar image filename. Avatars are located in the `backend/avatars/` folder.
- **password**: hashed password.
- **elo**: game elo.
