---
layout: post
title: Building a calendar UI in ELM - Part 1
---
ELM was redesign recently and `Date` and `Time` have been removed from the core to the `Time` library. With that in mind 
let's build a calendar.

In this first part we'll make a list of dates for a give month and year. Eg: [1 jan 2018, 2 jan 2018,.., 31 jan 2018].
I'll skip a lot of steps but you'll find the whole code attached at the end of this article.

## Get now's Posix and here's Zone
To start we'll need to get the current time in the form of a `Posix`, the user's zone and save it the `Model`. 
```haskell
type alias Model =
    { now : Time.Posix
    , here : Time.Zone
    }
```
We'll get those information at initialisation time by running this task:
```haskell
Task.map2 Tuple.pair Time.here Time.now
    |> Task.perform NewTime
```

## Turn the Posix and Zone into a human friendly Date
So now that we have the user's `Zone` and `Posix` in the model we can try to get the first and last day of the month.
The problem is that `Posix` is the number of milliseconds elapsed since some arbitrary moment, so we'll need to transform
this `Posix` into a human understandable date (with years, month, days,..). Let's make a `toDate`:
```haskell
type alias Date =
    { year : Int
    , month : Time.Month
    , day : Int
    , weekDay : Time.Weekday
    , hour : Int
    , minute : Int
    , seconds : Int
    , milliseconds : Int
    , posix : Time.Posix
    , zone : Time.Zone
    }
    
    
toDate : Time.Zone -> Time.Posix -> Date
toDate zone time =
    { year = Time.toYear zone time
    , month = Time.toMonth zone time
    , day = Time.toDay zone time
    , weekDay = Time.toWeekday zone time
    , hour = Time.toHour zone time
    , minute = Time.toMinute zone time
    , seconds = Time.toSecond zone time
    , milliseconds = Time.toMillis zone time
    , posix = time
    , zone = zone
    }
```

## Get the first and last day of the month
To make the list of days we'll need to get the edges, the first and last day of the month. 

To start let's get the first day of the month. To do so we'll need to:
1. calculate the number of days between the current date and the first of the month, 
2. change the result to milliseconds, 
3. add it to the now `Posix`

```haskell
changeDay : Int -> Time.Zone -> Time.Posix
changeDay day zone time =
    let
        date =
            toDate zone time
        {-(1)-}
        dayDiff =
            day - date.day
            
        {-(2)-}
        dayDiffInMillis =
            dayDiff * millisecondsInDay
    in
    {-(3)-}
    (Time.posixToMillis date.posix + dayDiffInMillis)
        |> Time.millisToPosix


millisecondsInDay : Int
millisecondsInDay =
    1000 * 60 * 60 * 24


changeDay 1 model.here model.now
```
Let's get the last day of the month now. We could use the `changeDay` function but we don't know how many days are in the current month.
We'll need to create a function `daysInMonth : Int -> Month -> Int` which will take a year and month return a number of days. Nothing fancy, just mapping 
the month to the number of days, the only challenge will be to return the right amount for the month of `February` 
(accounting for leap year). 

I will just share the `isLeapYear : Year -> Bool` function, where `Year` is an `Int`.
```haskell
isLeapYear : Year -> Bool
isLeapYear y =
    modBy y 400 == 0 || modBy y 100 /= 0 && modBy y 4 == 0
```
This code was copied from [elm-community/elm-time][1].

Then we'll just need to call `changeDay (daysInMonth date.year date.month) date` to get the last date of the current month.

## Get the first and last date of the calendar grid
The visual calendar will have need 

<center><img src="{{ "assets/elm/datepicker/screenshot_1.png" | absolute_url }}" alt="Typical calendar view" width="250"/></center>

[1]: https://github.com/elm-community/elm-time/blob/master/src/Time/Date.elm#L478