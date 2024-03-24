// 创建一个 EventSource 对象来连接到服务器上的 /get_face_info 路由
const eventSource = new EventSource('/get_face_info');
const eventSource_emotion = new EventSource('/get_emotion_info')
var globle_index = 0

// 监听 message 事件，当接收到新的数据时触发
eventSource.onmessage = function(event) {
    // 解析收到的 JSON 数据
    const data = JSON.parse(event.data);

    // 在这里处理收到的数据，比如更新页面上的内容
    // 在页面上显示帧率
    document.getElementById('fpsDisplay').innerText = '帧率：' + Math.floor(data[0]); // 假设第一个数据是帧率

    //检测到的人脸
    const imgElement = document.getElementById("verify_img");
    const verify_status = document.getElementById("verify_status");
    const name_show = document.getElementById('nameDisplay');
    const num = document.getElementById('numdisplay')
    const distance = document.getElementById('distdisplay')

    face_names = data[2]

    if (face_names === -1){
        //未检测到人脸
        imgElement.src = "./images/face/no_detect.png";
        verify_status.innerText = "未检测到人脸";
        name_show.innerText = '人脸：' +"无";
        num.innerText = '个数：' + 0
        distance.innerText = '距离：'+ -1
    }
    else{
        //检测到人脸
        if (face_names.includes("Unknown")) {
            // 列表中包含 "Unknown" 元素，需要弹出提示窗口
            if (face_names.some(name => name !== "Unknown")) {
                // 列表中除了 "Unknown" 以外还有其他元素
                const filteredNames = face_names.filter(name => name !== "Unknown");
                name_show.innerText = '人脸：' + filteredNames[face_names.length - 1]; // 假设第一个数据是帧率
                imgElement.src = "./face_library/"+filteredNames[face_names.length - 1]+".jpg";
                verify_status.innerText = "认证成功人脸";
                num.innerText = '个数：' + face_names.length
                distance.innerText = '距离：'+ Math.min(...data[3]).toFixed(2);
            }
            else{
                name_show.innerText = '人脸：' + "未知";
                imgElement.src = "./images/face/error.png"
                verify_status.innerText = "识别失败";
                num.innerText = '个数：' + face_names.length
                distance.innerText = '距离：'+Math.min(...data[3]).toFixed(2);
            }
        } else {
            // 列表中不包含 "Unknown" 元素
            name_show.innerText = '人脸：' + face_names[face_names.length - 1]; // 假设第一个数据是帧率
            imgElement.src = "./face_library/"+face_names[face_names.length - 1]+".jpg";
            verify_status.innerText = "认证成功";
            num.innerText = '个数：' + face_names.length
            distance.innerText = '距离：'+ Math.min(...data[3]).toFixed(2);
        }
    }

    //动态更新表格数据
    function updateTable() {
        var table = document.getElementById('record');
        if(data[2] !== -1){
            //检测到人脸

            for (const name of data[2]) {
                if (!isNameExistInTable(name)) {

                    const rowCount = table.rows.length - 1;
                    if (rowCount < 4) {

                        var row = table.insertRow(-1);// 在最后一行插入新行
                        var cell = row.insertCell(0);
                        cell.innerHTML = rowCount + 1; // 序号从1开始
                        cell = row.insertCell(1);
                        cell.innerHTML = data[4][0].split(" ")[0]+"_"+globle_index; //标识
                        globle_index=globle_index+1;
                        cell = row.insertCell(2);
                        cell.innerHTML = data[2][0]; //名字
                        cell = row.insertCell(3);
                        cell.innerHTML = data[4][0].split(" ")[1]; //时间
                        cell = row.insertCell(4);
                        cell.innerHTML = data[3][0].toFixed(2); //距离
                    }
                    else{
                        //删除第一行
                    }
                }
            }
        }
    }




    updateTable()
    // 检查姓名是否已经存在于表格中
    function isNameExistInTable(name) {
        const table = document.getElementById('record');
        for (let i = 1; i < table.rows.length; i++) {
            if (table.rows[i].cells[2].innerText === name) {
                return true;
            }
        }
        return false;
    }



    const divObj=document.getElementById('show_time');
    setInterval(()=>{
        const nowTime=getNowTime();
        divObj.innerText='时间：'+nowTime;
    })

    function getNowTime(){
        const date=new Date();
        const year=date.getFullYear();
        const month=date.getMonth()+1;
        const day=date.getDate();
        const hour=date.getHours();
        const minite=date.getMinutes();
        const seconds=date.getSeconds();
        return `${year}-${month}-${day} ${hour}:${minite}:${seconds<10?'0'+seconds:seconds}`
    }

};

