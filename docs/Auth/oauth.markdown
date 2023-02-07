---
layout: default
title: OAuth 42 Intra
parent: Auth 
---

# OAuth 42 Intra

During development, for OAuth to work, you will first need to: 

* [create an app](https://profile.intra.42.fr/oauth/applications/new) on the intra.
    * as the redirect URI, enter the following: `http://localhost:5173/oauth`.
* in the `.env` file which is located in the root of the project, place the following three variables:
    * `INTRA_API_UID=applicationUID`
    * `INTRA_API_SECRET=secretToken`
    * `STATE_STRING=a_very_long_random_string_which_must_be_unguessable`
* replace the value of the first two variables with your app's UID and secret which you can find in your
[app's page](https://profile.intra.42.fr/oauth/applications).
* replace (or not) the value of the third variable with an unguessable random string. It is used to protect
against cross-site request forgery attacks.
* create an `.env` file inside the root of the `frontend` folder and place the following two variables in it:
    * `VITE_INTRA_API_AUTHORIZE_URL=auth_url`
    * `VITE_STATE_STRING=a_very_long_random_string_which_must_be_unguessable`
* as the value of the first variable, you should write the long url that you can find in
your [app's page](https://profile.intra.42.fr/oauth/applications) (it looks like this but longer:
`https://api.intra.42.fr/oauth/authorize/your_formatted_url`).
* as the value of the second variable, you should write the exact same string you put into the other `.env`'s `STATE_STRING` variable.
* (if necessary, do not forget to bring down the docker-compose container and bring it back up)

