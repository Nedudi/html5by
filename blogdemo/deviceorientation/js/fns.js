var fns = {
  randId:function(){
  	var chars = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  	var string_length = 4;
  	var randomstring = '';
  	for (var i=0; i<string_length; i++) {
  		var rnum = Math.floor(Math.random() * chars.length);
  		randomstring += chars.substring(rnum,rnum+1);
  	}
    return  'e'+(new Date().getTime()) + randomstring;
  },

  intToHex:function(dec){
    var result = (dec | 0).toString(16);
    if (result.length == 1) result = ('0' + result);
    return result.toLowerCase();
  },

  arrToRgbaStr:function(arr){
    return 'rgba('+Math.round(arr[0])+', '+Math.round(arr[1])+', '+Math.round(arr[2])+', '+Math.round(arr[3]*100)/100+')';
  },

  rgbaStrToArr:function(rgbaStr){
    var arr = rgbaStr.split('(')[1].split(')')[0].split(',');
    if(arr.length < 4) arr.push(1);
    return arr;
  },

	convertColorToFormat: function(str,format){
		var that = this;
		var tinyColor = tinycolor(str);
		switch(format){
			case 'hex':
				return '#'+tinyColor.toHex8String().substr(3,6);
				break;
			case 'hsla':
				return tinyColor.toHslString();
				break;
			case 'rgba':
				return tinyColor.toRgbString();
				break;
		}
	},
	
	
	
	getColorFormat: function(str){
		if(str.indexOf('rgb')!=-1){
			return 'rgba';
		} else if(str.indexOf('hsl')!=-1){
			return 'hsla';
		} else if(str.indexOf('#')!=-1){
			return 'hex';
		}
	},


	getColorStringByFormat: function(colorVal, colorFormat){
		var that = this;
		var str = "rgba("+colorVal.r+','+colorVal.g+","+colorVal.b+","+((colorVal.a || colorVal.a==0)?(Math.round(100*colorVal.a/255)/100):1)+")";
		if(colorFormat != "rgba"){
			str = that.convertColorToFormat(str,colorFormat);
		}
		return str;
	},

	getValidRgbaStr: function(){
		
	},
	
	getPickerColorFromStr: function(str){
		var that = this;
		var format = that.getColorFormat(str);
		var value = str;
		switch(format){
			case 'rgba':
				var rgbaArr = that.rgbaStrToArr(str);
				value = {r:rgbaArr[0],g:rgbaArr[1],b:rgbaArr[2],a:rgbaArr[3]*255};
				break;
			case 'hsva':
				var rgbaArr = that.rgbaStrToArr(str);
				var hue = rgbaArr[0];
				var sat = rgbaArr[1];
				var light = rgbaArr[2];
				sat = 2*sat/(light+sat);
				
				var v = light+sat
				value = {h:hue,s:sat,v:v,a:rgbaArr[3]*255};
				break;
				
		}
		return {
			value:value,
			format:format
		}
	},
	
	
	

  arrToCBStr:function(arr){
    return 'cubic-bezier('+arr[0]+', '+arr[1]+', '+arr[2]+', '+arr[3]+')';
  },
	
	isColorWithAlpha: function(str){
		var that = this;
		if(str.indexOf('rgba')==0 || str.indexOf('hsla') == 0){
			var colorArr = that.rgbaStrToArr(str);
			console.log(colorArr[3])
			if(colorArr[3] < 1){
				return true;
			}
		}
		return false;
	},
	
	isColorStr:function(str){
		if(str.indexOf('#')==0 || str.indexOf('rgb')==0 || str.indexOf('hsl')==0){
			return true;
		}
		return false;
	},

  // swap:function(arr,a,b){
  //   console.log('=================>',a,b);
  //   var temp = arr[a];
  //   arr.splice(a, 1);
  //   arr.splice(b, 0, temp);
  //   return arr;
  // },

  findByFieldKey:function(o,key,val){
    for(i in o){
      if(o[i][key] == val){
        return {value:o[i], index:i};
      }
    }
    return {value:false,index:-1};
  },

  clone:function(o) {
    var that = this;
  	if(!o || "object" !== typeof o)  {
  		return o;
  	}
  	var c = "function" === typeof o.pop ? [] : {};
  	var p, v;
  	for(p in o) {
  		if(o.hasOwnProperty(p)) {
  			v = o[p];
  			if(v && "object" === typeof v) {
  				c[p] = that.clone(v);
  			}
  		else c[p] = v;
  		}
  	}
  	return c;
  },
  compare: function(x, y) {
    var equal = JSON.stringify(x) === JSON.stringify(y);

    // fast check
    return equal;

//    var isArray = Array.isArray;
//    var isObject = function(o) { return Object.prototype.toString.call(o) === '[object Object]'; };
//
//    function values(obj) {
//      var values = [],
//          keys = Object.keys(obj).sort();
//      for (var i = 0, l = keys.length; i < l; i++) {
//        values.push( obj[keys[i]] );
//      }
//      return values.sort();
//    }
//    function equal_(a, b) {
//      var equal = a === b;
//
//      if(!equal) {
//        throw new Error( JSON.stringify(a) + ' !== ' + JSON.stringify(b) );
//      }
//    }
//    function equal_keys(a,b) {
//      var keys_a = Object.keys(a).sort(),
//          keys_b = Object.keys(b).sort();
//      return keys_a.toString() === keys_b.toString();
//    }
//
//    function deep(a, b) {
//      if(isArray(a) && isArray(b)) {
//        if(a.length === b.length) {
//          for(var i = a.length; i--; ) {
//            deep(a[i], b[i]);
//          }
//        } else {
//          equal_(0,1);
//        }
//      } else if(isObject(a) && isObject(b)) {
//        if(equal_keys(a, b)) {
//          deep( values(a), values(b) );
//        } else {
//          equal_(0,1);
//        }
//      } else {
//        equal_( a, b );
//      }
//    }
//
//    deep(x,y);
  },

  enjoyValueToArray:function(v){
    v+='';
    var vArr = v.split('_');
    return [vArr[0],vArr[1] || false];
  },

  async: function(callback, timeout) {
    setTimeout(function() {
      callback();
    }, timeout || 1);
  },
  escapeRegExp: function (str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  }
};