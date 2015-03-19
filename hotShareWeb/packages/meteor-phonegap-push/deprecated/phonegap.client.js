DEBUG = false;

  PhoneGap = new (function() {
    var self = this;
    var parentOrigin = (!DEBUG)?'file://':'http://localhost:3000';

    self.methodCalls = [];
    self.onReadyCallbacks = [];
    self.deviceready = false;
    // Generic event handlers...
    self.eventCallbacks = [];

    self.registerEventListener = function(name, callback, preventDefault) {
      // Add event to self.eventCallbacks
      if (self.eventCallbacks[name] == undefined) {
        self.eventCallbacks[name] = []; // Create a new array
        // Register event at parent so it knows we are interested
        window.parent.postMessage({ eventName: name, preventDefault: preventDefault }, parentOrigin);
      }
      // Save the callback as listener
      return self.eventCallbacks[name].push(callback);
    };

    /*
      Registre event listeners
     */
    self.addEventListener = function(name, callback) {
      if (typeof(callback) != "function")
        throw new Error('addEventListener requires a callback function for event: ' + name);
      // deviceready is special
      if (name == 'deviceready') {
        if (self.deviceready)
          callback.apply(window)
        else
          self.onReadyCallbacks.push(callback);

      } else {
        // Generic event
        return self.registerEventListener(name, callback);
      }
    };

    // Return to callback
    window.addEventListener('message', function (event) {
      // if (event.detail) // Then use detail as data
      //   event.data = event.detail;

      if (event && event.data && !event.data.payload && event.data.callbackId != undefined && self.methodCalls[event.data.callbackId]) {
        /*
          data.func = method name     
          data.result = the result of running the function   
          data.callbackId =  method call
          data.invokeId = id of callback to invoke
          event.data.result
        */
        // { gotCallback: gotCallback, callbacks: callbacks}
  
        if (self.methodCalls[event.data.callbackId]) {
          if (event.data.invokeId != undefined) {
            var result = (event.data.result)?event.data.result:{};
            result['result'] = event.data.result; // the function result to the event result

            self.methodCalls[event.data.callbackId][event.data.invokeId](result);
          }
          // Clean up
          delete self.methodCalls[event.data.callbackId];
        } // EO methodCall found
      } else if (event && (event.data || event.detail)) {
            // device ready
            if (event.data.eventName && event.data.callbackId != -1) {
              // We got an event, deviceready is special
              if (event.data.eventName == 'deviceready') {
                self.deviceready = true;
                while (self.onReadyCallbacks.length)
                  self.onReadyCallbacks.pop().apply(window);
              } else {
                // Generic event handler...
                if (self.eventCallbacks[event.data.eventName])
                  for (var i = 0; i < self.eventCallbacks[event.data.eventName].length; i++)
                    if (event.data.payload)
                      self.eventCallbacks[event.data.eventName][i](event.data.payload)          
                    else
                      self.eventCallbacks[event.data.eventName][i]();          
              }
            } else {
              // Empty function - no where to return
            }

        } else {
          throw new Error('Cant run callback, unknown callback');
        }
    });


    // Call a function
    self.call = function( /* arguments, first is a key */) {
      if (arguments) {
        var myArgs = [];
        var describer = [];
        var callbacks = [];
        for (var i = 1; i < arguments.length; i++)
          if (typeof(arguments[i]) != "function") {
            describer[i-1] = false;
            myArgs[i-1] = arguments[i];
          } else {
            describer[i-1] = callbacks.push(arguments[i]) - 1;
            myArgs[i-1] = true;
          }

        funcName = arguments[0];  
        // console.log(funcName);
        // console.log(describer);
        // console.log(myArgs);
        // console.log(arguments.length);
        // save the callback and replace it with an index for the callback
        var callbackId = self.methodCalls.push(callbacks)-1;

        /*
          func = 'window.console.log'
          callbackId = id of method call
          args = applied arguments
          describer = [false, false, false, 0, 1] // where 0 and 1 is callbacks
        */
        window.parent.postMessage({ 
          func: funcName, 
          args: myArgs, 
          callbackId: callbackId, 
          describer: describer }, parentOrigin);
      } else
        throw new Error('PhoneGap call expects a callback function');
    };

    self.getValue = function(/* arguments */) {
      var newArgs = [];
      newArgs[0] = 'meteorPhonegap.getValue';
      for (var i = 0; i < arguments.length; i++)
        newArgs[i+1] = arguments[i];
      self.call.apply(self, newArgs);
    };

    self.setReady = function() {
      window.parent.postMessage({ clientready: true }, parentOrigin);
    };

    self.close = function() {
      self.call('navigator.app.exitApp');
    };

    return self;

  })();