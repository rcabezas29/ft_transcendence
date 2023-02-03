---
layout: default
title: Auth
parent: Auth 
---

# Auth

The authentication is based on an api key. To obtain a key, first you need to POST
your credentials at /auth/login. [Endpoint doc](API/auth.html).

If credentials are valid the endpoint will return a JSON with the access token.
```json
{
    accesst_token: "qwer.asdf.zxcv"
}
```

The returned token must be used on the protected endpoints. The token must be sent
with the request in the `Authorization` header with the word `Bearer` before the token.
```bash
curl -H "Authorization: Bearer qwer.asdf.zxcv" -X POST www.example.com/api/endpoint
```

If the token on the request is invalid the backend should return `HTTP 401` error code 