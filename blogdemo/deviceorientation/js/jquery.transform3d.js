(function($) {
  var methods = {
    init: function(options) {
      return this.each(function() {
        var $that = $(this);
        var that = {};
        this.transform3d = that;
        var defaults = {
          back:'body',
          onChange:function(){}
        };

        that.options = jQuery.extend(defaults,options);
        that.startPos = false;
        that.view = {};

        $that.addClass('r3d-container');
        that.view.tWrapper = $('<div>',{'class':'r3d-target-wrapper'}).appendTo($that);
        that.view.target = $('<div>',{'class':'r3d-target'}).appendTo(that.view.tWrapper);
        that.view.boxWrapper = $('<div>',{'class':'r3d-box-wrapper'}).appendTo(that.view.target);
        that.view.box    = $('<div>',{'class':'r3d-box'}).html('FRONT').appendTo(that.view.boxWrapper);
        that.view.back   = $(that.options.back);



        that.genetateInputTransform = function(){
          that.iTransform = {};
          $.each(that.oTransform, function(i,v){
            that.iTransform[i] = {};
            $.each(v, function(ii,vv){
              that.iTransform[i][ii] = fns.enjoyValueToArray(vv);
              // if((vv+'').indexOf('_')!==-1){
              //   that.iTransform[i][ii][0] = vv.split('_')[0]*1;
              //   that.iTransform[i][ii][1] = vv.split('_')[1];
              // } else {
              //   that.iTransform[i][ii][0] = vv*1;
              //   that.iTransform[i][ii][1] = false;
              // }

              var obj = that.iTransform[i][ii];
              if(i != 'perspective-origin'){
                if(obj[1] == '%'){
                  obj[0]= (obj[0]/100)*that.tWidth;
                }

                if(obj[1] == 'deg'){
                  obj[0]= obj[0]*(Math.PI/180);
                }
              }

            });
          });
        };

        that.roundValue = function(v){
          return Math.round(v*100)/100;
        }

        that.genetateOutputTransform = function(){

          var m = mat4.create();

          $.each(that.iTransform, function(i,v){
            that.oTransform[i].vector = [0,0,0];
            $.each(v, function(ii,vv){
              if(ii == 'vector') return;
              var value = vv[0];
              var unit = vv[1];

              if(i == 'translate' || i=="scale" || i=="rotate"){
                switch(ii){
                  case 'x': that.oTransform[i].vector[0] = that.roundValue(vv[0]*1); break;
                  case 'y': that.oTransform[i].vector[1] = that.roundValue(vv[0]*1); break;
                  case 'z': that.oTransform[i].vector[2] = that.roundValue(vv[0]*1); break;
                }
              }

              var obj = that.iTransform[i][ii];

              if(unit == '%'){
                value= (value/that.tWidth)*100;
              }

              if(unit == 'deg'){
                value= value*(180/Math.PI);
              }

              that.oTransform[i][ii] = value+(unit?'_'+unit:'');



              if(i == 'rotate'){
                vv[0] = that.roundValue(vv[0]);
                mat4['rotate'+ii.toUpperCase()](m, m, vv[0]);
              }



            });

            if(i == 'translate'){
              //console.log(i,that.oTransform[i].vector)
              mat4.translate(m, m, that.oTransform[i].vector);
            } else if(i == 'scale'){
              //console.log(i,that.oTransform[i].vector)
              mat4.scale(m, m, that.oTransform[i].vector);
            }
          });



          var mout = [];


          //mat4.identity()




        };

        that.view.axesBox = $('<div>',{'class':'r3d-axesbox'}).appendTo(that.view.target);
        that.view.axes = {
          x: $('<div>',{'class':'r3d-axes r3d-axes-x'}).appendTo(that.view.axesBox),
          y: $('<div>',{'class':'r3d-axes r3d-axes-y'}).appendTo(that.view.axesBox),
          z: $('<div>',{'class':'r3d-axes r3d-axes-z'}).appendTo(that.view.axesBox)
        };

        that.view.arrows = {
          x1: $('<div>',{'class':'r3d-arrow r3d-arrow1 r3d-arrow-x1'}).html('<span>X</span>').appendTo(that.view.axes.x),
          x2: $('<div>',{'class':'r3d-arrow r3d-arrow2 r3d-arrow-x2'}).appendTo(that.view.axes.x),
          y1: $('<div>',{'class':'r3d-arrow r3d-arrow1 r3d-arrow-y1'}).html('<span>Y</span>').appendTo(that.view.axes.y),
          y2: $('<div>',{'class':'r3d-arrow r3d-arrow2 r3d-arrow-y2'}).appendTo(that.view.axes.y),
          z1: $('<div>',{'class':'r3d-arrow r3d-arrow1 r3d-arrow-z1'}).html('<span>Z</span>').appendTo(that.view.axes.z),
          z2: $('<div>',{'class':'r3d-arrow r3d-arrow2 r3d-arrow-z2'}).appendTo(that.view.axes.z)
        };

        that.view.rotateZhandler = $('<div>',{'class':'r3d-rotatezhandler icon_revers'}).appendTo(that.view.target);

        that.updateSizeData = function(){
          that.width = $that.width();
          that.height = $that.height();
          that.tWidth = that.view.target.width();
          that.tHeight = that.view.target.height();
        };

        that.onZRotationStart = function(pos,e){
          that.updateSizeData();
          e.stopPropagation();
        };

        that.onZRotationMove = function(pos,e){

          var origin = {
            x: that.width/2  - that.tWidth/2  + that.iTransform.origin.x[0],
            y: that.height/2 - that.tHeight/2 + that.iTransform.origin.y[0]
          };

          var dx = pos.x - origin.x;
          var dy = pos.y - origin.y;

          var ll = Math.sqrt(dx*dx + dy*dy);
          if(ll === 0) {return false;}
          var ang = -Math.acos(dx/ll) * 180 / Math.PI;
          if(dy>0) ang = 360 -ang;
          ang+=45;

          ang = ang*(Math.PI/180);

          that.iTransform.rotate.z[0]  = that.roundValue(ang);
          that.updateView();
          that.manualChange();
        };

        that.onZRotationEnd = function(pos,e){

        };

        that.onXYRotationStart = function(pos,e){
          that.updateSizeData();

        };

        that.onXYRotationMove = function(pos,e){
          var ax =  - ((pos.delta.x)/100);
          var ay =    ((pos.delta.y)/100);
          that.iTransform.rotate.x[0] = that.iTransform.rotate.x[0]*1 + that.roundValue(ay)*1;
          that.iTransform.rotate.y[0] = that.iTransform.rotate.y[0]*1 + that.roundValue(ax)*1;
          that.updateView();
          that.manualChange();
        };

        that.onXYRotationEnd = function(pos,e){
          //that.startPos = pos;
        };

        that.calcOffset = function(arr, pos){

          var offset = 0;
          var i = 1;
          if(pos == 'absolute'){
            i = 0;
          }
          for(; i < arr.length; i++){
            offset += (arr[i] == 'auto')?0:parseInt(arr[i]);
          }
          return offset;
        }

        that.updateView = function(){

          var to = that.iTransform.origin.x[0] + 'px ' + that.iTransform.origin.y[0] + 'px ' + that.iTransform.origin.z[0]+'px';

          var accuracy = 100;
          var rotate_x = Math.round(that.iTransform.rotate.x[0]*accuracy)/accuracy;
          var rotate_y = Math.round(that.iTransform.rotate.y[0]*accuracy)/accuracy;
          var rotate_z = Math.round(that.iTransform.rotate.z[0]*accuracy)/accuracy;
          var t1 = 'rotateX( ' + rotate_x + 'rad) rotateY( ' + rotate_y + 'rad) rotateZ( ' + rotate_z + 'rad)';

          that.view.target[0].style.webkitTransform = t1;
          that.view.target[0].style.MozTransform    = t1;
          that.view.target[0].style.transform       = t1;

          that.view.target[0].style.webkitTransformOrigin = to;
          that.view.target[0].style.MozTransformOrigin    = to;
          that.view.target[0].style.transformOrigin       = to;

           var t2 = 'scaleX(' + that.iTransform.scale.x[0] + ') scaleY(' + that.iTransform.scale.y[0] + ') ' +
                    'translateX(' + that.iTransform.translate.x[0] + 'px) translateY(' + that.iTransform.translate.y[0] + 'px) translateZ(' + that.iTransform.translate.z[0] + 'px) '+
                    'skewX(' + that.iTransform.skew.x[0] + 'rad) skewY(' + that.iTransform.skew.y[0] + 'rad) ';

          that.view.box[0].style.webkitTransform = t2;
          that.view.box[0].style.MozTransform    = t2;
          that.view.box[0].style.transform       = t2;

          that.view.box[0].style.webkitTransformOrigin = to;
          that.view.box[0].style.MozTransformOrigin    = to;
          that.view.box[0].style.transformOrigin       = to;

          var t5 = 'translateX(' + that.iTransform.origin.x[0] + 'px) translateY(' + that.iTransform.origin.y[0] + 'px) translateZ(' + that.iTransform.origin.z[0] + 'px)';
          that.view.axesBox[0].style.webkitTransform = t5;
          that.view.axesBox[0].style.MozTransform    = t5;
          that.view.axesBox[0].style.oTransform      = t5;

          var p = that.iTransform.perspective.z[0];
          var poObject = that.iTransform['perspective-origin'];


          var poX0 = poObject.x[0];
          var poX1 = poObject.x[1];
          var poY0 = poObject.y[0];
          var poY1 = poObject.y[1];

          //var previewFrame = cssg.previewFrames[0];
          //var element = previewFrame.$element;
          // var previewWidth = element.width();
          // var previewHeight = element.height();
          // var button = previewFrame.$button;
          // var btn_comp_style = window.getComputedStyle(button.get(0),null);
          // window.buttonWW = button;
          // var top_offsets = [
          //   btn_comp_style.getPropertyValue("top"),
          //   btn_comp_style.getPropertyValue("margin-top"),
          //   btn_comp_style.getPropertyValue("border-top-width")
          // ]
          // var left_offsets = [
          //   btn_comp_style.getPropertyValue("left"),
          //   btn_comp_style.getPropertyValue("margin-left"),
          //   btn_comp_style.getPropertyValue("border-left-width")
          // ]
          // var pos_top = that.calcOffset(top_offsets, btn_comp_style.getPropertyValue("position"));
          // var pos_left = that.calcOffset(left_offsets, btn_comp_style.getPropertyValue("position"));
          // var buttonTop = pos_top  + button.height()/2;
          // var buttonLeft = pos_left  + (button.width()/2);
          // var poX = 0;
          // var poY = 0;
          // switch(poX1){
          //   case '%':
          //     poX = (previewWidth/100)*poX0;
          //     break;
          //   case 'px':
          //     poX = poX0;
          //     break;
          // }
          // switch(poY1){
          //   case '%':
          //     poY = (previewHeight/100)*poY0;
          //     break;
          //   case 'px':
          //     poY = poY0;
          //     break;
          // }
//          element.find('.check_point').remove();
//          $('.check_point').remove();
//          element.append($('<div>').css({
//            'position':'absolute',
//            'top': poY + 'px',
//            'left': poX + 'px',
//            'backgroundColor': 'red',
//            'z-index':10000
//          }).addClass('check_point').width(10).height(10));

          //persp-origin relatively to the button
//           var btnPoX = poX - buttonLeft;
//           var btnPoY = poY - buttonTop;

//           var perspectiveBlock = that.view.target.parent();

//           var prevBtnTop = (perspectiveBlock.height()/2);// + parseInt(that.view.target.css('margin-top'));
//           var prevBtnLeft = (perspectiveBlock.width()/2);// + parseInt(that.view.target.css('margin-left'));
// //          //
//          mainBlock.append($('<div>').css({
//            'position':'absolute',
//            'top': prevBtnTop + 'px',
//            'left': prevBtnLeft + 'px',
//            'backgroundColor': 'yellow',
//            'z-index':10000
//          }).addClass('check_point').width(5).height(5));
//
//          element.append($('<div>').css({
//            'position':'absolute',
//            'top': buttonTop + 'px',
//            'left': buttonLeft + 'px',
//            'backgroundColor': 'yellow',
//            'z-index':10000
//          }).addClass('check_point').width(5).height(5));
//
//
//          mainBlock.append($('<div>').css({
//            'position':'absolute',
//            'top':Math.round((prevBtnTop+btnPoY))+'px',
//            'left': Math.round((prevBtnLeft+btnPoX))+'px',
//            'backgroundColor': 'white',
//            'z-index':10000
//          }).addClass('check_point').width(10).height(10));
          // var po = Math.round(prevBtnLeft+btnPoX)+'px' + ' ' +  Math.round(prevBtnTop+btnPoY)+'px';
          // perspectiveBlock.css({
          //   webkitPerspective:p,
          //   webkitPerspectiveOrigin:po
          // });

        };

        that.manualChange = function(){
          that.genetateOutputTransform();
          that.options.onChange(that.oTransform);
        };



        that.refresh = function(){
          $that.pointerAction({
            backNode:'body',
            onStart:  that.onXYRotationStart,
            onMove:   that.onXYRotationMove,
            onEnd:    that.onXYRotationEnd
          });

          that.view.rotateZhandler.pointerAction({
            backNode:'body',
            offsetNode: $that,
            onStart:  that.onZRotationStart,
            onMove:   that.onZRotationMove,
            onEnd:    that.onZRotationEnd
          });

          that.updateView();
        };

        that.setData = function(v){
          that.oTransform = v;
          that.genetateInputTransform();
          that.refresh();
        };

        that.width = $that.width();
        that.height = $that.height();

        that.tWidth = that.view.target.width();
        that.tHeight = that.view.target.height();

        return this;
      });
    },

    set: function(val){
      this.each(function() {
        this.transform3d.setData(val);
      });
      return this;
    },

    refresh: function(val){
      this.each(function() {
        this.transform3d.refresh();
      });
      return this;
    }
  };

  $.fn.transform3d = function(method) {
    if (methods[method]) {
      methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method ' + method + ' does not exist on $.transform3d');
    }
    return this;
  };
})(window.jQuery);

