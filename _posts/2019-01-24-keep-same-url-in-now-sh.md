---
layout: post
title: Keep same URL in now.sh
date: 2019-01-24 12:15 +1100
tags: now.sh til static-file-hosting
---
In the world of static file hosting there are plenty of solutions. I picked __[now.sh][]__. It's free, easy to use and works well. I have had one problem with now.sh so far, it creates a new URL everytime you push. It's a feature that I dont need in some cases, here's how to solve. Put this in package.json:
```
{
  "scripts": {
    "deploy": "now && now alias && now remove YOUR_APP_NAME --safe -y"
  }
}
```
Replace _YOUR_APP_NAME_ by the name of your app. Then go to your _now.json_ and add/change:
```
"name": "YOUR_APP_NAME",
"alias": "YOUR_UNIQUE_SUBDOMAIN.now.sh",
```
Replace _YOUR_UNIQUE_SUBDOMAIN_ by your unique subdomain. Just run `yarn deploy`.

[now.sh]: https://zeit.co/now

