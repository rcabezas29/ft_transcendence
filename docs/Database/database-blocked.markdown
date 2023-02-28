---
layout: default
title: BlockedFriendships
parent: Database
nav_order: 4
---

### blocked_friendship table

This table determines the direction of a block between two users. When
a friendship (from the `friendship` table) has blocked status
(i.e. `status == 2`), a row is created in this table to establish who blocked who.
The `blocked_friendship` table is defined as follows:

| id  | userId | blockedUserId | friendshipId |
|-----|--------|---------------|--------------|
|  1  |    1   |       8       |      3       |
|  2  |    4   |       3       |      10      |
|  3  |    5   |       4       |      1       |

- **userId**: The ID of the user who blocks.
- **blockedUserId**: The ID of the user who has been blocked.
- **friendshipId**: the ID of the friendship as defined in the `friendship` table.
    - The `blocked_friendship` owns a **uni-directional OneToOne** relation with the
        `friendship` table. Therefore, the `friendship` is accesible from the
        `blocked_friendship`, but not the other way around.
    - If a friendship is deleted (and if it had `status = 2`), its associated
         **blocked_friendship is automatically deleted**, but **not** the other way around.
