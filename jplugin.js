"use strict";

(function(global) {

  global.JS.notify = Object.create({

    message :  function(mess) {
         alert('Hello ' + mess);
    }

 });

})(window);
