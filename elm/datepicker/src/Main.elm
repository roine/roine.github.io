module Main exposing (..)

import Browser
import Html exposing (Html, button, div, span, text)
import Html.Attributes exposing (style)
import Html.Events exposing (onClick)
import Task
import Time exposing (Month(..), Weekday(..))


type alias Model =
    { now : Time.Posix
    , here : Time.Zone
    }


type alias Config =
    { firstDayOfWeek : Time.Weekday }


config : Config
config =
    { firstDayOfWeek = Mon }


initialState : Model
initialState =
    { now = Time.millisToPosix 0
    , here = Time.utc
    }


type alias Flags =
    ()


init : Flags -> ( Model, Cmd Msg )
init flags =
    ( initialState
    , Task.map2 Tuple.pair Time.here Time.now
        |> Task.perform NewTime
    )


type alias Date =
    { year : Int
    , month : Time.Month
    , day : Int
    , weekday : Time.Weekday
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
    , weekday = Time.toWeekday zone time
    , hour = Time.toHour zone time
    , minute = Time.toMinute zone time
    , seconds = Time.toSecond zone time
    , milliseconds = Time.toMillis zone time
    , posix = time
    , zone = zone
    }


daysInMonth : Int -> Month -> Int
daysInMonth y m =
    case m of
        Jan ->
            31

        Feb ->
            if isLeapYear y then
                29
            else
                28

        Mar ->
            31

        Apr ->
            30

        May ->
            31

        Jun ->
            30

        Jul ->
            31

        Aug ->
            31

        Sep ->
            30

        Oct ->
            31

        Nov ->
            30

        Dec ->
            31


isLeapYear : Int -> Bool
isLeapYear y =
    modBy y 400 == 0 || modBy y 100 /= 0 && modBy y 4 == 0



-- UPDATE


type Msg
    = NewTime ( Time.Zone, Time.Posix )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case ( msg, model ) of
        ( NewTime ( zone, time ), _ ) ->
            ( { model | here = zone, now = time }
            , Cmd.none
            )


changeDay : Int -> Time.Zone -> Time.Posix -> Time.Posix
changeDay day zone time =
    let
        date =
            toDate zone time

        dayDiff =
            day - date.day

        dayDiffInMillis =
            dayDiff * millisecondsInDay
    in
    (Time.posixToMillis date.posix + dayDiffInMillis)
        |> Time.millisToPosix


millisecondsInDay : Int
millisecondsInDay =
    1000 * 60 * 60 * 24


firstDateOfWeek_ : Time.Weekday -> Time.Zone -> Time.Posix -> Time.Posix
firstDateOfWeek_ firstWeekday zone time =
    repeatUntil
        (\newTime ->
            (Time.posixToMillis newTime - millisecondsInDay)
                |> Time.millisToPosix
        )
        ((==) firstWeekday << .weekday << toDate zone)
        time


firstDateOfWeek : Time.Weekday -> Time.Zone -> Time.Posix -> Time.Posix
firstDateOfWeek firstWeekday zone time =
    let
        cond newTime =
            firstWeekday == .weekday (toDate zone newTime)

        rec newTime =
            if cond newTime then
                newTime
            else
                (Time.posixToMillis newTime - millisecondsInDay)
                    |> Time.millisToPosix
                    |> rec
    in
    rec time


dateEq : Time.Zone -> Time.Posix -> Time.Posix -> Bool
dateEq zone timeA timeB =
    let
        dateA =
            toDate zone timeA

        dateB =
            toDate zone timeB
    in
    ( .day dateA, .month dateA, .year dateA ) == ( .day dateB, .month dateB, .year dateB )


datesInRange : Time.Zone -> Time.Posix -> Time.Posix -> List Time.Posix
datesInRange zone firstDate lastDate =
    let
        rec acc newTime =
            if dateEq zone newTime lastDate then
                acc
            else
                (Time.posixToMillis newTime + millisecondsInDay)
                    |> Time.millisToPosix
                    |> (\t -> rec (acc ++ [ t ]) t)
    in
    rec [ firstDate ] firstDate


