function connecteClient() {
    // 打开一个 web socket
    var ws = new WebSocket("ws://127.0.0.1:9002");
    // 注意这里的元素是 img 而不是 video，否则不会播放；id 根据实际换
    const mainVideoElement = document.getElementById("main_video");
    const rawVideoElement = document.getElementById("sitting_video");
    const skeletonVideoElement = document.getElementById("standing_video");
    var pose = "正常";
    var standingInfoDivs = document.querySelectorAll(".standing_info");
    var sittingInfoDivs = document.querySelectorAll(".sitting_info");

    var audio = new Audio()

    ws.onmessage = function (event) {
        const data = JSON.parse(event.data); // 解析收到的消息为JSON对象
        const raw_video = data.raw; // 视频数据
        const body_video = data.body; // 其他数据比如坐姿状态，根据需要从 c++ 代码那边传，用于后续处理
        const skeleton_video = data.skeleton;
        const status = parseInt(data.pose);
        mainVideoElement.src = "data:image/jpeg;base64," + body_video; // 更新图像元素的src属性
        rawVideoElement.src = "data:image/jpeg;base64," + raw_video; // 更新图像元素的src属性
        skeletonVideoElement.src = "data:image/jpeg;base64," + skeleton_video; // 更新图像元素的src属性
        switch (status) {
            case 1:
                pose = "躺倒";
                audio.src = "../static/alert/sitting_tanbei.mp3";
                audio.play();
                audio.loop = false;
                break;
            case 2:
                pose = "驼背";
                audio.src = "../static/alert/sitting_tuobei.mp3";
                audio.play();
                audio.loop = false;
                break;
            case 3:
                pose = "低头";
                break;
            case 5:
            case 13:
                pose = "左倾";
                audio.src = "../static/alert/sitting_left.mp3";
                audio.play();
                audio.loop = false;
                break;
            case 6:
            case 14:
                pose = "右倾";
                audio.src = "../static/alert/sitting_right.mp3";
                audio.play();
                audio.loop = false;
                break;
            case 11:
                pose = "驼背";
            default:
                pose = "正常";
                break;
        }
        var glowing = document.getElementById("glowing");
        if (glowing != null) glowing.id = "no";
        if (pose != "正常") {
            if (status > 10) hightlight(standingInfoDivs, pose);
            else hightlight(sittingInfoDivs, pose);
        }
        console.log(data.pose);
    };
    ws.onopen = function (event) {
        ws.send("2");
    };
}
connecteClient();

function hightlight(type, name) {
    type.forEach(function (div) {
        let childDivs = div.querySelectorAll(".pose_label");
        childDivs.forEach(function (cdiv) {
            let divContent = cdiv.textContent;
            if (divContent.includes(name)) cdiv.id = "glowing";
        });
    });
}
