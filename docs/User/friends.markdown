---
layout: default
title: Friends 
parent: User 
---

# Friends

The friends are relationships between multiple users. They are in the `friendship` table and are defined as:

| id  | user1Id | user2Id | status  |
|-----|---------|---------|---------|
|  1  |    5    |    4    |    0    |
|  2  |    5    |    2    |    1    |
|  3  |    8    |    1    |    2    |

- **user1Id**: The user who sent the friend request.
- **user2Id**: The user who received the friend request. 

The friendship between two users has multiple status:
- **0**: pending
- **1**: active (friendship was accepted)
- **2**: blocked