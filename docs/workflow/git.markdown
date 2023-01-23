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


## Workflow

- All the branches must be created from the develop branch.
	- If you want to create a new feature, create a new branch from develop and name it **feature/{name_of_feature}**
- All the branches must be merged to the develop branch.
	- If you want to merge a feature branch to develop, move to develop and merge the feature branch.
- All the branches must be deleted after the merge. (Not really, but it's a good practice)
	- If you want to delete a branch, move to develop and delete it.
<br/><br/>

![](./GitWorkflow.png)

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
