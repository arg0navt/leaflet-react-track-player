# Leaflet-react-track-player
[![Build Status](https://travis-ci.org/argonavt11/leaflet-react-track-player.svg?branch=master)](https://travis-ci.org/argonavt11/leaflet-react-track-player)

![](https://github.com/argonavt11/leaflet-react-track-player/blob/master/public/img/demo.gif?raw=true)

------------

This is package was created as a plugin for [react-leaflet](https://github.com/PaulLeCam/react-leaflet) . It creates a player which animates along a polyline. It provides functions for pause, play and playback speed. The track colors may be customized.

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
| track  | Array  | [] | The points that define the polyline  |
| optionMultyIdxFn  | Function  | () => {}  | Function to defined track segment colors  |
| optionsMulty  | Array  | []  | The colors used for track segments |
| customMarker  | Boolean  | false  | Should use a custom marker icon |
| iconCustomMarker  | String  | ""  | Path to your marker icon |
| customCourse | Boolean  | false | Need changing course of marker? You need have course in points. See demo |
| timeFormat | String  | "YYMMDDHHmmss000" | Time format is for mode "time". You need times stamps in points. See demo |
| styleMarker | String  | "" | Inline style for the marker |
| speedArray | Array  | [] | List of speeds  |
| progressFormat | String  | "default" | Mode "default" uses the number of points as the value for progress. Mode "time" uses time stamps as the value for progress. Mode "distance" uses range in meters as the value for progress |
| callbackFinish | Function  | () => {} | Called after one full track run  |
| callbackNext | Function  | () => {} | Called after next point in the polyline is reached  |
| callbackPrev | Function  | () => {} | Called after previous point in the polyline is reached   |
| callbackSpeed | Function  | () => {} | Called after changing spead  |
