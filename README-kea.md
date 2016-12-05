# Kea

![Kea the mountain parrot](https://raw.githubusercontent.com/mariusandra/kea/master/kea-small.jpg)

A `kea` is two things:

1. A [smart and cheeky mountain parrot](https://www.youtube.com/watch?v=oAhzmULgoqI) from New Zealand
2. A project aiming to answer one question: "what's the smartest way to develop web applications using React?"

The answer has morphed into a set of best practices, tools and libraries for smart web application development, using the tools you already know and love (`react`, `redux`, `redux-act`, `redux-saga`, `reselect`, `react-router`, etc)

We provide:

* a curated set of libraries and best practices you should use
* [`kea`](https://github.com/mariusandra/kea) - a scaffolding tool. Type `kea new myapp` and you're good to go.
* [`kea-logic`](https://github.com/mariusandra/kea-logic) - bring your frontend data to life!
* [`kea-example`](https://github.com/mariusandra/kea-example) - a reference implementation with the Rails bindings
* [`kea-on-rails`](https://github.com/mariusandra/kea-on-rails) and [`kea-rails-loader`](https://github.com/mariusandra/kea-rails-loader) - smooth bindings with Rails

## Motivation

When I started learning React, I was overwhelmed with choice. Every day of development forced me to decide between countless libraries, code styles and approaches, each with their own tradeoffs and benefits.

Eventually after a lot of experimentation, I settled on an architecture that just clicked. Some parts were missing, so I wrote them myself.

As this work was started through a client project, every decision was influenced by the following two questions:

* Will this make the code simpler?
* Will this make the code obvious and maintainable?

The `kea` project is a way to document what I have learned and make the React experience better for everyone.

## Getting started

First, install kea globally:

```
npm install -g kea
```

Then run `kea new` to create a new project and run it:

```
kea new test_project
cd test_project
npm start
```

Open your browser at `http://localhost:2000/`, play with the demo app and start coding right away!

To generate new scenes and components, run the following in the project root:

```
kea g scene-name                               # new scene
kea g scene-name/component-name                # component under the scene
kea g scene-name/component-name/really-nested  # deeply nested logic
```

Check out the documentation for [`kea-logic`](https://github.com/mariusandra/kea-logic) to see how it works.

## Status

This is still a work in progress. While all the projects are used in production successfully, things may change at any moment.

## Structure

The `kea` architecture consists of the following external libraries pieces:

* [react](https://github.com/facebook/react)
* [react-router](https://github.com/reactjs/react-router)
* [redux](https://github.com/reactjs/redux)
* [redux-act](https://github.com/pauldijou/redux-act) (no need to duplicate your redux constants 5 times!)
* [redux-saga](https://github.com/yelouafi/redux-saga) (write complex async logic sequentially)
* [reselect](https://github.com/reactjs/reselect) (separate data transformations from other logic)
* [webpack](https://github.com/webpack/webpack)
* powerful custom helpers to tie them all together

It's written in the [JavaScript Stardard Style](https://github.com/feross/standard) and puts a strong emphasis on
code clarity, reduced redundancy and stability.

`kea` provides:
* a scaffolding tool with multiple generators
* a modular code structure that's optimized for clarity
* a guide to teach you how it all fits together

Out of the box you get:
* battle tested conventions for organising your code (but you're free to break them)
* hot reloads while developing
* code chunking for each scene, so only the important parts of the application are loaded
* routes
* write your side effects as stories

Optional:
* full stack rendering with the [kea-on-rails](https://github.com/mariusandra/kea-on-rails) rails gem

---
*Image from https://www.flickr.com/photos/mollivan_jon/126900211/*
