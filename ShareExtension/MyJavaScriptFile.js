var MyExtensionJavaScriptClass = function() {};

MyExtensionJavaScriptClass.prototype = {

    run: function(arguments) {

        arguments.completionFunction({"baseURI": document.baseURI,"title": document.title,"imagePath": document.getElementsByTagName('img')[0].src});

    },

    finalize: function(arguments) {

        var newContent = arguments["content"];

        document.write(newContent);

    }

};

var ExtensionPreprocessingJS = new MyExtensionJavaScriptClass;