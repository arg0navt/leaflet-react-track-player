"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _leaflet = require("leaflet");

var _leaflet2 = _interopRequireDefault(_leaflet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Dots = function (_React$PureComponent) {
  _inherits(Dots, _React$PureComponent);

  function Dots() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, Dots);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Dots.__proto__ || Object.getPrototypeOf(Dots)).call.apply(_ref, [this].concat(args))), _this), _this.procentDefault = function (index) {
      return index / (_this.props.track.length / 100);
    }, _this.procentTime = function (item) {
      var itemDuration = (0, _moment2.default)(item.t, _this.props.timeFormat) - (0, _moment2.default)(_this.props.track[0].t, _this.props.timeFormat);
      return itemDuration / (_this.props.durationTrack / 100);
    }, _this.procentDistance = function (prevProcent, item, index) {
      var point = _leaflet2.default.latLng(item);
      if (_this.props.track[index + 1]) {
        var thisDistance = point.distanceTo(_this.props.track[index + 1]);
        prevProcent.val = prevProcent.val + thisDistance;
        return prevProcent.val / _this.props.maxDistance * 100;
      }
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Dots, [{
    key: "render",
    value: function render() {
      var _this2 = this;

      var prevProcent = { val: 0 };
      return this.props.track.map(function (item, index) {
        return _react2.default.createElement("div", {
          key: index,
          className: "tp_track-points_item",
          style: {
            left: (_this2.props.type === "default" ? _this2.procentDefault(index) : _this2.props.type === "time" ? _this2.procentTime(item) : _this2.props.type === "distance" ? _this2.procentDistance(prevProcent, item, index) : 0) + "%"
          }
        });
      });
    }
  }]);

  return Dots;
}(_react2.default.PureComponent);

exports.default = Dots;


Dots.propTypes = {
  track: _propTypes2.default.arrayOf(_propTypes2.default.object),
  type: _propTypes2.default.string,
  timeFormat: _propTypes2.default.string,
  maxDistance: _propTypes2.default.number,
  durationTrack: _propTypes2.default.number
};