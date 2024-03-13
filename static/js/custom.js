
  (function ($) {
  
  "use strict";

    // HERO SLIDE
    $('.hero-slide').backstretch([
      "./images/slideshow/white-wall-living-room-have-sofa-decoration-3d-rendering.jpg",
      "./images/slideshow/interior-wall-mockup-with-sofa-cabinet-living-room-with-empty-white-wall-background-3d-rendering.jpg",
      "./images/slideshow/wood-sideboard-living-room-interior-with-copy-space.jpg"
    ],  {duration: 2000, fade: 750});

    // MENU
    $('#sidebarMenu .nav-link').on('click',function(){
      $("#sidebarMenu").collapse('hide');
    });
    
    // CUSTOM LINK
    $('.smoothscroll').click(function(){
      var el = $(this).attr('href');
      var elWrapped = $(el);
      var header_height = $('.navbar').height();
  
      scrollToDiv(elWrapped,header_height);
      return false;
  
      function scrollToDiv(element,navheight){
        var offset = element.offset();
        var offsetTop = offset.top;
        var totalScroll = offsetTop-navheight;
  
        $('body,html').animate({
        scrollTop: totalScroll
        }, 300);
      }
    });
  
  })(window.jQuery);

