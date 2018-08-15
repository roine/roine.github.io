---
layout: post
title: Why I ditched JS for ELM
date: 2018-08-13 11:15 +0100
tags: elm javascript functional-programming
---


I've been working with ELM for 2 years now. When I started I had very little knowledge about functional programming. 
I remember being skeptic about it at first then falling in love with it. Now going back to ReactJS or AngularJS feels 
like trading a swiss army knife for a hammer. 

Here are my favorite things about ELM:

## Swiss army knife included
React uses a variety of tools to get an app running such as: `NPM` for dependencies, `react-create-app` for running the 
app, `flow` if you want to type check, `immutable-js` if you want data sanity and these require nodeJS to be installed. 
In ELM these are included in the ELM tool belt, `elm-make` will compile ELM to valid JS, `elm-reactor` would serve the 
ELM app and `elm-package` take care of the dependencies.


## It's all about the data
Functional programming focuses on the data hence ELM has many data types: List, Array, Record, Dict, Set, Maybe, Result 
and many more. You can easily create your own as well.
  ```
type Country 
  = France 
  | UK 
  | ...
  ```
In ELM, data are immutable by default while in ReactJS you'd need to download [yet another dependency](https://facebook.github.io/immutable-js/).
 

## Packages sanity
Last time I tried to download a node module to work with `User Agent`, I found one called `bowser`. I tried to download it but ended up 
getting `browser` from another developer. 

In ELM, to download a module, I need to provide the developer_name/module, eg
If I want sortlist from rtfeldman I would use `$ elm-package install rtfeldman/selectlist`. Make sense! 

Another useful feature of ELM is the automatic version bump. When you're about to publish your package and the 
signature of a public function has changed, ELM automatically bumps the version, no more code breaking in the production build.

## Fail fast or no runtime exceptions
Dang! `TypeError: b is null` in production and sourcemap is off! Let's start a painful debugging. This sounds familiar? 

Elm solves that problem by failing fast (at compile time). Let's have a look at the Maybe.withDefault method's signature
```
withDefault : a -> Maybe a -> a
```
Ok so if we replace all the `a` by `String`, we would expect to pass a `String` then `Maybe String` and it'd return a `String`.
A correct call would be
```
Maybe.withDefault 1 (Just 5)
// 5
Maybe.withDefault "1" Nothing
// "1"
```
Let's call this function inappropriately and get the compiler to report the error:
```
Maybe.withDefault 1 (Just "1")


-- TYPE MISMATCH --------------------------------------------- repl-temp-000.elm

The 2nd argument to function `withDefault` is causing a mismatch.

3|   Maybe.withDefault 1 (Just "1")
                          ^^^^^^^^
Function `withDefault` is expecting the 2nd argument to be:

    Maybe number

But it is:

    Maybe String

Hint: I always figure out the type of arguments from left to right. If an
argument is acceptable when I check it, I assume it is "correct" in subsequent
checks. So the problem may actually be in how previous arguments interact with
the 2nd.
```
Did I mention that ELM has awesome error messages?! 


## Supporting old browsers
With JS I would spend hours configuring webpack to make JS work without hurdle in an old IE version, I'd go 
through pages and pages of google search result to find the Graal. Then make sure Uglify also compile to right ES version. Painful!

Whatever I write in ELM will be compiled to a [valid for IE9+](https://discourse.elm-lang.org/t/elm-support-for-older-browsers-ie-9-10/744/7) 
Javascript with great performance.

## Interop
Ok ELM is great but there are advance things you can't do like accessing the bounding rectangle of an Element. Elm solves this
problem by providing a way to communicate to Javascript via ports. I won't go into details in this post, just have a look
at [the guide about interop](https://guide.elm-lang.org/interop/)


## Community
The ELM community is small but kind and generous. If you have a problem with ELM go over to Slack, your question will 
be quickly answered in a polite manner. Sounds unreal? Just try it.

## Final Words
Besides being a near perfect tool and a great community, ELM is also very fun to write code with and I wish more companies would adopt it.

If you want to try it a go over to [ellie-app](https://ellie-app.com/new) and check [the ELM guide](https://guide.elm-lang.org/).

