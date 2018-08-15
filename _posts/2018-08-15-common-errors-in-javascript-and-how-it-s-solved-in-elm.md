---
layout: post
title: Common errors in Javascript and how it's solved in ELM
date: 2018-08-15 12:15 +0100
---

One of my favorite things about ELM is the compiler, it will catch errors before they could make their way to production.
Let's have a look at the most common Javascript errors and see how ELM makes sure they don't bother you.

## Uncaught TypeError: Cannot read property
Imagine you wrote this code in Javascript:
```
function legal(age) {
  if (age > 18) {
    return {
      isLegal: true,
      isTooOld: age < 90
    }
  }
}
```
You would call `const l = legal(21)` and then try to access `l.isTooOld`, everything works, you create a PR, wait for peer review,
merge and deploy to production. 

One hour later you receive an alert from your reporting service saying `Uncaught TypeError: Cannot read property 'isTooOld' of undefined`,
so you dig into it, debug it, create a new PR, wait for peer review, deploy to production. You waisted 1-2 hours. 
The example is trivial but this issue happens every day to millions of innocent programmers.

Now let's see in ELM:
```
legal: Int -> {isLegal: Bool, isTooOld: Bool}
```
In ELM a function can only return one data shape in comparison to the example in Javascript above that can return 
an `object` or `undefined`. 

You might say "what if I actually want to return nothing". If a function needs to return nothing,
then you would return a `Maybe a`. Eg: Let's say I have a list of records (objects). I want to create a function to find 
a specific record from that list if the record is found return it otherwise return nothing. Let's see our function's signature:
```
findById: Int -> List record -> Maybe record
```
In that way, whenever another function calls `findById` it must handle the possibility that it doesn't return data.
```
case findById 1 users of
    Nothing ->
        do something
    Just user ->
        do something else
```


Another way to break it? Maybe create an object and try to access a key that doesn't exist:
```
a = { b = { c = 2 } }
a.foo

`a` does not have a field named `foo`.

The type of `a` is:

    { b : { c : number } }

Which does not contain a field named `foo`.

Hint: The record fields do not match up. One has b. The other has foo.
```
The compiler caught it so your clients don't have to!

## Uncaught TypeError: xxx is not a function
Imagine you refactor some code and end up removing a function, you remove all calls to this method you can find then deploy.
A few hours later again notification from your error reporting service saying `Uncaught TypeError: evaluate is not a function`.

In ELM if you remove a function and still have traces of it elsewhere the compiler will tell you. 
```
{- Removed
reduce fn acc v =
    10
-}
main =
    foo idenity [1,2,3]
    
foo fn v =
    reduce fn 0 v

Cannot find variable `reduce`
```
You might spend few minutes going through the compiler's error messages fixing across but once it's done you can forget about it.

## Uncaught RangeError
This happens when your call stack size reached its limit. Most common case is a recursive function that never ends.
This could happen for few reason. The recursive function is poorly coded and doesnt have an exit branch or the parameter is 
not as expected.

Elm on the other hand detects some bad recursion definition:
```
ones = 1 :: ones
```
The following would still break at runtime, the next version of ELM (0.19) might catch this as well:
```
loop x = loop x
```
See this [issue for more details][1] on bad recursion catching strategy in ELM compiler.

## Final words
I omitted a lot of Javascript common errors because they were either similar but on different browsers or were too specific. 
ELM has virtually no runtime error, thanks to the compiler and the language that provides the API to manage side effects 
and no values. That being said, if you really want to make your ELM app to crash at runtime just check the
[top 6 ways to make your elm app crash at runtime][2] by [eeue56][3].


Source: <https://rollbar.com/blog/top-10-javascript-errors/>.

[1]: https://github.com/elm/compiler/issues/1591
[2]: https://medium.com/@eeue56/top-6-ways-to-make-your-elm-app-crash-at-runtime-562b2fa92d70
[3]: https://twitter.com/eeue56