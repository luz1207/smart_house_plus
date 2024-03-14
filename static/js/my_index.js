//幻灯片效果
var slides =  ['../static/images/slideshow/slide1.jpg', '../static/images/slideshow/slide3.jpg','../static/images/slideshow/slide2.jpg'];
var currentSlide = 0;
const slideshowElement = document.getElementById('my_container');

function showNextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    slideshowElement.style.backgroundImage = 'url(' + slides[currentSlide] + ')';
}

setInterval(showNextSlide, 2000); // 切换幻灯片的时间间隔，这里设置为5秒

