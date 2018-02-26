"use strict";

(function(global) {

  let JSS = function() {

  };

  JSS.prototype = {

    nodeTypes : {  
      NODE_ELEMENT : 1,
      NODE_TEXT : 3   
    },

    $ : function(domPath) {
      
        return typeof domPath == 'string' ? document.querySelectorAll(domPath).length > 1 ? document.querySelectorAll(domPath) : document.querySelector(domPath) : domPath;

    },

    prev  : function(domPath) {

        let prev = this.$(domPath).previousSibling;

        if(prev.nodeType !== 1) {

           return this.prev(prev);
        }

        return prev;
    
    },

    last : function(domPath) {
 
      let last = this.$(domPath).lastChild;

          if(last.nodeType !== 1) {

            return this.prev(last);

          }

          return  last;
    },

    first : function(domPath) {

        let first = this.$(domPath).firstChild;

          if(first.nodeType !== 1) {

            return this.next(first);

          }
          
          return  last;
    },

    next : function(domPath) {
    
      let next = this.$(domPath).nextSibling;

        if(next.nodeType !== 1) {

           return this.next(next);
        }

        return next;
    },

    event : function(element,type,callback,capture = false) {

      if(!"addEventListener" in document) {

        this.$(element).attachEvent('on' + type,(event) => {

               callback(window.event);
         
              });

      } else {

        this.$(element).addEventListener(type,(event) => {

               callback(event);
              
             },capture);
     }
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

    ajax : function(params) {

      if(("fetch" in window) && params.xhr !== true) {

        let fetch_params = {

            method : params.method,
            body   : params.data,

         },

         headers = new Headers(params.headers);

         if(params.method == 'POST' && !params.isFile) {

             headers.append("Content-type","application/x-www-form-urlencoded; charset=UTF-8");
           
         }
         if(params.cors) {

            fetch_params.mode = params.cors;
         }
 
         fetch_params.headers = headers;

         params.type = params.type ?  params.type : 'text';

         fetch(params.url,fetch_params).then(function(response) {
         
           if(response.ok) {

              return {body : response[params.type](), headers : response.headers};
           }

           throw new Error('Network response was not ok.');

         }).then(function(response){
             
            if(params.isFile) {

               response.body.then(function(result) {

               let reader = new FileReader();
                   reader.onload = (function(file) { return function(e) { 
                      
                          params.success(result,response.headers,e.target.result); 
              
                    };})(params.file);
                  
                    reader.readAsDataURL(params.file);
               });

            } else {
            
              params.success(response.body,response.headers);
           
            }
          
         }).catch(function(error){

             params.success(error,{});
         });

      } else {

      let http = new XMLHttpRequest();  

          http.responseType = params.type ?  params.type : 'text';

          http.onload = () => {
             
          params.success(http.responseText, {

                 get : (key) => { 
                
                   return http.getResponseHeader(key) 
                
                }

            }); 
          };  
          http.onerror = (error) => {
            params.success(error,{}); 
          }; 

          if(typeof params.onprogress == "function") {

          http.upload.onprogress = (event) => {

            if(event.lengthComputable) {

              var percentComplete = Math.round(event.loaded / event.total) * 100;

              setTimeout(function() {
             
                  params.onprogress(percentComplete);

              },1000);

              } 
            };
          } 
          http.open(params.method, params.url, true);  

          if(params.method == 'POST' && !params.isFile) {

             http.setRequestHeader("Content-type","application/x-www-form-urlencoded; charset=UTF-8");
  
         }

         if(params.headers) {

           for(var key in params.headers) {
 
               let value = params.headers[key];

                   http.setRequestHeader(key,value);
           }
        }

        http.send(params.data);
      }
    },

    uploadFile : function(params) {

      const dataFile = this.$(params.file).files[0], 
            fileName = this.$(params.file).getAttribute("name"),
            formData = new FormData(),
            validFileType = function (file,fileTypes) {
              for(var i = 0; i < fileTypes.length; i++) {
                  if(file.type === fileTypes[i]) {
                    return true;
                }
            }
      
          return false;
      }

      formData.append(fileName, dataFile, dataFile.name);

      if(params.accept) {

         if(validFileType(dataFile,params.accept)) {
            
             this.ajax({url : params.url, method : "POST" ,file : dataFile, xhr : params.xhr, isFile : true, data : formData, success : params.success, onprogress : params.progress});

         } else {

            params.success({error : "File format not valid"});

         }
         
      } else {

           this.ajax({url : params.url, method : "POST", xhr : params.xhr, isFile : true, data : formData, success : params.success, onprogress : params.process});
      }
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
