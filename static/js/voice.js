var $messages = $('.messages-content'),
    d, h, m,
    i = 0;

$(window).load(function() {
    $messages.mCustomScrollbar();
    setTimeout(function() {
        fakeMessage(Fake[0]);
    }, 100);
});

function updateScrollbar() {
    $messages.mCustomScrollbar("update").mCustomScrollbar('scrollTo', 'bottom', {
        scrollInertia: 10,
        timeout: 0
    });
}

function setDate(){
    d = new Date()
    if (m != d.getMinutes()) {
        m = d.getMinutes();
        $('<div class="timestamp">' + d.getHours() + ':' + m + '</div>').appendTo($('.message:last'));
    }
}

function insertMessage(text) {
    // msg = $('.message-input').val();
    // if ($.trim(msg) == '') {
    //     return false;
    // }
    $('<div class="message message-personal">' + text + '</div>').appendTo($('.mCSB_container')).addClass('new');
    setDate();
    // $('.message-input').val(null);
    updateScrollbar();
    // setTimeout(function() {
    //     fakeMessage();
    // }, 1000 + (Math.random() * 20) * 100);
}

// $('.message-submit').click(function() {
//     insertMessage();
// });

// $(window).on('keydown', function(e) {
//     if (e.which == 13) {
//         insertMessage();
//         return false;
//     }
// })

var Fake = [
    'Hi，如果您有什么需要，可以唤醒我！',
]

function fakeMessage(answer) {
    // if ($('.message-input').val() != '') {
    //     return false;
    // }
    $('<div class="message loading new"><figure class="avatar"><img src="../static/images/voice/robot_img.png" /></figure><span></span></div>').appendTo($('.mCSB_container'));
    updateScrollbar();

    setTimeout(function() {
        $('.message.loading').remove();
        $('<div class="message new" style="color: white"><figure class="avatar"><img src="../static/images/voice/robot_img.png" /></figure>' + answer + '</div>').appendTo($('.mCSB_container')).addClass('new');
        setDate();
        updateScrollbar();
        i++;
    }, 1000 + (Math.random() * 20) * 100);

}
lastModifiedTime = 0

setInterval(function() {
    // 发送 HEAD 请求，获取文件的修改时间
    fetch('../static/output.json', { method: 'HEAD' })
        .then(response => {
            // 获取文件的最后修改时间
            const modifiedTime = new Date(response.headers.get('last-modified')).getTime();

            // 检查文件是否更新
            if (modifiedTime > lastModifiedTime) {
                // 更新全局变量
                lastModifiedTime = modifiedTime;

                // 发送 GET 请求，获取文件内容
                return fetch('../static/output.json');
            }
        })
        .then(response => {
            // 如果文件更新，则将最新内容显示到前端
            if (response) {
                return response.json();
            }
        })
        .then(data => {
            if (data) {
                // 将文件内容显示到前端
                // document.getElementById('text').innerText = data.text;
                // document.getElementById('answer').innerText = data.answer;
                fakeMessage(data.answer);
            }
        })
        .catch(error => console.error('Error:', error));
}, 1500); // 1秒检查一次

lastModifiedTime1 = 0

setInterval(function() {
    // 发送 HEAD 请求，获取文件的修改时间
    fetch('../static/user.json', { method: 'HEAD' })
        .then(response => {
            // 获取文件的最后修改时间
            const modifiedTime1 = new Date(response.headers.get('last-modified')).getTime();

            // 检查文件是否更新
            if (modifiedTime1 > lastModifiedTime1) {
                // 更新全局变量
                lastModifiedTime1 = modifiedTime1;

                // 发送 GET 请求，获取文件内容
                return fetch('../static/user.json');
            }
        })
        .then(response => {
            // 如果文件更新，则将最新内容显示到前端
            if (response) {
                return response.json();
            }
        })
        .then(data => {
            if (data) {
                // 将文件内容显示到前端
                // document.getElementById('text').innerText = data.text;
                // document.getElementById('answer').innerText = data.answer;
                insertMessage(data.user);
            }
        })
        .catch(error => console.error('Error:', error));
}, 1000); // 1秒检查一次


