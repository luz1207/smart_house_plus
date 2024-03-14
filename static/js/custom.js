
  (function ($) {
  
  "use strict";

    // HERO SLIDE
    // $('.hero-slide').backstretch([
    //   "./images/slideshow/slide2.jpg",
    //   "./images/slideshow/slide1.jpg",
    //   "./images/slideshow/slide3.jpg"
    // ],  {duration: 2000, fade: 750});

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


