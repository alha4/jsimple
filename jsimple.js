"use strict";

(function(global) {

  let JSS = function() {};

  JSS.prototype = {

    $ : function(domPath) {
      
        return typeof domPath == 'string' ? document.querySelectorAll(domPath).length > 1 ? document.querySelectorAll(domPath) : document.querySelector(domPath) : domPath;

    },

    event : function(element,type,callback,capture = false) {

        this.$(element).addEventListener(type,function(event) {

               callback(event);
              
            },capture);
    },

    addClass : function(element,className) {

       const node = this.$(element);

       if(!node.classList.contains(className)) {
           node.classList.add(className);
       }
    }, 

    toggleClass : function(element,className) {

        this.$(element).classList.toggle(className);

    },

    module : function(path) {

      const script = document.createElement("script");
            script.src = path + ".js";

            this.$('head').appendChild(script);     

    },

    exd : function(...objects) {

      return Object.assign(this.__proto__ , ...objects);
   }

  };

  global.JS = new JSS();

  return JS = global.JS;

})(window);
