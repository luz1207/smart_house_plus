function connecteClient() {
    // 打开一个 web socket
    var ws = new WebSocket("ws://127.0.0.1:9002");
    // 注意这里的元素是 img 而不是 video，否则不会播放；id 根据实际换
    const videoElement = document.getElementById('input_pose_video');
    ws.onmessage = function (event) {
        const data = JSON.parse(event.data); // 解析收到的消息为JSON对象
        const videoData = data.video; // 视频数据
        const otherData = data.other; // 其他数据比如坐姿状态，根据需要从 c++ 代码那边传，用于后续处理
        videoElement.src = 'data:image/jpeg;base64,' + videoData; // 更新图像元素的src属性
    };
}
connecteClient();
