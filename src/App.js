import React, { Component } from 'react';
import "./App.css"
import LeafletReactTrackPlayer from "components/laeflet-react-track-player"
import { Map, TileLayer, Marker, Popup } from "react-leaflet"

class App extends Component {
  state = {
    lat: 51.505,
    lng: -0.09,
    zoom: 13,
  }
  render() {
    const position = [this.state.lat, this.state.lng]
    return (
      <div className="App">
        <Map center={position} zoom={this.state.zoom}>
          <LeafletReactTrackPlayer
            track={
              [{
                LOAD: 16,
                SPEED: 3.4,
                course: 0,
                lat: 46.521393333333336,
                lng: 39.77077166666667,
                status: 1,
                t: "180918074919000"
              },{
                LOAD: 16,
                SPEED: 3.4,
                course: 0,
                lat: 46.52142666666666,
                lng: 39.770603333333334,
                status: 1,
                t: "180918084223000"
              },{
                LOAD: 16,
                SPEED: 3.4,
                course: 0,
                lat: 46.51617,
                lng: 39.80417666666666,
                status: 1,
                t: "180918090101000"
              }]
            }
            zoom={true}
          />
          <TileLayer
            attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>
              A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
          </Marker>
        </Map>
      </div>
    );
  }
}

export default App;
