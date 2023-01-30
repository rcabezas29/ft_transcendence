---
layout: default
title: Matchmaking 
---

# Matchmaking

The matchmaking is based on a [elo system](https://towardsdatascience.com/developing-a-generalized-elo-rating-system-for-multiplayer-games-b9b495e87802).
The user table will containt the elo score

When a player wants to play a match the system will add him to a queue. Then the system will try to match the players with the lowest difference in elo score.
Before a match the expected score must be calculated for each player.

### Expected score for player 1

**Ra** = PlayerA elo

**Rb** = PlayerB elo

**Expected Score** = 1 / ( 1 + 10^((Rb - Ra)/400) ) 

When the expected score is calculated and the match is over we can calculate the obtained
elo for each player.

**Sa** variable is 1 if player wins and 0 if player loses.
**Ea** is the expected score.
**Ra** Resulting elo for player A

Ra = Ra + 32(Sa - Ea)