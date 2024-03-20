
const lamp_img1 = document.getElementById('lamp1');
const lamp_img2 = document.getElementById('lamp2');
const switches1 = document.querySelectorAll('.switch1 input')
const switches2 = document.querySelectorAll('.switch2 input')


const eventSource = new EventSource('/guesture_index');
eventSource.onmessage = function(event) {
    const datas = JSON.parse(event.data);
    // statusElement.innerText = 'Status: ' + status;
    // 根据不同的状态值切换不同的图像
    const status = datas.status;
    const name = datas.name;
    console.log(status, name);
    if (status === 1) {
        lamp_img1.src = '/static/images/guesture/open.png';
    } else if (status === 2) {
        lamp_img1.src = '/static/images/guesture/close.png';
    }

    if(status === 3){
        lamp_img2.src = '/static/images/guesture/open1.png';
    } else if(status === 4){
        lamp_img2.src = '/static/images/guesture/close2.png';
    }
    //  else {
    //     lamp_img1.src = '/static/images/guesture/close.png';
    //     lamp_img2.src = '/static/images/guesture/close2.png';
    // }

    console.log(status)

    if(status ===1 || status ===2){
        switches1.forEach(switchInput => {
            // 根据状态值设置开关的 checked 属性
            switchInput.checked = (status === 1);
        });
    }

    if(status === 3 || status === 4){
        switches2.forEach(switchInput => {
            // 根据状态值设置开关的 checked 属性
            switchInput.checked = (status === 3);
        });
    }


    // 识别手势的状态
    if (name === 'Thumb_Up'){
        const circleLight = document.querySelector('.circle-light.light1');
        circleLight.style.backgroundColor = '#86d986';
    }
    else {
        const circleLight = document.querySelector('.circle-light.light1');
        circleLight.style.backgroundColor = '#b7b7b7';
    }

    if (name === 'Pointing_Up'){
        const circleLight = document.querySelector('.circle-light.light2');
        circleLight.style.backgroundColor = '#86d986';
    }
    else {
        const circleLight = document.querySelector('.circle-light.light2');
        circleLight.style.backgroundColor = '#b7b7b7';
    }

    if (name === 'Victory'){
        const circleLight = document.querySelector('.circle-light.light3');
        circleLight.style.backgroundColor = '#86d986';
    }
    else {
        const circleLight = document.querySelector('.circle-light.light3');
        circleLight.style.backgroundColor = '#b7b7b7';
    }

    if (name === 'Thumb_Down'){
        const circleLight = document.querySelector('.circle-light.light4');
        circleLight.style.backgroundColor = '#86d986';
    }
    else {
        const circleLight = document.querySelector('.circle-light.light4');
        circleLight.style.backgroundColor = '#b7b7b7';
    }

    if (name === 'ILoveYou'){
        const circleLight = document.querySelector('.circle-light.light5');
        circleLight.style.backgroundColor = '#86d986';
    }
    else {
        const circleLight = document.querySelector('.circle-light.light5');
        circleLight.style.backgroundColor = '#b7b7b7';
    }

    if (name === 'Closed_Fist'){
        const circleLight = document.querySelector('.circle-light.light6');
        circleLight.style.backgroundColor = '#86d986';
    }
    else {
        const circleLight = document.querySelector('.circle-light.light6');
        circleLight.style.backgroundColor = '#b7b7b7';
    }

    if (name === 'Open_Palm'){
        const circleLight = document.querySelector('.circle-light.light7');
        circleLight.style.backgroundColor = '#86d986';
    }
    else {
        const circleLight = document.querySelector('.circle-light.light7');
        circleLight.style.backgroundColor = '#b7b7b7';
    }

};


//生成地图
var map = new AMap.Map('container',{
    resizeEnable: true,
    zoom: 10,
    center: [116.480983, 40.0958]
});
//获取当前天气信息，并展示
$(function(){
    $.ajax({
        url:"http://api.map.baidu.com/telematics/v3/weather?location=深圳&output=json&ak=ZbeFXv8desxK2Rmq76o5ytCk",
        type:"get",
        dataType:"jsonp",
        success:function(data){
            var city = data.results[0].currentCity;//当前城市
            var pm25 = data.results[0].pm25;//当前PM2.5
            var weathers = data.results[0].weather_data[0];//获取今天的实时天气情况
            var date = weathers.date;//获取日期和实时气温：周日 02月19日（实时：10°C）
            var dayPic = weathers.dayPictureUrl;//白天天气图片
            var nightPic = weathers.nightPictureUrl;//夜间天气图片
            var temp = weathers.temperature;//气温
            var weather = weathers.weather;//天气描述
            var wind = weathers.wind;//风力
            var htmlCon = ""+city+"&nbsp;<img src='"+dayPic+"'>"+weather+"&nbsp;"+wind+"&nbsp;"+date;
            $(".weather").append(htmlCon);
        },
        error:function(e){
            alert("error");
        }
    });
});


var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

ctx.strokeStyle = '#00ffff';
ctx.lineWidth = 17;
ctx.shadowBlur= 15;
ctx.shadowColor = '#00ffff'

function degToRad(degree){
    var factor = Math.PI/180;
    return degree*factor;
}


var dateInfo = new Date();
var hr = dateInfo.getHours() > 12 ? dateInfo.getHours() - 12 : dateInfo.getHours(),
    min = dateInfo.getMinutes(),
    sec = dateInfo.getSeconds(),
    milsec = dateInfo.getMilliseconds();
var hrAngle = hr * 30 + (min * 6 / 12),
    minAngle = min * 6 + (sec * 6 / 60),
    secAngle = sec * 6 + (milsec * 0.36 / 1000);

// 设置手部包装纸的初始角度
function setAngle(wrapper, angle) {
    document.querySelector("." + wrapper).style.transform = "rotate(" + angle + "deg)";
}
setAngle("hr-wrapper", hrAngle);
setAngle("min-wrapper", minAngle);
setAngle("sec-wrapper", secAngle);


