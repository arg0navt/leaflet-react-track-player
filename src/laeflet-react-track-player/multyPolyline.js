import L from "leaflet";

const MultiColorsPolyline = L.FeatureGroup.extend({

    initialize: function (latlngs, options) {
        var copyBaseOptions = options.multiOptions.copyBaseOptions;

        this._layers = {};
        this._options = options;
        if (copyBaseOptions === undefined || copyBaseOptions) {
            this._copyBaseOptions();
        }

        this.setLatLngs(latlngs);
    },

    _copyBaseOptions: function () {
        var multiOptions = this._options.multiOptions,
            baseOptions,
            optionsArray = multiOptions.options,
            i, len = optionsArray.length;

        baseOptions = L.extend({}, this._options);
        delete baseOptions.multiOptions;

        for (i = 0; i < len; ++i) {
            optionsArray[i] = L.extend({}, baseOptions, optionsArray[i]);
        }
    },

    setLatLngs: function (latlngs) {
        var i, len = latlngs.length,
            multiOptions = this._options.multiOptions,
            optionIdxFn = multiOptions.optionIdxFn,
            fnContext = multiOptions.fnContext || this,
            prevOptionIdx, optionIdx,
            segmentLatlngs;

        this._originalLatlngs = latlngs;
        this._detailData = [];

        this.eachLayer(function (layer) {
            this.removeLayer(layer);
        }, this);

        for (i = 1; i < len; ++i) {
            optionIdx = optionIdxFn.call(
                fnContext, latlngs[i], latlngs[i - 1], i, latlngs);

            if (i === 1) {
                segmentLatlngs = [latlngs[0]];
                prevOptionIdx = optionIdxFn.call(fnContext, latlngs[0], latlngs[0], 0, latlngs);
            }

            segmentLatlngs.push(latlngs[i]);
            if (prevOptionIdx !== optionIdx || i === len - 1) {
                if (typeof multiOptions.options === "function") {
                    this.addLayer(L.polyline(segmentLatlngs, multiOptions.options(prevOptionIdx)));
                } else {
                    this.addLayer(L.polyline(segmentLatlngs, multiOptions.options[prevOptionIdx]));
                }
                this._detailData.push(segmentLatlngs);
                prevOptionIdx = optionIdx;
                segmentLatlngs = [latlngs[i]];
            }
        }

        return this;
    },

    getLatLngs: function () {
        return this._originalLatlngs;
    },

    getLatLngsSegments: function () {
        var latlngs = [];

        this.eachLayer(function (layer) {
            latlngs.push(layer.getLatLngs());
        });

        return latlngs;
    }
});

L.MultiColorsPolyline = MultiColorsPolyline;

L.multiColorsPolyline = function (latlngs, options) {
    return new MultiColorsPolyline(latlngs, options);
};
