---
layout: post
title: Pretty format ELM model in browser
date: 2019-01-17 11:58 +1100
tags: elm til debug elm-0.19
---
<img src="/assets/images/elm-debug-format.png" alt="An example of pretty format in browser" />
Using `Debug.toString` is really helpful to help debug the model but the format of the output is hard to read. Looking
for solution [I stumbled upon this gem][format-snippet](not the ruby gem). I changed it to work in elm 0.19 and fix a minor issue when using
`custom type` for the `Model`. [Here's the final result on Gist][gist].

[format-snippet]: https://stackoverflow.com/questions/40517852/elm-how-to-pretty-print-the-model-in-the-browser?answertab=votes#tab-top
[gist]: https://gist.github.com/roine/604e46a40cb6e4ae144533fbeb1aef2f