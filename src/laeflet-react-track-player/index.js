import React from "react";
import PropTypes from "prop-types";
import moment from "moment";
import L from "leaflet";
import Control from "@skyeer/react-leaflet-custom-control";
import Dots from "./dots";
import { MapLayer, withLeaflet } from "react-leaflet";
import { findLastIndex } from "lodash";
import "./multyPolyline";
import "./snake";
import "./index.css";

const paramsForMultiPolyline = props => {
  return {
    multiOptions: {
      optionIdxFn: props.optionMultyIdxFn
        ? props.optionMultyIdxFn
        : function() {},
      options: props.optionsMulty ? props.optionsMulty : []
    }
  };
};

export const getDistance = polyline =>
  polyline.reduce((result, item, index) => {
    var point = L.latLng(item);
    if (polyline[index + 1]) {
      result = result + point.distanceTo(polyline[index + 1]);
    }
    return result;
  }, 0);

class LeafletReactTrackPlayer extends MapLayer {
  constructor(props) {
    super(props);
    this.state = {
      activePosition: props.startPosition === 0,
      track: props.track,
      active: true,
      activeStream: props.streamData,
      durationTrack:
        props.progressFormat === "time"
          ? moment(
              props.track[this.props.track.length - 1].t,
              props.timeFormat
            ) - moment(props.track[0].t, props.timeFormat)
          : 0,
      speed: props.speedArray[0],
      maxDistance: getDistance(props.track),
      openSpeedControl: false,
      init: false,
      options: {
        progressFormat: props.progressFormat,
        timeFormat: props.timeFormat
      }
    };
  }

  createLeafletElement() {
    // icon
    this.createIcon = rotate =>
      L.divIcon({
        html: `<div class="custom-marker-player${
          !this.props.customMarker ? " default" : ""
        }" style="background: url('${
          this.props.customMarker
            ? this.props.iconCustomMarker
            : "https://unpkg.com/leaflet@1.3.4/dist/images/marker-icon-2x.png"
        }') no-repeat center; height: 100%; transform: rotate(${
          this.props.customMarker && this.props.customCourse ? rotate : 0
        }deg)${this.props.styleMarker}"></div>`,
        iconSize: [35, 35]
      });
    const course =
      this.props.customMarker &&
      this.props.customCourse &&
      this.props.track[0] &&
      this.props.track[0].course
        ? this.props.track[0].course
        : null;
    const finishMarker = L.marker(this.props.track[0], {
      icon: this.createIcon(course)
    });
    this.props.leaflet.map.addLayer(finishMarker);
    // polyline
    const snakePolyline = L.multiColorsPolyline(this.props.track, {
      ...paramsForMultiPolyline(this.props),
      timeFormat: this.props.timeFormat,
      progressFormat: this.props.progressFormat,
      startPosition: this.props.startPosition,
      defaultSpeed: this.props.defaultSpeed,
    });
    this.props.leaflet.map.addLayer(snakePolyline);
    return {
      snakePolyline,
      finishMarker
    };
  }

  componentDidMount() {
    this.initSnake();
  }

  initSnake = () => {
    this.leafletElement.snakePolyline.snakePlayer({
      fly: point => this.flyTrack(point),
      nextPoint: (point, index) => this.nextPoint(point, index),
      finish: lastPosition => this.finishTrack(lastPosition),
      change: (point, distance) => {
        // callback: changing position
        if (point) this.leafletElement.finishMarker.setLatLng(point);
        if (distance && this.state.options.progressFormat === "distance")
          this.setState({
            distance,
            activePosition: (distance / this.state.maxDistance) * 100
          });
      }
    });
    this.setState({ init: true });
  };

  flyTrack = point => {
    if (point) {
      if (this.state.options.progressFormat === "distance") {
        this.leafletElement.finishMarker.setLatLng(point.point);
        this.setState({
          activePosition: (point.distance / this.state.maxDistance) * 100
        });
        this.props.callbackFly(point.point);
      } else {
        this.leafletElement.finishMarker.setLatLng(point);
        this.props.callbackFly(point);
      }
    }
  };