var flag1 = 0;
var emotion_value;
var detected_play = false


eventSource_emotion.onmessage = function (event1){
    const emotion_data = JSON.parse(event1.data);
    const emotion = emotion_data.emotion;
    var probability;

    const max_len = 200
    if(emotion !== 'None'){
        probability = emotion_data.probability;
    }
    else{
        probability =[0,0,0,0,0,0,0];
    }

    const angry_bar = document.getElementById("angrybar");
    angry_bar.style.width = probability[0]*max_len + 'px';
    document.getElementById('angry_num').innerText = probability[0].toFixed(2)
    const disgustbar_bar = document.getElementById("disgustbar");
    disgustbar_bar.style.width = probability[1]*max_len + 'px';
    document.getElementById('disgust_num').innerText = probability[1].toFixed(2)
    const fear_bar = document.getElementById("fearbar");
    fear_bar.style.width = probability[2]*max_len + 'px';
    document.getElementById('fear_num').innerText = probability[2].toFixed(2)
    const happy_bar = document.getElementById("happybar");
    happy_bar.style.width = probability[3]*max_len + 'px';
    document.getElementById('happy_num').innerText = probability[3].toFixed(2)
    const sad_bar = document.getElementById("sadbar");
    sad_bar.style.width = probability[4]*max_len + 'px';
    document.getElementById('sad_num').innerText = probability[4].toFixed(2)
    const surprise_bar = document.getElementById("surprisebar");
    surprise_bar.style.width = probability[5]*max_len + 'px';
    document.getElementById('surprise_num').innerText = probability[5].toFixed(2)
    const neutral_bar = document.getElementById("neutralbar");
    neutral_bar.style.width = probability[6]*max_len + 'px';
    document.getElementById('neutral_num').innerText = probability[6].toFixed(2)

    if(emotion === 'angry'){
        emotion_value = 1;
    } else if(emotion === 'disgust'){
        emotion_value = 2;
    } else if(emotion === 'fear'){
        emotion_value = 3;
    } else if(emotion === 'happy'){
        emotion_value = 4;
    } else if(emotion === 'sad'){
        emotion_value = 5;
    } else if(emotion === 'surprise'){
        emotion_value = 6;
    } else if(emotion === 'neutral'){
        emotion_value = 7;
    } else {
        emotion_value = 0;
    }

    const names = ["angry", "disgust", "fear","happy","sad","surprise","neutral"];
    const probabilityData = probability.map((value, index) => {
        return { value: (value * 1000).toFixed(2), name: names[index] };
    });
    setInterval(() => graph_pie(probabilityData), 1000);

};

function transposeLag() {
    // 这里是转置 lag 的代码，你需要根据你的需求来实现
    console.log("Transposing lag...");
    if(flag1 === 1){
        flag1 =0
    }
}

// 每隔五分钟执行一次 transposeLag 函数
setInterval(transposeLag, 2 * 60 * 1000); // 五分钟的毫秒数

const data = [];

function chart_test() {
    // 画出情绪折线图
    var current_time = getCurrentTime();
    var chartDom = document.getElementById('emotion_line');

    var myChart = echarts.init(chartDom);
    var option;

    var current_emotion = emotion_value;

    // 添加当前时间和情绪值到数据列表中
    data.push([current_time, current_emotion]);
    if (data.length > 20) {
        data.shift(); // 删除最旧的数据，保留最新的十条数据
    }

    const dateList = data.map(function (item) {
        return item[0];
    });
    const valueList = data.map(function (item) {
        return item[1];
    });

    option = {
        // Make gradient line here
        visualMap: [
            {
                show: false,
                type: 'continuous',
                seriesIndex: 0,
                min: 0,
                max: 7
            }
        ],
        title: [
            {
                left: 'center',
                text: 'Emotion Record List'
            }
        ],
        tooltip: {
            trigger: 'axis'
        },
        xAxis: [
            {
                data: dateList
            }
        ],
        yAxis: [
            {
                type: 'category',
                data: ['undetected','angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral'],
                axisLabel: {
                    interval: 0, // 强制显示所有标签
                    formatter: function (value) {
                        return value.toString(); // 将标签转换为字符串
                    }
                }
            }
        ],
        grid: [
            {
                bottom: '20%',
                left: '15%'
            }
        ],
        series: [
            {
                type: 'line',
                showSymbol: false,
                data: valueList
            }
        ]
    };

    myChart.setOption(option);
}



function getCurrentTime() {
    const currentDate = new Date();
    const hours = addLeadingZero(currentDate.getHours());
    const minutes = addLeadingZero(currentDate.getMinutes());
    const seconds = addLeadingZero(currentDate.getSeconds());
    return `${hours}:${minutes}:${seconds}`;
}

// 添加前导零
function addLeadingZero(number) {
    return number < 10 ? "0" + number : number;
}

// 每隔一分钟执行一次更新函数
setInterval(chart_test, 1000); // 一分钟为间隔


function graph_pie(data){
    var piechartDom = document.getElementById('emotion_pie');
    var pieChart = echarts.init(piechartDom);
    var option;

    option = {
        legend: {
            top: 'bottom'
        },
        toolbox: {
            show: true,
            feature: {
                mark: { show: true },
                dataView: { show: true, readOnly: false },
                restore: { show: true },
                saveAsImage: { show: true }
            }
        },
        series: [
            {
                name: 'Nightingale Chart',
                type: 'pie',
                radius: [20, 100],
                center: ['50%', '50%'],
                roseType: 'area',
                itemStyle: {
                    borderRadius: 8
                },
                data: data,
                tooltip: {
                    formatter: '{d}%' // 只显示百分比
                }
            }
        ]
    };
    option && pieChart.setOption(option);
}


var is_play = 0;

