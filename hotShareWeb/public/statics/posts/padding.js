(function(global) {
    var predefineColors = ["#55303e", "#503f32", "#7e766c", "#291d13", "#d59a73", "#a87c5f", "#282632", "#ca9e92", "#a7a07d", "#846843", "#6ea89e", "#292523", "#637168", "#573e1b", "#925f3e", "#786b53", "#aaa489", "#a5926a", "#6a6b6d", "#978d69", "#a0a1a1", "#4b423c", "#5f4a36", "#b6a2a9", "#1c1c4e", "#e0d9dc", "#393838", "#c5bab3", "#a46d40", "#735853", "#3c3c39"];

    var colorIndex = 0, colorLength = predefineColors.length;

    var padding = {};

    padding.setRandomlyBackgroundColor = function($node) {
        $node.css("background-color", predefineColors[colorIndex]);
        if (++colorIndex >= colorLength) colorIndex = 0;
    };

    global.padding = padding;


    $.fn.isAboveViewPortBottom = function(){

        var win = $(window);

        var viewport = {
            top : win.scrollTop(),
            left : win.scrollLeft()
        };
        viewport.right = viewport.left + win.width();
        viewport.bottom = viewport.top + win.height();

        var bounds = this.offset();
        if (bounds == null){
            return 0;
        }
        bounds.right = bounds.left + this.outerWidth();
        bounds.bottom = bounds.top + this.outerHeight();

        return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top));

    };
})(window);
