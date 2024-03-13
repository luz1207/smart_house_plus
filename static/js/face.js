// 创建一个 EventSource 对象来连接到服务器上的 /get_face_info 路由
const eventSource = new EventSource('/get_face_info');


// 监听 message 事件，当接收到新的数据时触发
eventSource.onmessage = function(event) {
    // 解析收到的 JSON 数据
    const data = JSON.parse(event.data);

    // 在这里处理收到的数据，比如更新页面上的内容
    console.log(data); // 在控制台打印收到的数据
    // 在页面上显示帧率
    document.getElementById('fpsDisplay').innerText = '帧率：' + Math.floor(data[0]); // 假设第一个数据是帧率

    //检测到的人脸
    const imgElement = document.getElementById("verify_img");
    const verify_status = document.getElementById("verify_status");
    const name_show = document.getElementById('nameDisplay');
    const num = document.getElementById('numdisplay')

    face_names = data[2]
    console.log(data[2])
    if (data[2] == 'None'){
        //未检测到人脸
        imgElement.src = "./images/face/scanning.gif";
        verify_status.innerText = "未检测到人脸";
        name_show.innerText = '人脸：' +"无";
    }
    else{
        //检测到人脸
        if (face_names.includes("Unknown")) {
            // 列表中包含 "Unknown" 元素，需要弹出提示窗口
            if (face_names.some(name => name !== "Unknown")) {
                // 列表中除了 "Unknown" 以外还有其他元素
                console.log("列表中除了 'Unknown' 以外还有其他元素");
                const filteredNames = face_names.filter(name => name !== "Unknown");
                name_show.innerText = '人脸：' + filteredNames[face_names.length - 1]; // 假设第一个数据是帧率
                imgElement.src = "./face_library/"+filteredNames[face_names.length - 1]+".jpg";
                verify_status.innerText = "认证成功人脸";
            }
            else{
                name_show.innerText = '人脸：' + "未知";
                imgElement.src = "./images/face/error.png"
                verify_status.innerText = "识别失败";
            }
        } else {
            // 列表中不包含 "Unknown" 元素
            console.log("列表中不包含 'Unknown'");
            name_show.innerText = '人脸：' + face_names[face_names.length - 1]; // 假设第一个数据是帧率
            imgElement.src = "./face_library/"+face_names[face_names.length - 1]+".jpg";
            verify_status.innerText = "认证成功";
        }
    }

};