import React, { Component } from 'react';
import "./App.css"
import LeafletReactTrackPlayer from "components/laeflet-react-track-player"
import { Map, TileLayer } from "react-leaflet"

class App extends Component {
  state = {
    lat: 51.99966833333333,
    lng: 81.767595,
    zoom: 18,
  }
  render() {
    const position = [this.state.lat, this.state.lng]
    return (
      <div className="App">
        <Map center={position} zoom={this.state.zoom}>
          <LeafletReactTrackPlayer
            track={
              [{
                LOAD: 40.88,
                SPEED: 4.4,
                course: 0,
                lat: 51.99966833333333,
                lng: 81.767595,
                status: 1,
                t: "180919050440000",
              }, {
                LOAD: 65.39,
                SPEED: 8.15,
                course: 123,
                lat: 51.999945,
                lng: 81.76813,
                status: 1,
                t: "180919051456000"
              }, {
                LOAD: 17.47,
                SPEED: 0,
                course: 0,
                lat: 51.99953166666667,
                lng: 81.76910833333334,
                status: 1,
                t: "180919051640000"
              }, {
                LOAD: 27.74,
                SPEED: 0.88,
                course: 328,
                lat: 51.99959,
                lng: 81.76885,
                status: 4,
                t: "180919052256000"
              }, {
                LOAD: 50.75,
                SPEED: 12.77,
                course: 258,
                lat: 51.999775,
                lng: 81.76819166666667,
                status: 4,
                t: "180919053140000"
              }, {
                LOAD: 50.75,
                SPEED: 12.77,
                course: 258,
                lat: 51.999775,
                lng: 81.76819166666667,
                status: 4,
                t: "180919053140000"
              }]
            }
            useMultyPolyline={true}
            optionMultyIdxFn={function (p) {
              return p.status;
            }}
            optionsMulty={
              [
                { color: "#b1b1b1" }, { color: "#06a9f5"}, { color: "#202020" },
                { color: "#D10B41" }, { color: "#78c800" }
              ]
            }
            focus={true}
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

export default App;
