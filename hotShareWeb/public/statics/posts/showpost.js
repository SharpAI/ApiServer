var gushitie = {};
gushitie.showpost = {};

gushitie.showpost.init = function() {
        $("#wrapper .mainImage").css("height", ( $(window).height()*0.55) + "px");

        var   baseHeight= ($('.showPosts').width()-30)/6;
        $(".postImageItem.element").each(function(idx, item) {
            var img = this.querySelector("img.lazy");
            var pHeight = parseInt($(img).data('sizey')) * baseHeight;
            this.style.height = pHeight + 'px';
        });


        var $showPosts, $test;
        $showPosts = $('.showPosts');
        $test = $('.showPosts').find('.content .gridster #test');
        if ($test.height() > 1000) {
            $('.showPosts').get(0).style.overflow = 'hidden';
            $('.showPosts').get(0).style.maxHeight = '1500px';
            $('.showPosts').get(0).style.position = 'relative';
            var i_el = document.createElement('i');
            i_el.className = 'fa fa-plus-circle';
            i_el.textContent = '继续阅读';

            var dd_el = document.createElement('div');
            dd_el.className = 'readMoreContent';
            dd_el.appendChild(i_el);

            var d_el = document.createElement('div');
            d_el.className = 'readmore';
            d_el.appendChild(dd_el);

            //$showPosts.after('<div class="readmore"><div class="readMoreContent"><i class="fa fa-plus-circle"></i>继续阅读</div></div>');
            $showPosts.after(d_el);
        }

        $('.showPostsBox .readmore').click(function(e) {
            e.stopPropagation();
            $('.showPosts').get(0).style.overflow = '';
            $('.showPosts').get(0).style.maxHeight = '';
            $('.showPosts').get(0).style.position = '';
            $('.readmore').remove();
        });
};