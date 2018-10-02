"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

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
          activePosition: index / _this.state.track.length * 100
        });
      } else if (_this.state.options.progressFormat === "time") {
        var thisDistance = (0, _moment2.default)(point.t, _this.props.timeFormat) - (0, _moment2.default)(_this.state.track[0].t, _this.props.timeFormat);
        _this.setState({
          activeTimeStamp: point.t,
          activePosition: thisDistance / (_this.state.durationTrack / 100)
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

    _this.changeActivePosition = function (e) {
      var coordinates = e.target.getBoundingClientRect();
      var activeX = e.pageX;
      var activePosition = (activeX - coordinates.left) / (_this.line.clientWidth / 100);
      _this.changePositionByType(activePosition);
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

    _this.state = {
      activePosition: 100,
      track: props.track,
      active: true,
      activeTimeOrIndex: props.progressFormat === "time" ? props.track[0].t : 0,
      durationTrack: props.progressFormat === "time" ? (0, _moment2.default)(props.track[_this.props.track.length - 1].t, props.timeFormat) - (0, _moment2.default)(props.track[0].t, props.timeFormat) : 0,
      speed: props.speedArray[0],
      maxDistance: props.track.reduce(function (result, item, index) {
        var point = _leaflet2.default.latLng(item);
        if (props.track[index + 1]) {
          result = result + point.distanceTo(props.track[index + 1]);
        }
        return result;
      }, 0),
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
          html: "<div class=\"custom-marker-player" + (!_this2.props.customMarker ? " default" : "") + "\" style=\"background: url('" + (_this2.props.customMarker ? _this2.props.markerIcon : "https://unpkg.com/leaflet@1.3.4/dist/images/marker-icon-2x.png") + "') no-repeat center; height: 100%; transform: rotate(" + (_this2.props.customMarker && _this2.props.changeCourseCustomMarker ? rotate : 0) + "deg)" + _this2.props.styleMarker + "\"></div>",
          iconSize: [35, 35]
        });
      };
      var finishMarker = _leaflet2.default.marker(this.props.track[0], {
        icon: this.createIcon(this.props.track[0].course)
      });
      this.props.leaflet.map.addLayer(finishMarker);

      // polyline
      var snakePolyline = _leaflet2.default.multiOptionsPolyline(this.props.track, {
        multiOptions: {
          optionIdxFn: this.props.optionMultyIdxFn ? this.props.optionMultyIdxFn : function () {},
          options: this.props.optionsMulty ? this.props.optionsMulty : []
        },
        timeFormat: this.props.timeFormat,
        progressFormat: this.props.progressFormat
      });
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
      return this.state.init !== nextState.init || this.state.activePosition !== nextProps.activePosition;
    }
  }, {
    key: "render",
    value: function render() {
      var _this3 = this;

      return _react2.default.createElement(
        _reactLeafletControl2.default,
        { position: "bottomleft" },
        _react2.default.createElement(
          "div",
          { className: "leaflet-control leaflet-react-track-player" },
          _react2.default.createElement(
            "div",
            { className: "tp-buttons" },
            _react2.default.createElement("button", {
              className: "tp_button prev",
              onClick: function onClick() {
                return _this3.prevStep();
              }
            }),
            _react2.default.createElement("button", {
              className: "tp_button " + (this.state.active ? "pause" : "play"),
              onClick: function onClick() {
                return _this3.tooglePlay();
              }
            }),
            _react2.default.createElement("button", { className: "tp_button stop", onClick: function onClick() {
                return _this3.stop();
              } }),
            _react2.default.createElement("button", {
              className: "tp_button next",
              onClick: function onClick() {
                return _this3.nextStep();
              }
            }),
            _react2.default.createElement("button", {
              className: "tp_button speed",
              onClick: function onClick() {
                return _this3.setState({
                  openSpeedControl: !_this3.state.openSpeedControl
                });
              }
            }),
            this.state.openSpeedControl ? _react2.default.createElement(
              "div",
              { className: "tp-speed" },
              this.props.speedArray.map(function (item) {
                return _react2.default.createElement(
                  "button",
                  {
                    key: item,
                    className: "tp-speed-item" + (_this3.state.speed === item ? " active" : ""),
                    onClick: function onClick() {
                      return _this3.changeSpeed(item);
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
                  _this3.line = line;
                },
                onClick: function onClick(e) {
                  return _this3.changeActivePosition(e);
                }
              },
              _react2.default.createElement("div", {
                key: this.state.activePosition,
                style: { width: this.state.activePosition + "%" },
                className: "tp_track-line_active"
              })
            ),
            _react2.default.createElement(
              "div",
              {
                className: "tp_track-points",
                ref: function ref(e) {
                  _this3.pointsLine = e;
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
            )
          )
        )
      );
    }
  }]);

  return LeafletReactTrackPlayer;
}(_reactLeaflet.MapLayer);

LeafletReactTrackPlayer.defaultProps = {
  track: [],
  optionMultyIdxFn: function optionMultyIdxFn() {},
  optionsMulty: [],
  customMarker: false,
  iconCustomMarker: "",
  changeCourseCustomMarker: false,
  timeFormat: "YYMMDDHHmmss000",
  styleMarker: "",
  speedArray: [1, 10, 50, 100, 1000],
  progressFormat: "default",
  callbackFinish: function callbackFinish() {},
  callbackPrev: function callbackPrev() {},
  callbackNext: function callbackNext() {},
  callbackSpeed: function callbackSpeed() {},
  callbackFly: function callbackFly() {}
};

LeafletReactTrackPlayer.propTypes = {
  track: _propTypes2.default.arrayOf(_propTypes2.default.object),
  optionMultyIdxFn: _propTypes2.default.func,
  optionIdxFn: _propTypes2.default.arrayOf(_propTypes2.default.object),
  customMarker: _propTypes2.default.bool,
  iconCustomMarker: _propTypes2.default.string,
  changeCourseCustomMarker: _propTypes2.default.bool,
  timeFormat: _propTypes2.default.string,
  styleMarker: _propTypes2.default.string,
  speedArray: _propTypes2.default.arrayOf(_propTypes2.default.number),
  progressFormat: _propTypes2.default.string,
  callbackFinish: _propTypes2.default.func,
  callbackNext: _propTypes2.default.func,
  callbackPrev: _propTypes2.default.func,
  callbackSpeed: _propTypes2.default.func,
  callbackFly: _propTypes2.default.func
};

exports.default = (0, _reactLeaflet.withLeaflet)(LeafletReactTrackPlayer);