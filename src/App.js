import React, { Component } from 'react';
import "./App.css"
import LeafletReactTrackPlayer from "components/laeflet-react-track-player"
import L from "leaflet"
import { Map, TileLayer } from "react-leaflet"

class App extends Component {
  state = {
    lat: 47.445745,
    lng: 40.272891666666666,
    zoom: 15,
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
                lat: 47.445745,
                lng: 40.272891666666666,
                status: 1,
                t: "180921100658000",
              }, {
                LOAD: 27.74,
                SPEED: 0.88,
                course: 328,
                lat: 47.443255,
                lng: 40.273045,
                status: 1,
                t: "180921100947000"
              }, {
                LOAD: 50.75,
                SPEED: 12.77,
                course: 258,
                lat: 47.443255,
                lng: 40.2730457,
                status: 1,
                t: "180921100958000"
              }, {
                LOAD: 50.75,
                SPEED: 12.77,
                course: 258,
                lat: 47.44325166666667,
                lng: 40.27352,
                status: 4,
                t: "180921101043000"
              }, {
                LOAD: 50.75,
                SPEED: 12.77,
                course: 258,
                lat: 47.4432433333333357,
                lng: 40.274631666666664,
                status: 4,
                t: "180921101128000"
              }, {
                LOAD: 50.75,
                SPEED: 12.77,
                course: 258,
                lat: 47.44323333333333,
                lng: 40.276125,
                status: 4,
                t: "180921101228000"
              }, {
                LOAD: 50.75,
                SPEED: 12.77,
                course: 258,
                lat: 47.44323166666667,
                lng: 40.277606666666664,
                status: 4,
                t: "180921101328000"
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

export default App;
