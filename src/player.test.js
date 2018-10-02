import React from 'react';
import renderer from "react-test-renderer";
import LeafletReactTrackPlayer from "./node_modules/components/laeflet-react-track-player";
import demo from "./demo";
import { Map } from "react-leaflet";

// TODO

it("render default", () => {
    const tree = renderer.create(
        <Map center={[47.445745, 40.272891666666666]} zoom={15}>
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
                progressFormat={"default"}
                customMarker={true}
                changeCourseCustomMarker={true}
                markerIcon={"/img/mech.svg"}
            />
        </Map>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });