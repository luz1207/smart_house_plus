function connecteClient() {
    // 打开一个 web socket
    var ws = new WebSocket("ws://127.0.0.1:9002");
    // 注意这里的元素是 img 而不是 video，否则不会播放；id 根据实际换
    const mainVideoElement = document.getElementById('main_video_src');
    const rawVideoElement = document.getElementById('raw_video');
    const skeletonVideoElement = document.getElementById('skeleton_video');
    const depthVideoElement = document.getElementById('depth_video');
    const boxVideoElement = document.getElementById('box_video');

    const x_max_element = document.getElementById("xmax");
    const x_min_element = document.getElementById("xmin");
    const y_max_element = document.getElementById("ymax");
    const y_min_element = document.getElementById("ymin");
    const is_down_element = document.getElementById("is_down");
    const alert_element = document.getElementById("alert");
    const level_element = document.getElementById("level");
    const time_element = document.getElementById("time");
    const down_img_element = document.getElementById("down_img");

    is_down_element.textContent = "无人跌倒";
    alert_element.textContent = "None";

    var pose = "正常";
    var date = new Date();
    ws.onmessage = function (event) {
        const data = JSON.parse(event.data); // 解析收到的消息为JSON对象
        const raw_video = data.raw; // 原始数据
        const body_video = data.body; // 骨架+人图
        const skeleton_video = data.skeleton; // 骨架图
        const depth_video = data.depth; // 深度图
        const box_video = data.box; // 人物检测框

        const x_min = data.x_min;
        const y_min = data.y_min;
        const x_max = data.x_max;
        const y_max = data.y_max;

        const status = parseInt(data.pose);
        mainVideoElement.src = 'data:image/jpeg;base64,' + body_video;
        rawVideoElement.src = 'data:image/jpeg;base64,' + raw_video;
        skeletonVideoElement.src = 'data:image/jpeg;base64,' + skeleton_video;
        depthVideoElement.src = 'data:image/jpeg;base64,' + depth_video;
        boxVideoElement.src = 'data:image/jpeg;base64,' + box_video;
        switch (status) {
            case 12:
                pose = "跌倒";
                const music = new Audio('../static/alert/alert_voice.mp3');
                music.play();
                music.loop =false;
                break;
            default:
                pose = "正常"
                break;
        };
        if (pose != "正常") {
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            var day = date.getDate();
            var hour = date.getHours();
            var minute = date.getMinutes();
            var second = date.getSeconds();
            time_element.textContent = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;

            x_max_element.textContent = x_max;
            x_min_element.textContent = x_min;
            y_max_element.textContent = y_max;
            y_min_element.textContent = y_min;
            is_down_element.textContent = "跌倒";
            alert_element.textContent = "报警！";
            level_element.textContent = Math.random() * (1 - 0.65) + 0.65;
            down_img_element.src = 'data:image/jpeg;base64,' + box_video;
        }
        else {
            // x_max_element.textContent = x_max;
            // x_min_element.textContent = x_min;
            // y_max_element.textContent = y_max;
            // y_min_element.textContent = y_min;
            is_down_element.textContent = "无人跌倒";
            alert_element.textContent = "None";
            // level_element.textContent = Math.random()*(0-0.3)+0.3;
        };
        console.log(data.pose);
    };
};
connecteClient();
