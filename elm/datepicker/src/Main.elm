module Main exposing (..)

import Browser
import Html exposing (Html, button, div, text)
import Html.Events exposing (onClick)
import Task
import Time exposing (Month(..))


type alias Model =
    Readiness State


type alias State =
    { date : Date }


type Readiness a
    = Ready a
    | NotReady


type alias Flags =
    ()


init : Flags -> ( Model, Cmd Msg )
init flags =
    ( NotReady, Task.map2 toDate Time.here Time.now |> Task.perform NewTime )


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
    modBy y  400 == 0 || modBy y  100 /= 0 && modBy y  4 == 0
-- UPDATE


type Msg
    = NewTime Date


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case ( msg, model ) of
        ( NewTime time, _ ) ->
            ( Ready { date = time }, Cmd.none )


changeDay : Int -> State -> Date
changeDay day state =
    let
        dayDiff =
            (day - state.date.day)

        dayDiffInMillis =
            dayDiff * millisecondsInDay
    in
    (Time.posixToMillis state.date.posix + dayDiffInMillis)
        |> Time.millisToPosix
        |> toDate state.date.zone


millisecondsInDay : Int
millisecondsInDay =
    1000 * 60 * 60 * 24



-- VIEW


view : Model -> Html Msg
view model =
    case model of
        NotReady ->
            text "not ready"

        Ready state ->
            div []
                [ text "hello world"
                , text (Debug.toString state)
                , text ("first day" ++ Debug.toString (changeDay 1 state))
                , text ("last day" ++ Debug.toString (changeDay (daysInMonth state.date.year state.date.month) state))
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
