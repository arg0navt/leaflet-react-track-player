import React from "react";
import Adapter from "enzyme-adapter-react-16";
import { configure, render } from "enzyme";
import { Map, TileLayer } from "react-leaflet";
import demo from "./demo";
import LeafletReactTrackPlayer from "./laeflet-react-track-player";

configure({ adapter: new Adapter() });

it("render default", () => {
  const div = global.document.createElement("div");
  global.document.body.appendChild(div);

  const wrapper = render(
    <Map center={[47.445745, 40.272891666666666]} zoom={10}>
      <LeafletReactTrackPlayer
        track={demo}
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
        useControl={true}
        progressFormat={"time"}
        customMarker={true}
        defaultSpeed={10}
        streamData={false}
        changeCourseCustomMarker={true}
        iconCustomMarker={"/img/mech.svg"}
      />
      <TileLayer
        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
    </Map>,
    { attachTo: div }
  );
  //   const output = shallow(wrapper);
  expect(wrapper.html());
});
