//CoffeeScript generated from main/hand-hold/leap.hand-hold.coffee
(function() {
  var handHold;

  handHold = function() {
    var dataFn, interFrameData;
    interFrameData = {};
    dataFn = function(prefix, hashOrKey, value) {
      var dict, key, name, results;
      interFrameData[name = prefix + this.id] || (interFrameData[name] = []);
      dict = interFrameData[prefix + this.id];
      if (value !== void 0) {
        return dict[hashOrKey] = value;
      } else if ({}.toString.call(hashOrKey) === '[object String]') {
        return dict[hashOrKey];
      } else {
        results = [];
        for (key in hashOrKey) {
          value = hashOrKey[key];
          if (value === void 0) {
            results.push(delete dict[key]);
          } else {
            results.push(dict[key] = value);
          }
        }
        return results;
      }
    };
    return {
      hand: {
        data: function(hashOrKey, value) {
          return dataFn.call(this, 'h', hashOrKey, value);
        },
        hold: function(object) {
          if (object) {
            return this.data({
              holding: object
            });
          } else {
            return this.hold(this.hovering());
          }
        },
        holding: function() {
          return this.data('holding');
        },
        release: function() {
          var release;
          release = this.data('holding');
          this.data({
            holding: void 0
          });
          return release;
        },
        hoverFn: function(getHover) {
          return this.data({
            getHover: getHover
          });
        },
        hovering: function() {
          var getHover;
          if (getHover = this.data('getHover')) {
            return this._hovering || (this._hovering = getHover.call(this));
          }
        }
      },
      pointable: {
        data: function(hashOrKey, value) {
          return dataFn.call(this, 'p', hashOrKey, value);
        }
      }
    };
  };

  if ((typeof Leap !== 'undefined') && Leap.Controller) {
    Leap.Controller.plugin('handHold', handHold);
  } else if (typeof module !== 'undefined') {
    module.exports.handHold = handHold;
  } else {
    throw 'leap.js not included';
  }

}).call(this);
