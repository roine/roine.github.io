module Main exposing (..)

import Browser
import Browser.Events
import Dict exposing (Dict)
import Html exposing (Html, button, div, span, text)
import Html.Attributes exposing (style)
import Html.Events exposing (onClick)
import Json.Decode as Json
import Time


type alias Model =
    { parameter :
        { gravity : { x : Float, y : Float }
        , containerWidth : Float
        , containerHeight : Float
        , boxHeight : Float
        , boxWidth : Float
        , pixelPerMeter : Float
        }
    , balls : Dict Int Ball
    , play : Bool
    }


type alias Flags =
    ()


init : Flags -> ( Model, Cmd Msg )
init flags =
    ( initialModel, Cmd.none )


initialModel : Model
initialModel =
    { parameter =
        { gravity = { x = 0, y = -9.81 }
        , boxWidth = 1
        , boxHeight = 0.5
        , containerWidth = 30
        , containerHeight = 15
        , pixelPerMeter = 20
        }
    , balls =
        Dict.fromList
            [ ( 0
              , { velocity = { x = 0, y = 0.1 }
                , position = { x = 0, y = 0 }
                }
              )
            , ( 1
              , { velocity = { x = 0, y = 0.1 }
                , position = { x = 10, y = 50 }
                }
              )
            ]
    , play = True
    }


type alias Ball =
    { velocity : { x : Float, y : Float }
    , position : { x : Float, y : Float }
    }



-- UPDATE


step : Float -> { x : Float, y : Float } -> Int -> Ball -> Ball
step delta gravity key ball =
    let
        position =
            ball.position

        velocity =
            ball.velocity
    in
    { ball
        | position =
            { position
                | y = ball.position.y + ball.velocity.y * (delta / 1000)
                , x = ball.position.x + ball.velocity.x * (delta / 1000)
            }
        , velocity =
            { velocity
                | y = ball.velocity.y + gravity.y * (delta / 1000)
                , x = ball.velocity.x + gravity.x * (delta / 1000)
            }
    }


type Msg
    = Draw Float
    | TogglePlay
    | SpaceKey
    | LeftKey
    | RightKey
    | NoOp


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    let
        balls =
            model.balls
    in
    case msg of
        Draw deltaMs ->
            let
                newBalls =
                    Dict.map (step deltaMs model.parameter.gravity) model.balls

                delta =
                    deltaMs / 1
            in
            ( { model
                | balls =
                    Dict.map
                        (\key newBall ->
                            let
                                newPosition =
                                    { y =
                                        newBall.position.y
                                            |> max 0
                                            |> min (model.parameter.containerHeight - model.parameter.boxHeight)
                                    , x =
                                        newBall.position.x
                                            |> max 0
                                            |> min (model.parameter.containerWidth - model.parameter.boxWidth)
                                    }

                                position =
                                    newBall.position

                                velocity =
                                    newBall.velocity
                            in
                            { newBall
                                | position =
                                    { position
                                        | y = newPosition.y
                                        , x = newPosition.x
                                    }
                                , velocity =
                                    { velocity
                                        | y =
                                            if onYEdge (model.parameter.containerHeight - model.parameter.boxHeight) newPosition.y then
                                                newBall.velocity.y * -0.5
                                            else
                                                newBall.velocity.y
                                        , x =
                                            if onXEdge (model.parameter.containerWidth - model.parameter.boxWidth) newPosition.x then
                                                newBall.velocity.x * -0.5
                                            else
                                                newBall.velocity.x
                                    }
                            }
                        )
                        newBalls
              }
            , Cmd.none
            )

        TogglePlay ->
            ( { model | play = not model.play }, Cmd.none )

        SpaceKey ->
            ( model
            , Cmd.none
            )

        RightKey ->
            ( model
            , Cmd.none
            )

        LeftKey ->
            ( model
            , Cmd.none
            )

        NoOp ->
            ( model, Cmd.none )


onXEdge : Float -> Float -> Bool
onXEdge max x =
    x <= 0 || x >= max


onYEdge : Float -> Float -> Bool
onYEdge max y =
    y <= 0 || y >= max



-- VIEW


view : Model -> Html Msg
view ({ parameter, balls } as model) =
    div []
        [ div
            [ style "border" "1px solid red"
            , style "width" (floatToPx (parameter.containerWidth * parameter.pixelPerMeter))
            , style "height" (floatToPx (parameter.containerHeight * parameter.pixelPerMeter))
            , style "position" "relative"
            ]
            [ div [] (List.map (viewBox parameter) (Dict.values balls))
            ]
        , button [ onClick TogglePlay ] [ text "Play/Pause" ]
        ]


viewBox parameter ball =
    span
        [ style "position" "absolute"
        , style "bottom" (floatToPx (ball.position.y * parameter.pixelPerMeter))
        , style "left" (floatToPx (ball.position.x * parameter.pixelPerMeter))
        , style "height" (floatToPx (parameter.boxHeight * parameter.pixelPerMeter))
        , style "width" (floatToPx (parameter.boxWidth * parameter.pixelPerMeter))
        , style "background" "green"
        ]
        []


intToPx : Int -> String
intToPx num =
    String.fromInt num ++ "px"


floatToPx : Float -> String
floatToPx num =
    String.fromFloat num ++ "px"



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ if model.play then
            Browser.Events.onAnimationFrameDelta Draw
          else
            Sub.none
        , Browser.Events.onKeyDown (Json.map keyToMsg (Json.field "key" Json.string))
        ]


keyToMsg key =
    case key of
        " " ->
            SpaceKey

        "ArrowLeft" ->
            LeftKey

        "ArrowRight" ->
            RightKey

        _ ->
            NoOp



-- INIT


main : Program Flags Model Msg
main =
    Browser.element
        { init = init
        , update = update
        , view = view
        , subscriptions = subscriptions
        }
