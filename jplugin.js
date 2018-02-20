"use strict";

(function(global) {

  const JSPlugin = Object.create({
     log : function() {

     },
     message : {
       value : function(mess) {
          alert('Hello ' + mess);
       },

      enumerable: true
    }
  });

   Object.assign(global.JS,JSPlugin);

   console.log(global.JS);
   
})(window);