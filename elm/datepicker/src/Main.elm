module Main exposing (..)

import Browser
import Html exposing (Html, button, div, text)
import Html.Events exposing (onClick)
import Task
import Time exposing (Month(..), Weekday(..))


type alias Model =
    { now : Time.Posix
    , here : Time.Zone
    , firstDayOfWeek : Time.Weekday
    }


initialState : Model
initialState =
    { now = Time.millisToPosix 0
    , here = Time.utc
    , firstDayOfWeek = Mon
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


firstDateOfWeek : Time.Weekday -> Time.Zone -> Time.Posix -> Time.Posix
firstDateOfWeek firstWeekday zone time =
    let
        date =
            toDate zone time
    in
    repeatUntil
        (\newTime ->
            (Time.posixToMillis newTime - millisecondsInDay)
                |> Time.millisToPosix
        )
        ((==) firstWeekday << .weekday << toDate zone)
        time


lastDateOfWeek : Time.Weekday -> Time.Zone -> Time.Posix -> Time.Posix
lastDateOfWeek lastWeekday zone time =
    let
        date =
            toDate zone time
    in
    repeatUntil
        (\newTime ->
            (Time.posixToMillis newTime + millisecondsInDay)
                |> Time.millisToPosix
        )
        ((==) lastWeekday << .weekday << toDate zone)
        time


repeatUntil : (a -> a) -> (a -> Bool) -> a -> a
repeatUntil f predicate n =
    let
        go m =
            if predicate m then
                m
            else
                go (f m)
    in
    go n


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
    in
    div []
        [ div [] [ text ("first day" ++ Debug.toString (toDate model.here firstDayOfMonth)) ]
        , div []
            [ text ("last day" ++ Debug.toString (toDate model.here lastDayOfMonth))
            ]
        , div [] [ text (Debug.toString (toDate model.here (firstDateOfWeek model.firstDayOfWeek model.here firstDayOfMonth))) ]
        , div [] [ text (Debug.toString (toDate model.here (lastDateOfWeek (previousWeekday model.firstDayOfWeek) model.here lastDayOfMonth))) ]
        ]



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
