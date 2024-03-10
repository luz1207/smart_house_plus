
const statusElement = document.getElementById('guesture_index_res');
const lamp_img = document.getElementById('lamp');
const guesture_title_div = document.getElementById('guesture_title_div');
const switches = document.querySelectorAll('.switch input')


const eventSource = new EventSource('/guesture_index');
// const eventSource1 = new EventSource('/guesture_title');
eventSource.onmessage = function(event) {
    const datas = JSON.parse(event.data);
    // statusElement.innerText = 'Status: ' + status;
    // 根据不同的状态值切换不同的图像
    const status = datas.status;
    const name = datas.name;
    console.log(status, name);
    if (status === 1) {
        lamp_img.src = '/static/images/guesture/open.png';
    } else if (status === 2) {
        lamp_img.src = '/static/images/guesture/close.png';
    }
     else {
        lamp_img.src = '/static/images/guesture/close.png';
    }

    switches.forEach(switchInput => {
        // 根据状态值设置开关的 checked 属性
        switchInput.checked = (status === 1);
    });

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