  nextPoint = (point, index) => {
    // callback: add new point to step of animation
    if (this.state.options.progressFormat === "default") {
      this.setState(
        {
          activePoint: point,
          activePosition: (index / this.state.track.length) * 100
        },
        () => this.props.callbackCourse(point, index)
      );
    } else if (this.state.options.progressFormat === "time") {
      const thisDistance =
        moment(point.t, this.props.timeFormat) -
        moment(this.state.track[0].t, this.props.timeFormat);
      this.setState(
        {
          activePoint: point,
          activeTimeStamp: point.t,
          activePosition: thisDistance / (this.state.durationTrack / 100)
        },
        () => this.props.callbackCourse(point, index)
      );
    } else if (this.state.options.progressFormat === "distance") {
      this.setState(
        {
          activePoint: point
        },
        () => this.props.callbackCourse(point, index)
      );
    }
    this.leafletElement.finishMarker.setIcon(this.createIcon(point.course));
  };

  finishTrack = lastPosition => {
    // callback: end of animation or last point after changing position
    if (lastPosition) {
      this.setState({
        active: false,
        activeTimeStamp:
          this.state.options.progressFormat === "default" ||
          this.state.options.progressFormat === "distance"
            ? this.state.track.length - 1
            : this.state.track[this.state.track.length - 1].t,
        activePosition: 100
      });
      this.leafletElement.finishMarker.setLatLng(
        this.state.track[this.state.track.length - 1]
      );
      this.props.callbackFinish();
    }
    this.setState({ active: false });
  };

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.state.init !== nextState.init ||
      this.state.activePosition !== nextProps.activePosition ||
      this.props.track !== nextProps.track
    );
  }

  updateLeafletElement(fromProps, toProps) {
    if (
      fromProps.track.length !== toProps.track.length &&
      this.state.activeStream
    ) {
      this.setState({ active: true });
      const newPointsPolyline =
        this.props.progressFormat === "default" ||
        this.props.progressFormat === "distance"
          ? L.multiColorsPolyline(
              toProps.track.slice(fromProps.track.length - 1),
              paramsForMultiPolyline(this.props)
            )
          : L.multiColorsPolyline(
              toProps.track.filter(
                item =>
                  Number(item.t) >=
                  Number(fromProps.track[fromProps.track.length - 1].t)
              ),
              paramsForMultiPolyline(this.props)
            );
      const keys = Object.keys(newPointsPolyline._layers);
      const values = keys.reduce((result, item) => {
        const copy = L.polyline(newPointsPolyline._layers[item]._latlngs, {
          color: newPointsPolyline._layers[item].options.color,
          timeFormat: this.state.options.timeFormat,
          progressFormat: this.state.options.progressFormat
        });
        result.push(copy);
        return result;
      }, []);
      this.leafletElement.snakePolyline.addPolyline(
        values,
        newPointsPolyline._detailData
      );
      const distanceNewPoints = getDistance(newPointsPolyline._originalLatlngs);
      if (this.props.progressFormat === "default") {
        this.updateProgressByDefault(fromProps, toProps, distanceNewPoints);
      } else if (this.props.progressFormat === "distance") {
        this.updateProgressByDistance(toProps, distanceNewPoints);
      } else if (this.props.progressFormat === "time") {
        this.updateProgressByTime(toProps, distanceNewPoints);
      }
    }
    if (fromProps.iconCustomMarker !== toProps.iconCustomMarker) {
      this.leafletElement.finishMarker._icon.children[0].style.background = `url(${toProps.iconCustomMarker}) center center no-repeat`;
    }
  }

  updateProgressByDefault = (from, to, newDistance) => {
    const activeIndex = Number(
      (((from.track.length - 1) / 100) * this.state.activePosition).toFixed()
    );
    this.setState({
      activePosition: (activeIndex / (to.track.length - 1)) * 100,
      track: to.track,
      maxDistance: this.state.maxDistance + newDistance
    });
  };

  updateProgressByDistance = (to, newDistance) => {
    this.setState(
      {
        track: to.track,
        maxDistance: this.state.maxDistance + newDistance
      },
      () => {
        this.setState({
          activePosition: Number(
            ((this.state.distance / this.state.maxDistance) * 100).toFixed()
          )
        });
      }
    );
  };

  updateProgressByTime = (to, newDistance) => {
    this.setState(
      {
        track: to.track,
        durationTrack:
          moment(to.track[to.track.length - 1].t, to.timeFormat) -
          moment(to.track[0].t, to.timeFormat),
        maxDistance: this.state.maxDistance + newDistance
      },
      () => {
        const itemDuration =
          moment(this.state.activeTimeStamp, this.props.timeFormat) -
          moment(to.track[0].t, this.props.timeFormat);
        this.setState({
          activePosition: (itemDuration / this.state.durationTrack) * 100
        });
      }
    );
  };

  changeActivePosition = e => {
    const coordinates = e.target.getBoundingClientRect();
    const activeX = e.pageX;
    const activePosition =
      (activeX - coordinates.left) / (this.line.clientWidth / 100);
    if (!this.state.activeStream) {
      this.changePositionByType(activePosition);
    }
  };

  changePositionByType = activePosition => {
    switch (this.state.options.progressFormat) {
      case "default": {
        const indexPoint = Number(
          (activePosition * (this.state.track.length / 100)).toFixed()
        );
        this.leafletElement.snakePolyline.changePosition(indexPoint);
        break;
      }
      case "time": {
        const activePositionTime = moment(
          this.state.track[0].t,
          this.props.timeFormat
        ).add((this.state.durationTrack / 100) * activePosition, "millisecond");
        this.leafletElement.snakePolyline.changePosition(
          activePositionTime.format(this.props.timeFormat),
          true
        );
        break;
      }
      case "distance": {
        this.leafletElement.snakePolyline.changePosition(
          (this.state.maxDistance / 100) * activePosition
        );
        break;
      }
      default: {
        break;
      }
    }
  };

  tooglePlay = () => {
    this.setState(
      {
        active: !this.state.active
      },
      () => {
        if (this.state.active) {
          this.leafletElement.snakePolyline.snakePlay();
        } else this.leafletElement.snakePolyline.snakeStop();
      }
    );
  };

  nextStep = () => {
    if (this.state.options.progressFormat === "time") {
      const indexActiveButton = findLastIndex(
        this.state.track,
        item => item.t === this.state.activeTimeStamp
      );
      if (
        indexActiveButton !== -1 &&
        indexActiveButton !== this.state.track.length - 1
      ) {
        this.leafletElement.snakePolyline.changePosition(
          this.state.track[indexActiveButton + 1].t
        );
        this.props.callbackNext(this.state.track[indexActiveButton + 1]);
      }
    } else
      this.setState(
        {
          activePosition:
            this.state.activePosition < 100
              ? this.state.activePosition + 1
              : 100
        },
        () => this.changePositionByType(this.state.activePosition)
      );
  };

  prevStep = () => {
    if (this.state.options.progressFormat === "time") {
      const indexActiveButton = findLastIndex(
        this.state.track,
        item => item.t === this.state.activeTimeStamp
      );
      if (indexActiveButton >= 1) {
        this.leafletElement.snakePolyline.changePosition(
          this.state.track[indexActiveButton - 1].t
        );
        this.props.callbackPrev(this.state.track[indexActiveButton + 1]);
      }
    } else
      this.setState(
        {
          activePosition:
            this.state.activePosition > 0 ? this.state.activePosition - 1 : 0
        },
        () => this.changePositionByType(this.state.activePosition)
      );
  };

  changeSpeed = xSpeed =>
    this.setState(
      {
        speed: xSpeed
      },
      () => {
        this.leafletElement.snakePolyline.changeSpeed(xSpeed);
        this.props.callbackSpeed(xSpeed);
      }
    );

  stop = () => {
    this.setState({ activePosition: 0, active: false }, () => {
      this.leafletElement.finishMarker.setLatLng(this.state.track[0]);
      this.changePositionByType(1);
    });
  };

  toogleStream = () => {
    this.setState({ activeStream: !this.state.activeStream });
  };

  componentWillUnmount() {
    for (let key in this.leafletElement) {
      this.props.leaflet.map.removeLayer(this.leafletElement[key])
    }
  }

  render() {
    return (
      <Control position="bottomleft">
        {this.props.useControl ? (
          <div className="leaflet-control leaflet-react-track-player">
            <div className="tp-buttons">
              <button
                className="tp_button prev"
                onClick={() => this.prevStep()}
                alt="Prev"
                disabled={this.state.activeStream}
              />
              <button
                className={`tp_button ${this.state.active ? "pause" : "play"}`}
                onClick={() => this.tooglePlay()}
                alt={this.state.active ? "PaUse" : "Play"}
                disabled={this.state.activeStream}
              />
              {!this.props.streamData ? (
                <button
                  alt="Stop"
                  className="tp_button stop"
                  onClick={() => this.toogleStream()}
                />
              ) : (
                <button
                  alt="Stop stream"
                  className={`tp_button${
                    this.state.activeStream ? " stop" : " stream"
                  }`}
                  onClick={() => this.toogleStream()}
                />
              )}
              <button
                className="tp_button next"
                onClick={() => this.nextStep()}
                alt={"Next"}
                disabled={this.state.activeStream}
              />
              <button
                className="tp_button speed"
                onClick={() =>
                  this.setState({
                    openSpeedControl: !this.state.openSpeedControl
                  })
                }
                alt="Change Speed"
              />
              {this.state.openSpeedControl ? (
                <div className="tp-speed">
                  {this.props.speedArray.map(item => (
                    <button
                      key={item}
                      alt={item}
                      className={`tp-speed-item${
                        this.state.speed === item ? " active" : ""
                      }`}
                      onClick={() => this.changeSpeed(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="tp_track-line">
              <div
                className="tp_track-line_line"
                ref={line => {
                  this.line = line;
                }}
                onClick={e => this.changeActivePosition(e)}
              >
                <div
                  key={this.state.activePosition}
                  style={{ width: `${this.state.activePosition}%` }}
                  className="tp_track-line_active"
                />
              </div>
              {this.props.showDots ? (
                <div
                  className="tp_track-points"
                  ref={e => {
                    this.pointsLine = e;
                  }}
                >
                  <Dots
                    key={"markers"}
                    track={this.state.track}
                    type={this.state.options.progressFormat}
                    timeFormat={this.props.timeFormat}
                    maxDistance={this.state.maxDistance}
                    durationTrack={this.state.durationTrack}
                  />
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </Control>
    );
  }
}

LeafletReactTrackPlayer.defaultProps = {
  useControl: true,
  useInformationPanel: false,
  optionMultyIdxFn: function() {},
  optionsMulty: [],
  customMarker: false,
  iconCustomMarker: "",
  customCourse: false,
  timeFormat: "YYMMDDHHmmss000",
  styleMarker: "",
  speedArray: [1, 10, 50, 100, 1000],
  progressFormat: "default",
  startPosition: 0,
  streamData: false,
  showDots: false,
  callbackFinish: function() {},
  callbackPrev: function() {},
  callbackNext: function() {},
  callbackSpeed: function() {},
  callbackFly: function() {},
  callbackCourse: function() {},
  callbackStream: function() {}
};

LeafletReactTrackPlayer.propTypes = {
  track: PropTypes.arrayOf(PropTypes.object),
  useControl: PropTypes.bool,
  useInformationPanel: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
  optionMultyIdxFn: PropTypes.func,
  optionIdxFn: PropTypes.arrayOf(PropTypes.object),
  customMarker: PropTypes.bool,
  iconCustomMarker: PropTypes.string,
  customCourse: PropTypes.bool,
  timeFormat: PropTypes.string,
  styleMarker: PropTypes.string,
  speedArray: PropTypes.arrayOf(PropTypes.number),
  progressFormat: PropTypes.string,
  callbackFinish: PropTypes.func,
  startPosition: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  streamData: PropTypes.bool,
  showDots: PropTypes.bool,
  defaultSpeed: PropTypes.number,
  callbackNext: PropTypes.func,
  callbackPrev: PropTypes.func,
  callbackSpeed: PropTypes.func,
  callbackFly: PropTypes.func,
  callbackCourse: PropTypes.func,
  callbackStream: PropTypes.func
};

export default withLeaflet(LeafletReactTrackPlayer);
