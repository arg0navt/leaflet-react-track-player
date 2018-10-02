# Leaflet-react-track-player
[![Build Status](https://travis-ci.org/joemccann/dillinger.svg?branch=master)](https://travis-ci.org/argonavt11/leaflet-react-track-player)

![](https://github.com/argonavt11/leaflet-react-track-player/blob/master/public/img/demo.gif?raw=true)

------------

This is package was created how plugin to [react-leaflet](https://github.com/PaulLeCam/react-leaflet) . It create player which animates polyline and control it. It gives functions stop, play, next point, prev point, and control to speed of polyline. It have dynamic progress of line, multiсolor

#### Install

```sh
npm install leaflet-react-track-player
yarn add leaflet-react-track-player
```

------------

#### 
    import React, { Component } from "react";
    import LeafletReactTrackPlayer from "
    
    laeflet-react-track-player";
    import demo from "./demo";
    import { Map, TileLayer } from "react-leaflet";
    
    class App extends Component {
      state = {
        lat: 47.445745,
        lng: 40.272891666666666,
        zoom: 15,
        type: "distance",
        demo: demo
      };
      render() {
        const position = [demo[0].lat, demo[0].lng];
        return (
          <div className="App">
            <Map center={position} zoom={this.state.zoom}>
              <LeafletReactTrackPlayer
                track={this.state.demo}
                optionMultyIdxFn={function(p) {
                  return p.status;
                }}
                optionsMulty={[
                  { color: "#b1b1b1" },
                  { color: "#06a9f5" },
                  { color: "#202020" },
                  { color: "#D10B41" },
                  { color: "#78c800" }
                ]}
                progressFormat={this.state.type}
                customMarker={true}
                changeCourseCustomMarker={true}
                markerIcon={"/img/mech.svg"}
              />
              <TileLayer
                attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </Map>
          </div>
        );
      }
    }
    
------------

#### Params
    
| Prop | Type  | Default  | Description |
| :------------ | :------------ | :------------ | :------------ |
| track  | Array  | [] | It is points for polyline  |
| optionMultyIdxFn  | Function  | () => {}  | Function split track on colors  |
| optionsMulty  | Array  | []  | It is colors for split |
| customMarker  | Boolean  | false  | Need setting your icon? |
| iconCustomMarker  | String  | ""  | Path to your icon |
| customCourse | Boolean  | false | Need changing course of marker? You need have course in points. Look at demo |
| timeFormat | String  | "YYMMDDHHmmss000" | Time format is for mode "time". You need times stamp in points. Look at demo |
| styleMarker | String  | "" | It is style for marker |
| speedArray | Array  | [] | It is array with sizes  |
| progressFormat | String  | "default" | Mode "default" use number point how value for progress. Mode "time" use time stamp how value for progress. Mode "distance" use range in meters how value for progress   |
| callbackFinish | Function  | () => {} | It is callback after finish  |
| callbackNext | Function  | () => {} | It is callback after switch on next point  |
| callbackPrev | Function  | () => {} | It is callback after switch on prev point  |
| callbackSpeed | Function  | () => {} | It is callback after change speed  |
| callbackSpeed | Function  | () => {} | It is callback after animation  |
