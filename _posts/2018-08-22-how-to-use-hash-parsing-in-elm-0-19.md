---
layout: post
title: How to use hash parsing in ELM 0.19
date: 2018-08-22 11:15 +0100
tags: elm functional-programming elm-navigation
---

Before in ELM 0.18 if you used `evancz/url-parser` you would use `parseHash` to parse the fragment. But now in 0.19 `elm/url` doesn't have such function. It is still possible to parse the hash though.

You'll need to transform the fragment into a path, Eg:

```haskell
fromUrl url =
    -- Treat fragment as path
    { url | path = Maybe.withDefault "" url.fragment, fragment = Nothing }
      |> Parser.parse parser
```
