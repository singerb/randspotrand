# randspotrand

Random album selector for Spotify

## Purpose

This project was an opportunity for me to keep my skills sharp while on paternity leave, as well as learning some new technologies. After switching from a Mac, one thing that I missed was the iTunes Mini Player in Alfred, and in particular the 'Play Random Album' feature that I used to listen to my collection without having to invest heavily in choosing what to listen to. With more of my listening occurring on Spotify anyway, I decided to rebuild this feature as a web app with the Spotify API.

## Technology

This is a fully client-side web app, using the Spotify 'Implicit Grant' authorization flow. Because this was a learning project, it's heavily over-engineered; single-file components and a full Flux store were in no way a neccessary part of this. The full list of technologies is:

- TypeScript
- tslint
- gulp
- browserify
- tsify
- Vue
- Vuex
- vueify
- vuex-typex
- sass

## Installation

```
<clone>
nvm use
npm install
./node_modules/bin/gulp
```

## Future

The styling is not amazing, and there are some more features that could be implemented (semi-controlled randomness, exclude certain albums, choose which device to play on, etc.) but for now it's complete.