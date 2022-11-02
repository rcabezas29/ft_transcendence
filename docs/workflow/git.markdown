---
layout: default
title: Git 
parent: Workflow 
---

# Git

## Branches

- **main**: in the main branch will only be pushed stable versions, all the team members must agree that the state of the app is in a stable version.
- **develop**: in the develop branch every new feature, fix, refactor... can be pushed. The only rule is that the new changes **must** compile.

## Branch types

- **feature/{name_of_feature}**: branch created to develop a new feature.
- **fix/{name_of_fixed_part}**: branch created to fix an issue.
- **refactor/{name_of_refactored_part}**: branch created to [refactor](https://en.wikipedia.org/wiki/Code_refactoring) a part of the project

## Example

You want to implement the register feature.

First you move to the develop branch.

```bash
git checkout develop
```

Get the lastest changes.

```bash
git pull
```

Create a new branch **feature/register** and move to it.
```bash
git checkout -b feature/register
```

Make as many commits as you want.

```bash
git add ....
git commit -m "...."
git add ....
git commit -m "...." 
....
```

When the feature is complete you have to merge the created branch to develop. In order to do that:

```bash
git checkout develop
git pull
git merge feature/register
```

In this process there might be some conflicts. Solve them and push to develop!

{: .important }
Never push changes to develop that does not compile. Do not make the others life imposible :)
