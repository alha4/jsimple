"use strict";

(function(global) {

  const version = "1.0";

  let JSS = function() {
       
  };

  JSS.prototype = {

    get version() {
      return version;
    },
       
    nodeTypes : {  
      NODE_ELEMENT : 1,
      NODE_ATTRIBUTE : 2,
      NODE_TEXT : 3,
      NODE_DOCUMENT : 9
    },

    $(domPath) {

       if(typeof domPath == 'string') {

         if(domPath.indexOf(",") !== -1 || document.querySelectorAll(domPath).length > 1) {
        
            return document.querySelectorAll(domPath);

         } 

         return document.querySelector(domPath);

       }

       return domPath;

    },

    prev(domPath) {

        let prev = this.$(domPath).previousSibling;

        if(prev.nodeType !== this.nodeTypes.NODE_ELEMENT) {

           return this.prev(prev);
        }

        return prev;
    
    },

    last(domPath) {
 
      let last = this.$(domPath).lastChild;

          if(last.nodeType !== this.nodeTypes.NODE_ELEMENT) {

            return this.prev(last);

          }

          return  last;
    },

    first(domPath) {

        let first = this.$(domPath).firstChild;

          if(first.nodeType !== this.nodeTypes.NODE_ELEMENT) {

            return this.next(first);

          }
          
          return  first;
    },

    next(domPath) {
    
      let next = this.$(domPath).nextSibling;

        if(next.nodeType !== this.nodeTypes.NODE_ELEMENT) {

           return this.next(next);
        }

        return next;
    },

    event(element,type,callback,capture = false) {

      if(!"addEventListener" in document) {

        if(this.$(element)) {

          if(type == 'wheel') {

             type = 'mousewheel';
          }
          
          this.$(element).attachEvent('on' + type,(event) => {

             var event = window.event;
             
              if(!"stopPropagation" in event) {

                  event.prototype.stopPropagation = function() {

                      return event.cancelable = true;

                  }
              }
              if(!"preventDefault" in event) {

                event.prototype.preventDefault = function() {

                    return event.returnValue = false;

                }
              }

              callback(window.event);
              
            });
        }

      } else {
    
        if(this.$(element)) {

           this.$(element).addEventListener(type,(event) => {

               callback(event);
              
              },capture);
        }
     }
    },

    liveEvent(element,type,callback,capture = false,nodeObserver = false) {

      let observer = new MutationObserver(function(mutations) {

            JS.event(element,type,callback,capture);

          }),

          target = this.$(nodeObserver) || document.body,

          config = {attributes: false, childList: true, subtree : true, characterData: true}

          observer.observe(target, config);
    },

    dispatchEvent(element,eventType) {

       let event = new Event(eventType,{bubbles: true, cancelable: false});

       return this.$(element).dispatchEvent(event);

    },

    documentSize() {

      let scrollHeight = Math.max(
        document.body.scrollHeight, document.documentElement.scrollHeight,
        document.body.offsetHeight, document.documentElement.offsetHeight,
        document.body.clientHeight, document.documentElement.clientHeight
      ),scrollWidth = Math.max(
        document.body.scrollWidth, document.documentElement.scrollWidth,
        document.body.offsetWidth, document.documentElement.offsetWidth,
        document.body.clientWidth, document.documentElement.clientWidth
      );

      return {height : scrollHeight, width: scrollWidth};
    },

    windowScroll() {

     let scrollTop  = window.pageYoffset || document.documentElement.scrollTop,
         scrollleft = window.pageXoffset || document.documentElement.scrollLeft;

      return {x : scrollleft, y : scrollTop};
    },

    style(nodePath,styleCode) {

       let computedStyle = window.getComputedStyle(this.$(nodePath));

       return computedStyle[styleCode];

    },

    addClass(element,className) {

       const node = this.$(element);

       if(!node.classList.contains(className)) {
           node.classList.add(className);
       }
    }, 

    toggleClass(element,className) {

        this.$(element).classList.toggle(className);

    },

    data : function(domPath,key,value = false) {
      
      const node = this.$(domPath),
            is_dataset = !!node.dataset;

      if(value) {
   
        if(is_dataset) {

            return node.dataset[key] = value;

        }

        return  node.setAttribute("data-" + key,value);
      }

      if(is_dataset) {

         return node.dataset[key];

      }

      return node.getAttribute("data-" + key);
    },

    ajax(params) {

      if(("fetch" in window) && params.xhr !== true) {

        let fetch_params = {

            method : params.method ? params.method : "GET",
            body   : params.method == 'POST' ? params.data : false,

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

          params.method = params.method ? params.method : "GET";

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

    formValidate(formPath,resolve,reject = (error)=>error) {

       const form   = this.$(formPath),
             inputs = (form).querySelectorAll("input[required]");

       var   input_errors = [];

       this.event(form,"submit",function(e){

            for(let input of inputs) {

               if(!input.checkValidity()) {
                 
                   input_errors.push(input);
               }

            }
       
            if(input_errors.length > 0) {

               e.preventDefault();

               reject(input_errors);

               return false;
            } 

            e.preventDefault();

            resolve();

            return false;
      });          
    },

    uploadFile(params) {

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
   
    serverEvent(params) {

     const eventSource = new EventSource(params.url,{
            withCredentials: params.cors ? true : false
           });

           eventSource.onmessage = function(e) {
               
                params.onmessage(e.data);
          };

          eventSource.onopen = function(e) {
            console.log("Соединение открыто");
          };
          
          eventSource.onerror = function(e) {
            if (this.readyState == EventSource.CONNECTING) {
              console.log("Соединение порвалось, пересоединяемся...");
            } else {
              console.log("Ошибка, состояние: " + this.readyState);
            }
          };
    },

    module(path) {

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
