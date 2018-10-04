import React, { Component } from "react";
import "./App.css";
import LeafletReactTrackPlayer from "components/laeflet-react-track-player";
import demo from "./demo";
import { Map, TileLayer } from "react-leaflet";

class App extends Component {
  state = {
    lat: 47.445745,
    lng: 40.272891666666666,
    zoom: 15,
    type: "default",
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
            startPosition={40}
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

export default App;
