"use strict";

var _leaflet = require("leaflet");

var _leaflet2 = _interopRequireDefault(_leaflet);

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

var _index = require("./index");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_leaflet2.default.Polyline.include({
  _snakingTimestamp: 0,
  _snakingVertices: 0,
  _snakingDistance: 0,
  _snaking: false,
  _stopTime: 0,
  _xSpeed: 1,
  _play: true,
  _now: 0,
  _latLngAnimation: null,

  // It initialization polyline with animation
  snakePlayer: function snakePlayer(e) {
    if (e && !this._latLngAnimation) this._latLngAnimation = e;
    for (var i in this._eventParents) {
      if (this._eventParents[i]._options.defaultSpeed) {
        this._defaultSpeed = this._eventParents[i]._options.defaultSpeed;
      }
    }
    if (this._snaking) {
      return;
    }
    if (!this._snakeLatLngs) this._snakeLatLngs = this._latlngs;
    this._snaking = true;
    this._play = true;
    this._snakingTime = 0;
    this._path.style.display = "block";
    this._snakingVertices = this._snakingDistance = 0;
    this._latlngs = [this._snakeLatLngs[0], this._snakeLatLngs[0]];
    this._nextPoint();
    this._snakeRun();
    this.fire("snakestart");
    return this;
  },

  // It initialization polyline with set LatLng and without animation
  initDefaultPosition: function initDefaultPosition(params) {
    var _this = this;

    this._latLngAnimation = params.animate;
    this._snaking = params.last;
    this._play = false;
    this._snakingTime = 0;
    this._snakingVertices = params.points.length !== 1 ? params.points.length - 2 : 0;
    var lastPoints = params.points[params.points.length - 2] ? [params.points[params.points.length - 2], params.points[params.points.length - 1]] : null;
    this._snakingDistance = lastPoints ? lastPoints.reduce(function (result, item, index) {
      if (index > 0) {
        var currPoint = _this._map.latLngToContainerPoint(lastPoints[index - 1]);
        var nextPoint = _this._map.latLngToContainerPoint(item);
        result = result + currPoint.distanceTo(nextPoint);
      }
      return result;
    }, 0) : 0;
    if (this._snakingDistance) {
      this._path.style.display = "block";
    }
    if (params.last) {
      for (var i in this._eventParents) {
        this._eventParents[i]._takeActivePoint(params.points[params.points.length - 1], params.index);
      }
    }
    if (!this._snakeLatLngs) this._snakeLatLngs = this._latlngs;
    if (this._snakeLatLngs.length === params.points.length) {
      this.setLatLngs(this._snakeLatLngs);
      if (!params.last) this._snaking = false;
    } else {
      if (params.points.length !== 1) {
        this.setLatLngs(params.points);
      } else {
        this.fire("snakestart");
        this.setLatLngs([this._snakeLatLngs[0], this._snakeLatLngs[0]]);
      }
    }
  },

  // delete LatLngs, but not remove polyline.
  removePosition: function removePosition() {
    this._play = false;
    this._now = 0;
    this._forward = 0;
    this._snakingTime = 0;
    this._snakingDistance = 0;
    this._snakingVertices = 0;
    this._snaking = false;
    this._path.style.display = "none";
    this.setLatLngs([this._snakeLatLngs[0], this._snakeLatLngs[0]]);
  },

  // stopping animation
  snakeStop: function snakeStop() {
    this._play = false;
    this._stopTime = this._now;
  },

  // starting animation
  snakePlay: function snakePlay() {
    this._snaking = true;
    this._path.style.display = "block";
    this._play = true;
    this._now = this._snakingTime;
    this.startTime();
    this._snakeRun();
  },

  changeSpeed: function changeSpeed(xSpeed) {
    this._xSpeed = xSpeed;
  },

  // counter of time for calculation process animation
  startTime: function startTime() {
    var startTime = Date.now();
    var self = this;
    var flyTime = function flyTime() {
      self._now = Date.now() - startTime + self._stopTime;
      if (self._play) setTimeout(flyTime, 10);
    };
    setTimeout(flyTime, 10);
  },

  // new iteration of animation
  _snakeRun: function _snakeRun() {
    if (!this.maxDistance) {
      this.maxDistance = this._snakeLatLngs[0].distanceTo(this._snakeLatLngs[1]);
    }
    if (this._play) {
      var time = this._timeDistance ? this._timeDistance / this._xSpeed : 1 / this._xSpeed;
      var diff = this._now - this._snakingTime;
      var forward = this.maxDistance ? diff * (this.maxDistance / time) / 1000 : diff * (1 / time) / 1000;
      if (this._defaultSpeed) {
        forward = diff * (this._defaultSpeed * this._xSpeed) / 1000;
      }
      this._snakingTime = this._now;
      this._latlngs.pop();
      this._forward = forward;
      return this._snakeForwardRun(forward);
    }
  },

  _snakeForwardRun: function _snakeForwardRun(forward) {
    if (!this._now) this.startTime();
    if (this._play && this._map) {
      var currPoint = this._map.latLngToContainerPoint(this._snakeLatLngs[this._snakingVertices]);
      var nextPoint = this._map.latLngToContainerPoint(this._snakeLatLngs[this._snakingVertices + 1]);

      this.maxDistance = this._snakeLatLngs[this._snakingVertices].distanceTo(this._snakeLatLngs[this._snakingVertices + 1]);

      // next point from _snakeLatLngs is added into polylile
      if (this._snakingDistance + forward > this.maxDistance) {
        this._snakingVertices++;
        this._latlngs.push(this._snakeLatLngs[this._snakingVertices]);

        // finish animation
        if (this._snakingVertices >= this._snakeLatLngs.length - 1) {
          this._snakingVertices = 0;
          this._latlngs = this._snakeLatLngs;
          return this._snakeEnd();
        }
        this._nextPoint();
        this._snakingDistance -= this.maxDistance;
        return this._snakeForwardRun(forward);
      }
      this._snakingDistance += forward;
      var percent = this.maxDistance ? this._snakingDistance / this.maxDistance : 0;
      var headPoint = nextPoint.multiplyBy(percent).add(currPoint.multiplyBy(1 - percent));
      var headLatLng = this._map.containerPointToLatLng(headPoint);
      this._latlngs.push(headLatLng);
      if (this._latLngAnimation) {
        var i = Object.keys(this._eventParents);
        if (this._eventParents[i[0]]._options.progressFormat === "distance") {
          this._latLngAnimation(headLatLng, {
            n: this._snakingVertices,
            distance: this._snakingDistance + forward
          });
        } else this._latLngAnimation(headLatLng);
      }
      this.setLatLngs(this._latlngs);
      this.fire("snake");
      _leaflet2.default.Util.requestAnimFrame(this._snakeRun, this);
    }
  },

  _nextPoint: function _nextPoint() {
    var i = Object.keys(this._eventParents);
    var countLayer = this._eventParents[i[0]]._snakingLayersDone - 1;
    var point = this._eventParents[i[0]]._detailData[countLayer][this._snakingVertices];
    if (this._eventParents[i[0]]._options.progressFormat === "default" || this._eventParents[i[0]]._options.progressFormat === "distance") {
      var count = this._eventParents[i[0]]._detailData.reduce(function (result, item, index) {
        if (index < countLayer) {
          result = result + item.length - 1;
        }
        return result;
      }, 0);
      count = count + this._snakingVertices;
      this._eventParents[i[0]]._takeActivePoint(point, count);
      this._timeDistance = 10;
    } else {
      this._eventParents[i]._takeActivePoint(point);
      var nextTimeStamp = (0, _moment2.default)(this._eventParents[i[0]]._detailData[countLayer][this._snakingVertices + 1].t, this._eventParents[i[0]]._options.timeFormat);
      var thisTimeStamp = (0, _moment2.default)(this._eventParents[i[0]]._detailData[countLayer][this._snakingVertices].t, this._eventParents[i[0]]._options.timeFormat);
      this._timeDistance = (nextTimeStamp - thisTimeStamp) / 1000;
    }
  },

  _snakeEnd: function _snakeEnd() {
    this._play = false;
    this._snaking = false;
    this.setLatLngs(this._snakeLatLngs);
    for (var i in this._eventParents) {
      this._eventParents[i]._snakeNextPolyline();
    }
  }
});

