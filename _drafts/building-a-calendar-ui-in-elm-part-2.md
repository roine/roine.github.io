---
layout: post
title: Building a calendar UI in ELM - Part 2
---


In the previous part of this tutorial we've seen how to represent the current month view into a list of dates. 
Now let's see how we transform this data into something similar to the screenshot below.

<center><img src="{{ "/elm/datepicker/images/screenshot_1.png" | absolute_url }}" alt="Typical calendar view" width="250"/></center>

__Note__: In the following some code samples are heavily influenced or copied from [elm-community/elm-datepicker][1].

## Transform the flat list into a list of list
We'll need a list of list because we will have multiple rows as well as columns. Let's make a function that takes an `Int` (amount of columns
in a row), a list (our date list) and return a list of list.
```haskell
listGrouping : Int -> List a -> List (List a)
listGrouping width elements =
    let
        rec i list racc acc =
            case list of
                [] ->
                    List.reverse acc

                x :: xs ->
                    if i == width - 1 then
                        go 0 xs [] (List.reverse (x :: racc) :: acc)
                    else
                        go (i + 1) xs (x :: racc) acc
    in
    rec 0 elements [] []
```
Procedure:
- Is the list empty?
    - No? Is the row size equal to the width we expect?
        - No? Push the head of the list (x) in the row accumulator (racc). Retry with the tail (xs) and incremented width (i + 1).
        - Yes? Reverse the row accumulator and then add it in the general accumulator (acc), so we have a list of list. 
        Retry with a reset width (i) and a reset row accumulator (racc).
    - Yes? Return the reversed general accumulator (acc).
    
The data now has the shape we want, we can start working on the UI.

## Rendering the days in the calendar
We're going to use a table to render the days.
```haskell
table [ style "border-collapse" "collapse", style "border-spacing" "0" ]
    [ tbody []
        (List.map
            (\row ->
                tr []
                    (List.map
                        (\cellDate ->
                            td [ style "border" "1px solid lightgrey" ]
                                [ button
                                    [ style "height" "100%"
                                    , style "width" "100%"
                                    , style "background" "none"
                                    , style "border" "0"
                                    , style "padding" "15px"
                                    ]
                                    [ .day (toDate model.here cellDate)
                                        |> String.fromInt
                                        |> text
                                    ]
                                ]
                        )
                        row
                    )
            )
            calendarData
        )
    ]
```
    
[1]: https://github.com/elm-community/elm-datepicker