$(function(){
    var playerContent1 = $('#player-content1');// 歌曲信息模块部分dom元素
    var musicName = $('.music-name');          // 歌曲名部分dom元素
    var artistName = $('.artist-name');        // 歌手名部分dom元素

    var musicImgs = $('.music-imgs');          // 左侧封面图dom元素
    // musicImgs.css('background-size', 'contain');

    var playPauseBtn = $('.play-pause');       // 播放/暂停按钮 dom元素
    var playPrevBtn = $('.prev');              // 上一首按钮 dom元素
    var playNextBtn = $('.next')               // 下一首按钮 dom元素

    var time = $('.time');                     // 时间信息部分 dom元素
    var tProgress = $('.current-time');        // 当前播放时间文本部分 dom元素
    var totalTime = $('.total-time');          // 歌曲总时长文本部分 dom元素

    var sArea = $('#s-area');                  // 进度条部分
    var insTime = $('#ins-time');              // 鼠标移动至进度条上面，显示的信息部分
    var sHover = $('#s-hover');                // 鼠标移动至进度条上面，前面变暗的进度条部分
    var seekBar = $('#seek-bar');              // 播放进度条部分

    // 一些计算所需的变量
    var seekT, seekLoc, seekBarPos, cM, ctMinutes, ctSeconds, curMinutes, curSeconds, durMinutes, durSeconds, playProgress, bTime, nTime = 0
    var musicImgsData = ['./images/music_player.png','./images/music_player.png','./images/music_player.png']    // 图片地址数组
    var musicNameData = ['机器猫哆啦A梦','我怀念的','归去来兮'];                   // 歌曲名数组
    var artistNameData = ['花粥/王胜娚','花粥/马雨阳','花粥']            // 创作歌手数组
    var musicUrls=['sing/happy.mp3','sing/sad.mp3','sing/music3.mp3'];// 歌曲mp3数组

    var buffInterval = null          // 初始化定时器 判断是否需要缓冲
    var len = musicNameData.length;  // 歌曲长度


    // 点击 播放/暂停 按钮，触发该函数
    // 作用：根据audio的paused属性 来检测当前音频是否已暂停  true:暂停  false:播放中
    function playPause(){
        if(audio.paused ){

            playerContent1.addClass('active'); // 内容栏上移
            musicImgs.addClass('active');      // 左侧图片开始动画效果
            playPauseBtn.attr('class','btn play-pause icon-zanting iconfont') // 显示暂停图标
            // checkBuffering(); // 检测是否需要缓冲
            audio.play();     // 播放
        }
        else{
            playerContent1.removeClass('active'); // 内容栏下移
            musicImgs.removeClass('active');      // 左侧图片停止旋转等动画效果
            playPauseBtn.attr('class','btn play-pause icon-jiediankaishi iconfont'); // 显示播放按钮
            clearInterval(buffInterval);          // 清除检测是否需要缓冲的定时器
            musicImgs.removeClass('buffering');    // 移除缓冲类名
            audio.pause(); // 暂停
        }

    }


    // 鼠标移动在进度条上， 触发该函数
    function showHover(event){
        seekBarPos = sArea.offset();    // 获取进度条长度
        seekT = event.clientX - seekBarPos.left;  //获取当前鼠标在进度条上的位置
        seekLoc = audio.duration * (seekT / sArea.outerWidth()); //当前鼠标位置的音频播放秒数： 音频长度(单位：s)*（鼠标在进度条上的位置/进度条的宽度）

        sHover.width(seekT);  //设置鼠标移动到进度条上变暗的部分宽度

        cM = seekLoc / 60;    // 计算播放了多少分钟： 音频播放秒速/60

        ctMinutes = Math.floor(cM);  // 向下取整
        ctSeconds = Math.floor(seekLoc - ctMinutes * 60); // 计算播放秒数

        if( (ctMinutes < 0) || (ctSeconds < 0) )
            return;

        if( (ctMinutes < 0) || (ctSeconds < 0) )
            return;

        if(ctMinutes < 10)
            ctMinutes = '0'+ctMinutes;
        if(ctSeconds < 10)
            ctSeconds = '0'+ctSeconds;

        if( isNaN(ctMinutes) || isNaN(ctSeconds) )
            insTime.text('--:--');
        else
            insTime.text(ctMinutes+':'+ctSeconds);  // 设置鼠标移动到进度条上显示的信息

        insTime.css({'left':seekT,'margin-left':'-21px'}).fadeIn(0);  // 淡入效果显示

    }

    // 鼠标移出进度条，触发该函数
    function hideHover()
    {
        sHover.width(0);  // 设置鼠标移动到进度条上变暗的部分宽度 重置为0
        insTime.text('00:00').css({'left':'0px','margin-left':'0px'}).fadeOut(0); // 淡出效果显示
    }

    // 鼠标点击进度条，触发该函数
    function playFromClickedPos()
    {
        audio.currentTime = seekLoc; // 设置音频播放时间 为当前鼠标点击的位置时间
        seekBar.width(seekT);        // 设置进度条播放长度，为当前鼠标点击的长度
        hideHover();                 // 调用该函数，隐藏原来鼠标移动到上方触发的进度条阴影
    }

    // 在音频的播放位置发生改变是触发该函数
    function updateCurrTime()
    {
        nTime = new Date();      // 获取当前时间
        nTime = nTime.getTime(); // 将该时间转化为毫秒数

        // 计算当前音频播放的时间
        curMinutes = Math.floor(audio.currentTime  / 60);
        curSeconds = Math.floor(audio.currentTime  - curMinutes * 60);

        // 计算当前音频总时间
        durMinutes = Math.floor(audio.duration / 60);
        durSeconds = Math.floor(audio.duration - durMinutes * 60);

        // 计算播放进度百分比
        playProgress = (audio.currentTime  / audio.duration) * 100;

        // 如果时间为个位数，设置其格式
        if(curMinutes < 10)
            curMinutes = '0'+curMinutes;
        if(curSeconds < 10)
            curSeconds = '0'+curSeconds;

        if(durMinutes < 10)
            durMinutes = '0'+durMinutes;
        if(durSeconds < 10)
            durSeconds = '0'+durSeconds;

        if( isNaN(curMinutes) || isNaN(curSeconds) )
            tProgress.text('00:00');
        else
            tProgress.text(curMinutes+':'+curSeconds);

        if( isNaN(durMinutes) || isNaN(durSeconds) )
            totalTime.text('00:00');
        else
            totalTime.text(durMinutes+':'+durSeconds);

        if( isNaN(curMinutes) || isNaN(curSeconds) || isNaN(durMinutes) || isNaN(durSeconds) )
            time.removeClass('active');
        else
            time.addClass('active');

        // 设置播放进度条的长度
        seekBar.width(playProgress+'%');

        // 进度条为100 即歌曲播放完时
        if( playProgress == 100 )
        {
            playPauseBtn.attr('class','btn play-pause icon-jiedankaishi iconfont'); // 显示播放按钮
            seekBar.width(0);              // 播放进度条重置为0
            tProgress.text('00:00');       // 播放时间重置为 00:00
            musicImgs.removeClass('buffering').removeClass('active');  // 移除相关类名
            clearInterval(buffInterval);   // 清除定时器

            // selectTrack();  // 添加这一句，可以实现自动播放
        }
    }

    // 定时器检测是否需要缓冲
    function checkBuffering(){
        clearInterval(buffInterval);
        buffInterval = setInterval(function()
        {
            // 这里如果音频播放了，则nTime为当前时间毫秒数，如果没播放则为0；如果时间间隔过长，也将缓存
            if( (nTime == 0) || (bTime - nTime) > 1000  ){
                musicImgs.addClass('buffering');  // 添加缓存样式类
            } else{
                musicImgs.removeClass('buffering'); // 移除缓存样式类
            }

            bTime = new Date();
            bTime = bTime.getTime();

        },100);
    }

    // 点击上一首/下一首时，触发该函数。
    //注意：后面代码初始化时，会触发一次selectTrack(0)，因此下面一些地方需要判断flag是否为0
    function selectTrack(){
        audio = new Audio();
        // if( flag == 0 || flag == 1 ){  // 初始 || 点击下一首
        //     ++ currIndex;
        //     if(currIndex >=len){      // 当处于最后一首时，点击下一首，播放索引置为第一首
        //         currIndex = 0;
        //     }
        // }else{                    // 点击上一首
        //     --currIndex;
        //     if(currIndex<=-1){    // 当处于第一首时，点击上一首，播放索引置为最后一首
        //         currIndex = len-1;
        //     }
        // }


        if(emotion_value === 4 ){
            currIndex = 0;
            console.log('进入')
            currMusic = musicNameData[0];
            currArtist = artistNameData[0];
            currImg = musicImgsData[0];
            audio.src = musicUrls[0];
            playPauseBtn.attr('class','btn play-pause icon-jiediankaishi iconfont'); // 显示播放图标
            playerContent1.addClass('active'); // 内容栏上移
            musicImgs.addClass('active');      // 左侧图片开始动画效果
            playPauseBtn.attr('class','btn play-pause icon-zanting iconfont') // 显示暂停图标
            // checkBuffering(); // 检测是否需要缓冲
            audio.play();     // 播放
            $(audio).on('timeupdate',updateCurrTime);
            is_play = 1;
        }
        else if(emotion_value === 5){
            audio.src = musicUrls[1];
            flag = 0;
            playPauseBtn.attr('class','btn play-pause icon-jiediankaishi iconfont'); // 显示播放图标
            playerContent1.addClass('active'); // 内容栏上移
            musicImgs.addClass('active');      // 左侧图片开始动画效果
            playPauseBtn.attr('class','btn play-pause icon-zanting iconfont') // 显示暂停图标
            // checkBuffering(); // 检测是否需要缓冲
            audio.play();     // 播放
            $(audio).on('timeupdate',updateCurrTime);
            is_play = 1;
        }
        else{
            is_play = 1;
        }

            // if(audio.paused){
            //     playerContent1.removeClass('active'); // 内容栏下移
            //     musicImgs.removeClass('active');      // 左侧图片停止旋转等动画效果
            //     playPauseBtn.attr('class','btn play-pause icon-jiediankaishi iconfont'); // 显示播放按钮
            //     clearInterval(buffInterval);          // 清除检测是否需要缓冲的定时器
            //     musicImgs.removeClass('buffering');    // 移除缓冲类名
            //     audio.pause(); // 暂停
            // }

            // playerContent1.removeClass('active'); // 内容栏下移
            // musicImgs.removeClass('active');      // 左侧图片停止旋转等动画效果
            // playPauseBtn.attr('class','btn play-pause icon-jiediankaishi iconfont'); // 显示播放按钮
            // clearInterval(buffInterval);          // 清除检测是否需要缓冲的定时器
            // musicImgs.removeClass('buffering');    // 移除缓冲类名
            // audio.pause(); // 暂停




        // if( flag === 0 ){
        //     playPauseBtn.attr('class','btn play-pause icon-jiediankaishi iconfont'); // 显示播放图标
        // }else{
        //     musicImgs.removeClass('buffering');
        //     playPauseBtn.attr('class','btn play-pause icon-zanting iconfont') // 显示暂停图标
        // }


        // 获取当前索引的:歌曲名，歌手名，图片，歌曲链接等信息
        // currMusic = musicNameData[currIndex];
        // currArtist = artistNameData[currIndex];
        // currImg = musicImgsData[0];

        // 将歌手名，歌曲名，图片链接，设置到元素上
        artistName.text(currArtist);
        musicName.text(currMusic);
        musicImgs.find('.img').css({'background':'url('+currImg+')'})
        musicImgs.find('.img').css('width', '150px');
        musicImgs.find('.img').css('height', '150px');
        musicImgs.find('.img').css('position', 'absolute');
        musicImgs.find('.img').css('left', '-22%');
        musicImgs.find('.img').css('top', '-34%');
        musicImgs.find('.img').css('background-size', '100% 100%');

        nTime = 0;
        bTime = new Date();
        bTime = bTime.getTime();

        // 如果点击的是上一首/下一首 则设置开始播放，添加相关类名，重新开启定时器

            // if (flag === 0) {
            //     console.log('进入')
            //     playerContent1.addClass('active'); // 内容栏上移
            //     musicImgs.addClass('active');      // 左侧图片开始动画效果
            //     playPauseBtn.attr('class','btn play-pause icon-zanting iconfont') // 显示暂停图标
            //     checkBuffering(); // 检测是否需要缓冲
            //     audio.play();     // 播放
            //     $(audio).on('timeupdate',updateCurrTime);
            // }
            // // 进度条 移入/移出/点击 动作触发相应函数
            // sArea.mousemove(function(event){ showHover(event); });
            // sArea.mouseout(hideHover);
            // sArea.on('click',playFromClickedPos);





    }


    // 初始化函数
//     function initPlayer() {
//         audio = new Audio();  // 创建Audio对象
//         // selectTrack();       // 初始化第一首歌曲的相关信息
//
//         audio.loop = false;   // 取消歌曲的循环播放功能
//
// //        playPause();
//         playPauseBtn.on('click',playPause); // 点击播放/暂停 按钮，触发playPause函数
//
//         // 进度条 移入/移出/点击 动作触发相应函数
//         sArea.mousemove(function(event){ showHover(event); });
//         sArea.mouseout(hideHover);
//         sArea.on('click',playFromClickedPos);
//
//         // 实时更新播放时间
//         $(audio).on('timeupdate',updateCurrTime);
//
//         // 上下首切换
//         playPrevBtn.on('click',function(){ selectTrack(-1);} );
//         playNextBtn.on('click',function(){ selectTrack(1);});
//     }

    // 调用初始化函数
    setInterval(selectTrack, 1000);

});