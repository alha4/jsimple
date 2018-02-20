"use strict";

(function(global) {
  const JSPlugin = Object.create({

     message :  function(mess) {
          alert('Hello ' + mess);
     }
  });

  global.JS.notify = JSPlugin;

  return JSPlugin;
   
})(window);
