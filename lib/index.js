"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDistance = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

var _leaflet = require("leaflet");

var _leaflet2 = _interopRequireDefault(_leaflet);

var _reactLeafletControl = require("react-leaflet-control");

var _reactLeafletControl2 = _interopRequireDefault(_reactLeafletControl);

var _dots = require("./dots");

var _dots2 = _interopRequireDefault(_dots);

var _reactLeaflet = require("react-leaflet");

var _lodash = require("lodash");

require("./multyPolyline");

require("./snake");

require("./index.css");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var paramsForMultiPolyline = function paramsForMultiPolyline(props) {
  return {
    multiOptions: {
      optionIdxFn: props.optionMultyIdxFn ? props.optionMultyIdxFn : function () {},
      options: props.optionsMulty ? props.optionsMulty : []
    }
  };
};

var getDistance = exports.getDistance = function getDistance(polyline) {
  return polyline.reduce(function (result, item, index) {
    var point = _leaflet2.default.latLng(item);
    if (polyline[index + 1]) {
      result = result + point.distanceTo(polyline[index + 1]);
    }
    return result;
  }, 0);
};

var LeafletReactTrackPlayer = function (_MapLayer) {
  _inherits(LeafletReactTrackPlayer, _MapLayer);

  function LeafletReactTrackPlayer(props) {
    _classCallCheck(this, LeafletReactTrackPlayer);

    var _this = _possibleConstructorReturn(this, (LeafletReactTrackPlayer.__proto__ || Object.getPrototypeOf(LeafletReactTrackPlayer)).call(this, props));

    _this.initSnake = function () {
      _this.leafletElement.snakePolyline.snakeIn({
        fly: function fly(point) {
          return _this.flyTrack(point);
        },
        nextPoint: function nextPoint(point, index) {
          return _this.nextPoint(point, index);
        },
        finish: function finish(lastPosition) {
          return _this.finishTrack(lastPosition);
        },
        change: function change(point, distance) {
          // callback: changing position
          if (point) _this.leafletElement.finishMarker.setLatLng(point);
          if (distance && _this.state.options.progressFormat === "distance") _this.setState({
            distance: distance,
            activePosition: distance / _this.state.maxDistance * 100
          });
        }
      });
      _this.setState({ init: true });
    };

    _this.flyTrack = function (point) {
      if (point) {
        if (_this.state.options.progressFormat === "distance") {
          _this.leafletElement.finishMarker.setLatLng(point.point);
          _this.setState({
            activePosition: point.distance / _this.state.maxDistance * 100
          });
          _this.props.callbackFly(point.point);
        } else {
          _this.leafletElement.finishMarker.setLatLng(point);
          _this.props.callbackFly(point);
        }
      }
    };

    _this.nextPoint = function (point, index) {
      // callback: add new point to step of animation
      if (_this.state.options.progressFormat === "default") {
        _this.setState({
          activePoint: point,
          activePosition: index / _this.state.track.length * 100
        }, function () {
          return _this.props.callbackCourse(point, index);
        });
      } else if (_this.state.options.progressFormat === "time") {
        var thisDistance = (0, _moment2.default)(point.t, _this.props.timeFormat) - (0, _moment2.default)(_this.state.track[0].t, _this.props.timeFormat);
        _this.setState({
          activePoint: point,
          activeTimeStamp: point.t,
          activePosition: thisDistance / (_this.state.durationTrack / 100)
        }, function () {
          return _this.props.callbackCourse(point, index);
        });
      } else if (_this.state.options.progressFormat === "distance") {
        _this.setState({
          activePoint: point
        }, function () {
          return _this.props.callbackCourse(point, index);
        });
      }
      _this.leafletElement.finishMarker.setIcon(_this.createIcon(point.course));
    };

    _this.finishTrack = function (lastPosition) {
      // callback: end of animation or last point after changing position
      if (lastPosition) {
        _this.setState({
          active: false,
          activeTimeStamp: _this.state.options.progressFormat === "default" || _this.state.options.progressFormat === "distance" ? _this.state.track.length - 1 : _this.state.track[_this.state.track.length - 1].t,
          activePosition: 100
        });
        _this.leafletElement.finishMarker.setLatLng(_this.state.track[_this.state.track.length - 1]);
        _this.props.callbackFinish();
      }
      _this.setState({ active: false });
    };

    _this.updateProgressByDefault = function (from, to, newDistance) {
      var activeIndex = Number(((from.track.length - 1) / 100 * _this.state.activePosition).toFixed());
      _this.setState({
        activePosition: activeIndex / (to.track.length - 1) * 100,
        track: to.track,
        maxDistance: _this.state.maxDistance + newDistance
      });
    };

    _this.updateProgressByDistance = function (to, newDistance) {
      _this.setState({
        track: to.track,
        maxDistance: _this.state.maxDistance + newDistance
      }, function () {
        _this.setState({
          activePosition: Number((_this.state.distance / _this.state.maxDistance * 100).toFixed())
        });
      });
    };

    _this.updateProgressByTime = function (to, newDistance) {
      _this.setState({
        track: to.track,
        durationTrack: (0, _moment2.default)(to.track[to.track.length - 1].t, to.timeFormat) - (0, _moment2.default)(to.track[0].t, to.timeFormat),
        maxDistance: _this.state.maxDistance + newDistance
      }, function () {
        var itemDuration = (0, _moment2.default)(_this.state.activeTimeStamp, _this.props.timeFormat) - (0, _moment2.default)(to.track[0].t, _this.props.timeFormat);
        _this.setState({
          activePosition: itemDuration / _this.state.durationTrack * 100
        });
      });
    };

    _this.changeActivePosition = function (e) {
      var coordinates = e.target.getBoundingClientRect();
      var activeX = e.pageX;
      var activePosition = (activeX - coordinates.left) / (_this.line.clientWidth / 100);
      if (!_this.state.activeStream) {
        _this.changePositionByType(activePosition);
      }
    };

    _this.changePositionByType = function (activePosition) {
      switch (_this.state.options.progressFormat) {
        case "default":
          {
            var indexPoint = Number((activePosition * (_this.state.track.length / 100)).toFixed());
            _this.leafletElement.snakePolyline.changePosition(indexPoint);
            break;
          }
        case "time":
          {
            var activePositionTime = (0, _moment2.default)(_this.state.track[0].t, _this.props.timeFormat).add(_this.state.durationTrack / 100 * activePosition, "millisecond");
            _this.leafletElement.snakePolyline.changePosition(activePositionTime.format(_this.props.timeFormat), true);
            break;
          }
        case "distance":
          {
            _this.leafletElement.snakePolyline.changePosition(_this.state.maxDistance / 100 * activePosition);
            break;
          }
        default:
          {
            break;
          }
      }
    };

    _this.tooglePlay = function () {
      _this.setState({
        active: !_this.state.active
      }, function () {
        if (_this.state.active) {
          _this.leafletElement.snakePolyline.snakePlay();
        } else _this.leafletElement.snakePolyline.snakeStop();
      });
    };

    _this.nextStep = function () {
      if (_this.state.options.progressFormat === "time") {
        var indexActiveButton = (0, _lodash.findLastIndex)(_this.state.track, function (item) {
          return item.t === _this.state.activeTimeStamp;
        });
        if (indexActiveButton !== -1 && indexActiveButton !== _this.state.track.length - 1) {
          _this.leafletElement.snakePolyline.changePosition(_this.state.track[indexActiveButton + 1].t);
          _this.props.callbackNext(_this.state.track[indexActiveButton + 1]);
        }
      } else _this.setState({
        activePosition: _this.state.activePosition < 100 ? _this.state.activePosition + 1 : 100
      }, function () {
        return _this.changePositionByType(_this.state.activePosition);
      });
    };

    _this.prevStep = function () {
      if (_this.state.options.progressFormat === "time") {
        var indexActiveButton = (0, _lodash.findLastIndex)(_this.state.track, function (item) {
          return item.t === _this.state.activeTimeStamp;
        });
        if (indexActiveButton >= 1) {
          _this.leafletElement.snakePolyline.changePosition(_this.state.track[indexActiveButton - 1].t);
          _this.props.callbackPrev(_this.state.track[indexActiveButton + 1]);
        }
      } else _this.setState({
        activePosition: _this.state.activePosition > 0 ? _this.state.activePosition - 1 : 0
      }, function () {
        return _this.changePositionByType(_this.state.activePosition);
      });
    };

    _this.changeSpeed = function (xSpeed) {
      return _this.setState({
        speed: xSpeed
      }, function () {
        _this.leafletElement.snakePolyline.changeSpeed(xSpeed);
        _this.props.callbackSpeed(xSpeed);
      });
    };

    _this.stop = function () {
      _this.setState({ activePosition: 0, active: false }, function () {
        _this.leafletElement.finishMarker.setLatLng(_this.state.track[0]);
        _this.changePositionByType(1);
      });
    };

    _this.toogleStream = function () {
      _this.setState({ activeStream: !_this.state.activeStream });
    };

    _this.state = {
      activePosition: props.startPosition === 0,
      track: props.track,
      active: true,
      activeStream: props.streamData,
      durationTrack: props.progressFormat === "time" ? (0, _moment2.default)(props.track[_this.props.track.length - 1].t, props.timeFormat) - (0, _moment2.default)(props.track[0].t, props.timeFormat) : 0,
      speed: props.speedArray[0],
      maxDistance: getDistance(props.track),
      openSpeedControl: false,
      init: false,
      options: {
        progressFormat: props.progressFormat,
        timeFormat: props.timeFormat
      }
    };
    return _this;
  }

  _createClass(LeafletReactTrackPlayer, [{
    key: "createLeafletElement",
    value: function createLeafletElement() {
      var _this2 = this;

      // icon
      this.createIcon = function (rotate) {
        return _leaflet2.default.divIcon({
          html: "<div class=\"custom-marker-player" + (!_this2.props.customMarker ? " default" : "") + "\" style=\"background: url('" + (_this2.props.customMarker ? _this2.props.iconCustomMarker : "https://unpkg.com/leaflet@1.3.4/dist/images/marker-icon-2x.png") + "') no-repeat center; height: 100%; transform: rotate(" + (_this2.props.customMarker && _this2.props.customCourse ? rotate : 0) + "deg)" + _this2.props.styleMarker + "\"></div>",
          iconSize: [35, 35]
        });
      };
      var course = this.props.customMarker && this.props.customCourse && this.state.track[0] && this.state.track[0].course ? this.state.track[0].course : null;
      var finishMarker = _leaflet2.default.marker(this.props.track[0], {
        icon: this.createIcon(course)
      });
      this.props.leaflet.map.addLayer(finishMarker);
      // polyline
      var snakePolyline = _leaflet2.default.multiColorsPolyline(this.props.track, _extends({}, paramsForMultiPolyline(this.props), {
        timeFormat: this.props.timeFormat,
        progressFormat: this.props.progressFormat,
        startPosition: this.props.startPosition
      }));
      this.props.leaflet.map.addLayer(snakePolyline);
      return {
        snakePolyline: snakePolyline,
        finishMarker: finishMarker
      };
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      this.initSnake();
    }
  }, {
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate(nextProps, nextState) {
      return this.state.init !== nextState.init || this.state.activePosition !== nextProps.activePosition || this.props.track !== nextProps.track;
    }
  }, {
    key: "updateLeafletElement",
    value: function updateLeafletElement(fromProps, toProps) {
      var _this3 = this;

      if (fromProps.track.length !== toProps.track.length && this.state.activeStream) {
        this.setState({ active: true });
        var newPointsPolyline = this.props.progressFormat === "default" || this.props.progressFormat === "distance" ? _leaflet2.default.multiColorsPolyline(toProps.track.slice(fromProps.track.length - 1), paramsForMultiPolyline(this.props)) : _leaflet2.default.multiColorsPolyline(toProps.track.filter(function (item) {
          return Number(item.t) > Number(fromProps.track[fromProps.track.length - 1].t);
        }), paramsForMultiPolyline(this.props));
        var keys = Object.keys(newPointsPolyline._layers);
        var values = keys.reduce(function (result, item) {
          var copy = _leaflet2.default.polyline(newPointsPolyline._layers[item]._latlngs, {
            color: newPointsPolyline._layers[item].options.color,
            timeFormat: _this3.state.options.timeFormat,
            progressFormat: _this3.state.options.progressFormat
          });
          result.push(copy);
          return result;
        }, []);
        this.leafletElement.snakePolyline.addPolyline(values, newPointsPolyline._detailData);
        var distanceNewPoints = getDistance(newPointsPolyline._originalLatlngs);
        if (this.props.progressFormat === "default") {
          this.updateProgressByDefault(fromProps, toProps, distanceNewPoints);
        } else if (this.props.progressFormat === "distance") {
          this.updateProgressByDistance(toProps, distanceNewPoints);
        } else if (this.props.progressFormat === "time") {
          this.updateProgressByTime(toProps, distanceNewPoints);
        }
      }
      if (fromProps.iconCustomMarker !== toProps.iconCustomMarker) {
        this.leafletElement.finishMarker._icon.children[0].style.background = "url(" + toProps.iconCustomMarker + ") center center no-repeat";
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this4 = this;

      return _react2.default.createElement(
        _reactLeafletControl2.default,
        { position: "bottomleft" },
        this.props.useControl ? _react2.default.createElement(
          "div",
          { className: "leaflet-control leaflet-react-track-player" },
          _react2.default.createElement(
            "div",
            { className: "tp-buttons" },
            _react2.default.createElement("button", {
              className: "tp_button prev",
              onClick: function onClick() {
                return _this4.prevStep();
              },
              alt: "Prev",
              disabled: this.state.activeStream
            }),
            _react2.default.createElement("button", {
              className: "tp_button " + (this.state.active ? "pause" : "play"),
              onClick: function onClick() {
                return _this4.tooglePlay();
              },
              alt: this.state.active ? "PaUse" : "Play",
              disabled: this.state.activeStream
            }),
            !this.props.streamData ? _react2.default.createElement("button", {
              alt: "Stop",
              className: "tp_button stop",
              onClick: function onClick() {
                return _this4.toogleStream();
              }
            }) : _react2.default.createElement("button", {
              alt: "Stop stream",
              className: "tp_button" + (this.state.activeStream ? " stop" : " stream"),
              onClick: function onClick() {
                return _this4.toogleStream();
              }
            }),
            _react2.default.createElement("button", {
              className: "tp_button next",
              onClick: function onClick() {
                return _this4.nextStep();
              },
              alt: "Next",
              disabled: this.state.activeStream
            }),
            _react2.default.createElement("button", {
              className: "tp_button speed",
              onClick: function onClick() {
                return _this4.setState({
                  openSpeedControl: !_this4.state.openSpeedControl
                });
              },
              alt: "Change Speed"
            }),
            this.state.openSpeedControl ? _react2.default.createElement(
              "div",
              { className: "tp-speed" },
              this.props.speedArray.map(function (item) {
                return _react2.default.createElement(
                  "button",
                  {
                    key: item,
                    alt: item,
                    className: "tp-speed-item" + (_this4.state.speed === item ? " active" : ""),
                    onClick: function onClick() {
                      return _this4.changeSpeed(item);
                    }
                  },
                  item
                );
              })
            ) : null
          ),
          _react2.default.createElement(
            "div",
            { className: "tp_track-line" },
            _react2.default.createElement(
              "div",
              {
                className: "tp_track-line_line",
                ref: function ref(line) {
                  _this4.line = line;
                },
                onClick: function onClick(e) {
                  return _this4.changeActivePosition(e);
                }
              },
              _react2.default.createElement("div", {
                key: this.state.activePosition,
                style: { width: this.state.activePosition + "%" },
                className: "tp_track-line_active"
              })
            ),
            this.props.showDots ? _react2.default.createElement(
              "div",
              {
                className: "tp_track-points",
                ref: function ref(e) {
                  _this4.pointsLine = e;
                }
              },
              _react2.default.createElement(_dots2.default, {
                key: "markers",
                track: this.state.track,
                type: this.state.options.progressFormat,
                timeFormat: this.props.timeFormat,
                maxDistance: this.state.maxDistance,
                durationTrack: this.state.durationTrack
              })
            ) : null
          )
        ) : null
      );
    }
  }]);

  return LeafletReactTrackPlayer;
}(_reactLeaflet.MapLayer);

LeafletReactTrackPlayer.defaultProps = {
  useControl: true,
  useInformationPanel: false,
  optionMultyIdxFn: function optionMultyIdxFn() {},
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
  callbackFinish: function callbackFinish() {},
  callbackPrev: function callbackPrev() {},
  callbackNext: function callbackNext() {},
  callbackSpeed: function callbackSpeed() {},
  callbackFly: function callbackFly() {},
  callbackCourse: function callbackCourse() {},
  callbackStream: function callbackStream() {}
};

LeafletReactTrackPlayer.propTypes = {
  track: _propTypes2.default.arrayOf(_propTypes2.default.object),
  useControl: _propTypes2.default.bool,
  useInformationPanel: _propTypes2.default.oneOfType([_propTypes2.default.bool, _propTypes2.default.func]),
  optionMultyIdxFn: _propTypes2.default.func,
  optionIdxFn: _propTypes2.default.arrayOf(_propTypes2.default.object),
  customMarker: _propTypes2.default.bool,
  iconCustomMarker: _propTypes2.default.string,
  customCourse: _propTypes2.default.bool,
  timeFormat: _propTypes2.default.string,
  styleMarker: _propTypes2.default.string,
  speedArray: _propTypes2.default.arrayOf(_propTypes2.default.number),
  progressFormat: _propTypes2.default.string,
  callbackFinish: _propTypes2.default.func,
  startPosition: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number]),
  streamData: _propTypes2.default.bool,
  showDots: _propTypes2.default.bool,
  callbackNext: _propTypes2.default.func,
  callbackPrev: _propTypes2.default.func,
  callbackSpeed: _propTypes2.default.func,
  callbackFly: _propTypes2.default.func,
  callbackCourse: _propTypes2.default.func,
  callbackStream: _propTypes2.default.func
};

exports.default = (0, _reactLeaflet.withLeaflet)(LeafletReactTrackPlayer);