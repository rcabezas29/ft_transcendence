---
layout: default
title: Stats
parent: Database
nav_order: 2
---

### stats table

This table includes a user's stats. The `stats` table is defined as follows:

| id  | wonGames | lostGames | scoredGoals | receivedGoals | userId |
|-----|----------|-----------|-------------|---------------|--------|
|  1  |    3     |     1     |      8      |       4       |    3   |
|  2  |    7     |     4     |      3      |      10       |    2   |
|  3  |    1     |     5     |      4      |      20       |   12   |

- All stats are `0` by default.
- **userId**: the id of the user these stats correspond to.
    - The `stats` table and the `user` table have a **bi-directional OneToOne** relation.
    - The `stats` table is the "owner" of the relation, therefore it shows the
        `userId` column. Even if the stats are not visible on the `user` table,
        they are accessible as `user.stats` because the stats are eagerly loaded
        by `userRepository`'s `find` methods.
    - Every user has a corresponding stats row, and every stats row has a
        corresponding user.
    - If a user is deleted, its **stats are automatically deleted**, but
        **not** the other way around.