lastDateOfWeek : Time.Weekday -> Time.Zone -> Time.Posix -> Time.Posix
lastDateOfWeek lastWeekday zone time =
    repeatUntil
        (\newTime ->
            (Time.posixToMillis newTime + millisecondsInDay)
                |> Time.millisToPosix
        )
        ((==) lastWeekday << .weekday << toDate zone)
        time


repeatUntil_ : (acc -> a -> ( acc, a )) -> (acc -> a -> Bool) -> acc -> a -> acc
repeatUntil_ fn predicate acc n =
    let
        go ac m =
            if predicate acc m then
                ac
            else
                fn ac m
                    |> (\( newAcc, newM ) -> go newAcc newM)
    in
    go acc n


repeatUntil : (a -> a) -> (a -> Bool) -> a -> a
repeatUntil fn predicate n =
    let
        go m =
            if predicate m then
                m
            else
                go (fn m)
    in
    go n


previousWeekday : Time.Weekday -> Time.Weekday
previousWeekday weekday =
    case weekday of
        Mon ->
            Sun

        Tue ->
            Mon

        Wed ->
            Tue

        Thu ->
            Wed

        Fri ->
            Thu

        Sat ->
            Fri

        Sun ->
            Sat


listGrouping : Int -> List a -> List (List a)
listGrouping width elements =
    let
        go i list racc acc =
            case list of
                [] ->
                    List.reverse acc

                x :: xs ->
                    if i == width - 1 then
                        go 0 xs [] (List.reverse (x :: racc) :: acc)
                    else
                        go (i + 1) xs (x :: racc) acc
    in
    go 0 elements [] []



-- VIEW


view : Model -> Html Msg
view model =
    let
        date =
            toDate model.here model.now

        firstDayOfMonth =
            changeDay 1 model.here model.now

        lastDayOfMonth =
            changeDay (daysInMonth date.year date.month) model.here model.now

        calendarData =
            listGrouping 7
                (datesInRange model.here
                    (firstDateOfWeek config.firstDayOfWeek model.here firstDayOfMonth)
                    (lastDateOfWeek (previousWeekday config.firstDayOfWeek) model.here lastDayOfMonth)
                )
    in
    div []
        [ div [] [ text ("first day" ++ Debug.toString (toDate model.here firstDayOfMonth)) ]
        , div []
            [ text ("last day" ++ Debug.toString (toDate model.here lastDayOfMonth))
            ]
        , div [] [ text (Debug.toString (toDate model.here (firstDateOfWeek config.firstDayOfWeek model.here firstDayOfMonth))) ]
        , div [] [ text (Debug.toString (toDate model.here (lastDateOfWeek (previousWeekday config.firstDayOfWeek) model.here lastDayOfMonth))) ]
        , div []
            [ text
                (Debug.toString
                    (List.map
                        (\l -> List.map (\t -> .day (toDate model.here t)) l)
                        (listGrouping 7
                            (datesInRange model.here
                                (firstDateOfWeek config.firstDayOfWeek model.here firstDayOfMonth)
                                (lastDateOfWeek (previousWeekday config.firstDayOfWeek) model.here lastDayOfMonth)
                            )
                        )
                    )
                )
            ]
        , div [ style "display" "flex", style "flex-direction" "column" ]
            (List.map
                (\row ->
                    div [ style "display" "flex" ]
                        (List.map
                            (\cellDate ->
                                div [ style "border" "1px solid red", style "padding" "10px" ]
                                    [ cellDate
                                        |> dateToString model.here
                                        |> text
                                    ]
                            )
                            row
                        )
                )
                calendarData
            )
        ]


dateToString : Time.Zone -> Time.Posix -> String
dateToString zone time =
    let
        date =
            toDate zone time
    in
    Debug.toString date.weekday ++ " " ++ Debug.toString date.day ++ " " ++ Debug.toString date.month



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none



-- INIT


main : Program Flags Model Msg
main =
    Browser.element
        { init = init
        , update = update
        , view = view
        , subscriptions = subscriptions
        }