// group polilines
_leaflet2.default.LayerGroup.include({
  _snakingLayers: [],
  _snakingLayersDone: 0,
  _latLngAnimation: null,
  _takeActivePoint: null,
  _end: null,
  _callbackChangePosition: null,

  snakeStop: function snakeStop() {
    this._snakingLayers.map(function (item) {
      if (item._map) item.snakeStop();
    });
  },

  snakePlay: function snakePlay() {
    var findLast = this._snakingLayers.some(function (itm) {
      return itm._snaking;
    });
    var goPlay = null;
    this._snakingLayers.map(function (item) {
      if (item._map && item._snaking) item.snakePlay();
    });
    if (findLast) {
      if (goPlay) goPlay.snakePlay();
    } else this._snakeNextPolyline();
  },
  // change position. This function stopping work of animation and initiate polylines with default state. Need timestamp
  changePosition: function changePosition(value) {
    var _this2 = this;

    var filterData = {};
    if (this._options.progressFormat === "default") {
      filterData = this._changePositionByDefault(value);
    } else if (this._options.progressFormat === "time") {
      filterData = this._changePositionByTime(value);
    } else if (this._options.progressFormat === "distance") {
      filterData = this._changePositionByDistance(value);
    }
    filterData.data.map(function (item, index) {
      if (item.length && !_this2._snakingLayers[index]._map) _this2.addLayer(_this2._snakingLayers[index]);
      if (item.length) {
        _this2._snakingLayers[index].initDefaultPosition({
          animate: _this2._latLngAnimation,
          last: index === filterData.last,
          points: item,
          index: value
        });
      }
      if (!item.length && _this2._snakingLayers[index]._map) _this2._snakingLayers[index].removePosition();
    });
    this._snakingLayersDone = filterData.last + 1;
    var last = filterData.data[filterData.last];
    this._callbackChangePosition(last[last.length - 1], value);
    this._end(false);
  },

  _changePositionByDefault: function _changePositionByDefault(value) {
    return this._detailData.reduce(function (result, item, index) {
      if (result.count > item.length) {
        result.data.push(item);
        result.count = result.count - item.length;
      } else {
        if (result.count > 0 && result.count <= item.length) {
          var d = item.filter(function (itm, ind) {
            return ind <= result.count;
          });
          result.data.push(d);
          result.last = index;
          result.count = result.count - d.length;
        } else {
          result.data.push([]);
        }
      }
      return result;
    }, { data: [], last: 0, count: value });
  },

  _changePositionByTime: function _changePositionByTime(value) {
    return this._detailData.reduce(function (result, item, index) {
      var filterData = item.filter(function (itm) {
        return Number(itm.t) <= Number(value);
      });
      if (filterData.length >= 1) {
        result.last = index;
      }
      result.data.push(filterData);
      return result;
    }, { data: [], last: 0 });
  },

  _changePositionByDistance: function _changePositionByDistance(value) {
    var _this3 = this;

    return this._detailDistance.reduce(function (result, item, index) {
      if (result.count > item) {
        result.data.push(_this3._detailData[index]);
        result.count = result.count - item;
      } else {
        if (result.count > 0 && result.count <= item) {
          var prevDistance = 0;
          var d = _this3._detailData[index].filter(function (itm, ind) {
            if (_this3._detailData[index][ind + 1]) {
              var dist = _leaflet2.default.latLng(itm).distanceTo(_this3._detailData[index][ind + 1]);
              prevDistance = prevDistance + dist;
              if (prevDistance < result.count) {
                return itm;
              }
            }
          });
          result.data.push(d);
          result.last = index;
          result.count = result.count - prevDistance;
        } else {
          result.data.push([]);
        }
      }
      return result;
    }, { data: [], last: 0, count: value });
  },

  // Is is progress for mode progressFormat === "distance"
  _procentProgress: function _procentProgress(e, point, progress) {
    var _this4 = this;

    if (progress) {
      var prevRangeColors = 0;
      var activePolylineRange = 0;
      if (this._snakingLayersDone > 1) {
        prevRangeColors = this._detailDistance.reduce(function (result, range, index) {
          if (index < _this4._snakingLayersDone - 1) result = result + range;
          return result;
        }, 0);
      }
      if (progress.n > 0) {
        var line = this._detailData[this._snakingLayersDone - 1];
        activePolylineRange = line.reduce(function (result, point, index) {
          if (index > 0 && index < progress.n + 1) {
            result = result + _leaflet2.default.latLng(line[index - 1]).distanceTo(point);
          }
          return result;
        }, 0);
      }
      var result = {
        point: point,
        distance: prevRangeColors + activePolylineRange + progress.distance
      };
      return e(result);
    }
  },

  changeSpeed: function changeSpeed(xSpeed) {
    this._snakingLayers.map(function (item) {
      item.changeSpeed(xSpeed);
    });
  },

  snakePlayer: function snakePlayer(events) {
    if (!this._callbackChangePosition && events.change) this._callbackChangePosition = events.change;
    if (!this._latLngAnimation && events.fly) {
      var self = this;
      this._latLngAnimation = function (point, progress) {
        if (self._options.progressFormat === "distance") {
          self._procentProgress(events.fly, point, progress);
        } else events.fly(point);
      };
    }
    if (!this._takeActivePoint && events.nextPoint) this._takeActivePoint = events.nextPoint;
    if (!this._end && events.finish) this._end = events.finish;
    this._snaking = true;
    this._snakingLayers = [];
    this._snakingLayersDone = 0;
    var keys = Object.keys(this._layers);
    for (var i in keys) {
      this._snakingLayers.push(this._layers[keys[i]]);
    }
    this.clearLayers();
    this._detailDistance = this._detailData.map(function (polyline) {
      return (0, _index.getDistance)(polyline);
    });
    if (this._options.startPosition) {
      this._initiateStartPosition();
    } else {
      return this._snakeNextPolyline();
    }
  },

  _initiateStartPosition: function _initiateStartPosition() {
    if (this._options.startPosition === "full") {
      if (this._options.progressFormat === "default") {
        this.changePosition(this._originalLatlngs.length);
      } else if (this._options.progressFormat === "distance") {
        var max = this._detailDistance.reduce(function (result, item) {
          result = result + item;
          return result;
        }, 0);
        this.changePosition(max + 1);
      } else if (this._options.progressFormat === "time") {
        this.changePosition(this._originalLatlngs[this._originalLatlngs.length - 1].t + 1);
      }
      this._snaking = false;
      this._end(true);
    } else {
      this.changePosition(this._options.startPosition);
      this.snakePlay();
    }
  },

  _snakeNextPolyline: function _snakeNextPolyline() {
    if (!this._snaking && this._snakingLayersDone < this._snakingLayers.length) {
      this._snaking = true;
    }
    if (this._snakingLayersDone >= this._snakingLayers.length) {
      this._end(true);
      this._snaking = false;
      return;
    }
    var currentLayer = this._snakingLayers[this._snakingLayersDone];
    this._snakingLayersDone++;
    if (!this.hasLayer(currentLayer)) {
      this.addLayer(currentLayer);
      currentLayer.snakePlayer(this._latLngAnimation);
    } else currentLayer.snakePlay();
  },

  addPolyline: function addPolyline(layers, detail) {
    var _this5 = this;

    var prevRange = this._snakingLayers.length;
    layers.map(function (item, index) {
      _this5.addLayer(item);
      _this5._detailData.push(detail[index]);
      _this5._detailDistance.push((0, _index.getDistance)(detail[index]));
      _this5._snakingLayers.push(item);
      _this5._snakingLayers[prevRange + index].initDefaultPosition({
        animate: _this5._latLngAnimation,
        points: item
      });
      _this5._snakingLayers[prevRange + index].removePosition();
    });
    if (!this._snaking) {
      this.snakePlay();
    }
  }
});