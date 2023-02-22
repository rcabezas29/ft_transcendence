---
layout: default
title: BlockedFriendships
parent: Database
nav_order: 3
---

### blocked_friendship table

This table determines the direction of a block between two users. When
a friendship (from the `friendship` table) has blocked status
(i.e. `status == 2`), a row is created in this table to establish who blocked who.
The `blocked_friendship` table is defined as follows:

| id  | friendshipId | userId | blockedUserId |
|-----|--------------|--------|---------------|
|  1  |      3       |    1   |       8       |
|  2  |      10      |    4   |       3       |
|  3  |      1       |    5   |       4       |

- **friendshipId**: the ID of the friendship as defined in the `friendship` table.
- **userId**: The ID of the user who blocks.
- **blockedUserId**: The ID of the user who has been blocked.