const cvs = document.querySelector('canvas')
const ctx = cvs.getContext('2d')
function initCvs() {
    cvs.width = (window.innerWidth / 4) * devicePixelRatio;
    cvs.height = (window.innerHeight / 8) * devicePixelRatio
}
initCvs()



let dataArray, analyser;
var mystatus = document.getElementById("status");
debugger
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

if (!navigator.getUserMedia) {
    mystatus.innerHTML = "您的浏览器不支持获取音频。"
}
navigator.getUserMedia({ audio: true }, onSuccess, onError); //调用麦克风捕捉音频信息，成功时触发onSuccess函数，失败时触发onError函数
function onError() {
    mystatus.innerHTML = "获取音频时好像出了点问题。"
}
function onSuccess(stream) {

    //创建一个音频环境对像
    audioContext = window.AudioContext || window.webkitAudioContext;
    audCtx = new audioContext();
    //将声音输入这个对像
    source = audCtx.createMediaStreamSource(stream);//创建一个音频源节点  createMediaStreamSource 创建媒体流源     createMediaElementSource  创建媒体元素源

    //设置音量节点
    volume = audCtx.createGain();
    source.connect(volume);

    analyser = audCtx.createAnalyser()//创建一个分析器节点
    analyser.fftSize = 256;
    //创建数组，用于接收分析器节点的数据

    var bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength)
    source.connect(analyser)
    //创建缓存，用来缓存声音
    var bufferSize = 2048;

    // 创建声音的缓存节点，createJavaScriptNode方法的
    // 第二个和第三个参数指的是输入和输出都是双声道。
    recorder = audCtx.createScriptProcessor(bufferSize, 1, 1);

    // 录音过程的回调函数，基本上是将左右两声道的声音
    // 分别放入缓存。
    recorder.onaudioprocess = function (e) {
        var buffer = e.inputBuffer.getChannelData(0); //获得缓冲区的输入音频，转换为包含了PCM通道数据的32位浮点数组
        //创建变量并迭代来获取最大的音量值
        var maxVal = 0;
        for (var i = 0; i < buffer.length; i++) {
            if (maxVal < buffer[i]) {
                maxVal = buffer[i];
            }
        }
        //显示音量值
        mystatus.innerHTML = "您的音量值：" + Math.round(maxVal * 100);
        if (maxVal > .5) {
            //当音量值大于0.5时，显示“声音太响”字样，并断开音频连接
            mystatus.innerHTML = "您的声音太响了!!";
            // liveSource.disconnect(levelChecker);
        }

        //显示音量值
        mystatus.innerHTML = "您的音量值：" + Math.round(maxVal * 100);
        //把分析出来的波形绘制到canvas上
        //清空画布
        const { width, height } = cvs;
        ctx.clearRect(0, 0, width, height);




        //让分析器节点分析出数据到数组中
        analyser.getByteFrequencyData(dataArray)
        const len = dataArray.length;
        const barwidth =  1.5
        ctx.fillStyle = 'rgba(2,49,213,0.95)'
        for (let i = 0; i < len; i++) {
            const data = dataArray[i]; //<256
            const barHeight = data / 450 * height
            const x1 = i * barwidth + width / 2;
            const x2 = width / 2 - (i + 1) * barwidth;
            const y = height / 2
            ctx.fillRect(x1, y, barwidth - 1, barHeight)
            ctx.fillRect(x1, y, barwidth - 1, -barHeight)
            ctx.fillRect(x2, y, barwidth - 1, barHeight)
            ctx.fillRect(x2, y, barwidth -1, -barHeight)
        }


    }

    // 将音量节点连上缓存节点，换言之，音量节点是输入
    // 和输出的中间环节。
    volume.connect(recorder);

    // 将缓存节点连上输出的目的地，可以是扩音器，也可以
    // 是音频文件。
    recorder.connect(audCtx.destination);



}