//CoffeeScript generated from main/hand-entry/leap.hand-entry.coffee

/*
Emits controller events when a hand enters of leaves the frame
"handLost" and "handFound"
Each event also includes the hand object, which will be invalid for the handLost event.
 */

(function() {
  var handEntry;

  handEntry = function() {
    var activeHandIds;
    activeHandIds = [];
    if (Leap.version.major === 0 && Leap.version.minor < 5) {
      console.warn("The hand entry plugin requires LeapJS 0.5.0 or newer.");
    }
    this.on("deviceStopped", function() {
      for (var i = 0, len = activeHandIds.length; i < len; i++){
      id = activeHandIds[i];
      activeHandIds.splice(i, 1);
      // this gets executed before the current frame is added to the history.
      this.emit('handLost', this.lastConnectionFrame.hand(id))
      i--;
      len--;
    };
    });
    return {
      frame: function(frame) {
        var i, id, len, newValidHandIds, results;
        newValidHandIds = frame.hands.map(function(hand) {
          return hand.id;
        });
        for (var i = 0, len = activeHandIds.length; i < len; i++){
        id = activeHandIds[i];
        if(  newValidHandIds.indexOf(id) == -1){
          activeHandIds.splice(i, 1);
          // this gets executed before the current frame is added to the history.
          this.emit('handLost', this.frame(1).hand(id));
          i--;
          len--;
        }
      };
        results = [];
        for (i = 0, len = newValidHandIds.length; i < len; i++) {
          id = newValidHandIds[i];
          if (activeHandIds.indexOf(id) === -1) {
            activeHandIds.push(id);
            results.push(this.emit('handFound', frame.hand(id)));
          } else {
            results.push(void 0);
          }
        }
        return results;
      }
    };
  };

  if ((typeof Leap !== 'undefined') && Leap.Controller) {
    Leap.Controller.plugin('handEntry', handEntry);
  } else if (typeof module !== 'undefined') {
    module.exports.handEntry = handEntry;
  } else {
    throw 'leap.js not included';
  }

}).call(this);
