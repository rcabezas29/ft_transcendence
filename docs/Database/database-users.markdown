---
layout: default
title: Users
parent: Database
nav_order: 1
---

### user table

The users are in the `user` table and are defined as:

| id  | username  |       email       |       avatar       |    password     |  elo |  twoFactorAuthenticationSecret |  isTwoFactorAuthenticationEnabled |
|-----|-----------|-------------------|--------------------|-----------------|------|--------------------------------|-----------------------------------|
|  1  |   user1   | user1@example.com | default-avatar.png | hashedpassw0rd1 | 1000 |              NULL              |               FALSE               |
|  2  |   user2   | user2@example.com |      user2.png     | hashedpassw0rd2 | 2000 |              NULL              |               FALSE               |
|  3  |   user3   | user3@example.com | default-avatar.png | hashedpassw0rd3 | 1000 |             SECRET             |               TRUE                |

- **username**: unique username.
- **email**: unique email.
- **avatar**: avatar image filename. Avatars are located in the `backend/avatars/` folder.
    Default is `default_avatar.png`.
- **password**: hashed password.
- **elo**: game elo. Default is `1000`.
- **twoFactorAuthenticationSecret**: user secret for the 2FA generated in the proces of enabling 2FA.
- **isTwoFactorAuthenticationEnabled**: whether the 2FA is enabled. Default is `false`.
- **stats**: the user's stats.
    - The `user` table has a OneToOne relation with the `stats` table.
    - The `stats` table is the "owner" of the relation: even if the stats are **not visible** on
        the `user` table, they are **accessible as `user.stats`** because the stats are eagerly loaded
        by `userRepository`'s `find` methods.
    - Every user has a corresponding stats row, and every stats row has a
        corresponding user.
    - If a user is deleted, its **stats are automatically deleted**, but
        **not** the other way around.
