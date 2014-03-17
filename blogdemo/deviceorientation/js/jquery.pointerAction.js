(function($) {
  var methods = {
    init: function(options) {
      return this.each(function() {
        var $that = $(this);
        var that = {};
        var defaults = {
          isTouch:'ontouchstart' in window || window.navigator.msMaxTouchPoints > 0,
          backNode:'body',
          offsetNode:'',
          onStart:function(){},
          onMove:function(){},
          onEnd:function(){}
        };

        that.options = jQuery.extend(defaults,options);

        that.uid = Math.ceil(Math.random()*10000000) + new Date().getTime();
        $that.attr('data-uid',that.uid);
        that.pos = false;
        that.lastPos = {};
        that.options.backNode = $(that.options.backNode);
        that.ev = {
          start: that.options.isTouch?'touchstart':'mousedown',
          move:  that.options.isTouch?'touchmove':'mousemove',
          end:   that.options.isTouch?'touchend touchcancel':'mouseup mouseleave'
        };

        that.touchToXY = function(e){
          if(e.customX && e.customY) return {x:e.customX,y:e.customY};
          var out = {x:0, y:0};
          if(e.type == 'touchstart' || e.type == 'touchmove' || e.type == 'touchend' || e.type == 'touchcancel'){
            var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
            out.x = touch.pageX  - that.offset.left;
            out.y = touch.pageY - that.offset.top;
          } else if (e.type == 'mousedown' || e.type == 'mouseup' || e.type == 'mousemove' || e.type == 'mouseover'|| e.type=='mouseout' || e.type=='mouseenter' || e.type=='mouseleave') {
            out.x = e.pageX - that.offset.left ;
            out.y = e.pageY - that.offset.top;
          }
          return out;
        };

        that.deactivateAllFrames = function(bool){
          $('iframe').map(function(i,v){
            $(v).css({
              'pointer-events':(bool?'none':'all')
            });
          });
        };

        that.onActionStart = function(e){
          that.refresh();
          that.deactivateAllFrames(true);
          e.stopPropagation();
          that.options.backNode.on(that.ev.move, that.onActionMove);
          that.options.backNode.on(that.ev.end, that.onActionEnd);
          var pos = that.touchToXY(e);
          that.lastPos =  {
            x: pos.x,
            y: pos.y
          };
          that.options.onStart(pos,e);
        };

        that.onActionMove = function(e){
//          console.log('move',e);
          var pos = that.touchToXY(e);
          pos.delta = {
            x: that.lastPos.x - pos.x,
            y: that.lastPos.y - pos.y
          };
          that.options.onMove(pos,e);
          //console.log(pos.delta);
          that.lastPos.x =  pos.x;
          that.lastPos.y =  pos.y;
        };

        that.onActionEnd = function(e){
          that.deactivateAllFrames(false);
          that.pos = false;
          var pos = that.touchToXY(e);
          that.options.backNode.off(that.ev.move, that.onActionMove);
          that.options.backNode.off(that.ev.end, that.onActionEnd);
          that.options.onEnd(pos,e);
          that.lastPos.x =  false;
          that.lastPos.y =  false;
        };

        that.refresh = function(){
          that.offset = that.options.offsetNode?$(that.options.offsetNode).offset():$that.offset();
          that.options.backNode
          .off(that.ev.start, '[data-uid='+that.uid+']', that.onActionStart)
          .on(that.ev.start,  '[data-uid='+that.uid+']', that.onActionStart);
        };

        // TODO: HAckY
        $('article').on('scroll',function() {
          that.refresh();
        });


        that.refresh();
        return this;
      });
    },

    set: function(val){
      this.each(function() {
        this.setData(val);
      });
      return this;
    }
  };

  $.fn.pointerAction = function(method) {
    if (methods[method]) {
      methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method ' + method + ' does not exist on $.pointerAction');
    }
    return this;
  };
})(window.jQuery);

