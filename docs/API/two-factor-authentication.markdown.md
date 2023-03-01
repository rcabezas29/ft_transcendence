---
layout: default
title: Two Factor Authentication 
parent: API 
---

## Two Factor Authentication (2FA)

### GET /2fa/is-enabled

Returns a `boolean` indicating whether the 2FA is enabled for the request user (i.e. if the user's
`isTwoFactorAuthenticationEnabled` is set to `true`).

### POST /2fa/generate

Generates the 2FA secret for the request user. Sets the `twoFactorAuthenticationSecret` in
the `usersRepository`. Returns a QR code for the user to scan using Google Authenticator app in
order to enable 2FA.

No body expected.


### POST /2fa/turn-on

Turns on 2FA for the request user. After scanning the QR code, the user provides a 6 digit
code shown in their Google Authenticator app and, if the code is valid, the `usersRepository`
is updated with `isTwoFactorAuthenticationEnabled: true`.

Expected body:

```json
{
	"twoFactorAuthenticationCode": "123456"
}
```

### POST /2fa/turn-off

Turns off 2FA for the request user. Updates the `usersRepository` with
`isTwoFactorAuthenticationEnabled: false` and sets the secret to an empty string.

No body expected.

### POST /2fa/authenticate

Authenticates the request user with the second factor. Receives the 6 digit code provided by the
user and, if the code is valid, a new JWT is generated, including the `isSecondFactorAuthenticated`
property set to `true`. The new JWT is returned.

Expected body:

```json
{
	"twoFactorAuthenticationCode": "123456"
}
```

PS: [nice link](https://wanago.io/2021/03/08/api-nestjs-two-factor-authentication/) to understand the implementation of 2FA
