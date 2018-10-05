import React from "react";
import moment from "moment";
import PropTypes from "prop-types";
import L from "leaflet";

export default class Dots extends React.PureComponent {
  procentDefault = index => {
    return index / (this.props.track.length / 100)
  };
  procentTime = item => {
    const itemDuration =
      moment(item.t, this.props.timeFormat) -
      moment(this.props.track[0].t, this.props.timeFormat);
    return itemDuration / (this.props.durationTrack / 100);
  };
  procentDistance = (prevProcent, item, index) => {
    let point = L.latLng(item);
    if (this.props.track[index + 1]) {
      var thisDistance = point.distanceTo(this.props.track[index + 1]);
      prevProcent.val = prevProcent.val + thisDistance;
      return (prevProcent.val / this.props.maxDistance) * 100;
    }
  };
  render() {
    var prevProcent = {val: 0};
    return this.props.track.map((item, index) => {
      return (
        <div
          key={index}
          className="tp_track-points_item"
          style={{
            left: `${
              this.props.type === "default"
                ? this.procentDefault(index)
                : this.props.type === "time"
                  ? this.procentTime(item)
                  : this.props.type === "distance"
                    ? this.procentDistance(prevProcent, item, index)
                    : 0
            }%`
          }}
        />
      );
    });
  }
}

Dots.propTypes = {
  track: PropTypes.arrayOf(PropTypes.object),
  type: PropTypes.string,
  timeFormat: PropTypes.string,
  maxDistance: PropTypes.number,
  durationTrack: PropTypes.number
};
