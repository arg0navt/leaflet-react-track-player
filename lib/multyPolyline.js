"use strict";

var _leaflet = require("leaflet");

var _leaflet2 = _interopRequireDefault(_leaflet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MultiColorsPolyline = _leaflet2.default.FeatureGroup.extend({

    initialize: function initialize(latlngs, options) {
        var copyBaseOptions = options.multiOptions.copyBaseOptions;

        this._layers = {};
        this._options = options;
        if (copyBaseOptions === undefined || copyBaseOptions) {
            this._copyBaseOptions();
        }

        this.setLatLngs(latlngs);
    },

    _copyBaseOptions: function _copyBaseOptions() {
        var multiOptions = this._options.multiOptions,
            baseOptions,
            optionsArray = multiOptions.options,
            i,
            len = optionsArray.length;

        baseOptions = _leaflet2.default.extend({}, this._options);
        delete baseOptions.multiOptions;

        for (i = 0; i < len; ++i) {
            optionsArray[i] = _leaflet2.default.extend({}, baseOptions, optionsArray[i]);
        }
    },

    setLatLngs: function setLatLngs(latlngs) {
        var i,
            len = latlngs.length,
            multiOptions = this._options.multiOptions,
            optionIdxFn = multiOptions.optionIdxFn,
            fnContext = multiOptions.fnContext || this,
            prevOptionIdx,
            optionIdx,
            segmentLatlngs;

        this._originalLatlngs = latlngs;
        this._detailData = [];

        this.eachLayer(function (layer) {
            this.removeLayer(layer);
        }, this);

        for (i = 1; i < len; ++i) {
            optionIdx = optionIdxFn.call(fnContext, latlngs[i], latlngs[i - 1], i, latlngs);

            if (i === 1) {
                segmentLatlngs = [latlngs[0]];
                prevOptionIdx = optionIdxFn.call(fnContext, latlngs[0], latlngs[0], 0, latlngs);
            }

            segmentLatlngs.push(latlngs[i]);
            if (prevOptionIdx !== optionIdx || i === len - 1) {
                if (typeof multiOptions.options === "function") {
                    this.addLayer(_leaflet2.default.polyline(segmentLatlngs, multiOptions.options(prevOptionIdx)));
                } else {
                    this.addLayer(_leaflet2.default.polyline(segmentLatlngs, multiOptions.options[prevOptionIdx]));
                }
                this._detailData.push(segmentLatlngs);
                prevOptionIdx = optionIdx;
                segmentLatlngs = [latlngs[i]];
            }
        }

        return this;
    },

    getLatLngs: function getLatLngs() {
        return this._originalLatlngs;
    },

    getLatLngsSegments: function getLatLngsSegments() {
        var latlngs = [];

        this.eachLayer(function (layer) {
            latlngs.push(layer.getLatLngs());
        });

        return latlngs;
    }
});

_leaflet2.default.MultiColorsPolyline = MultiColorsPolyline;

_leaflet2.default.multiColorsPolyline = function (latlngs, options) {
    return new MultiColorsPolyline(latlngs, options);
};