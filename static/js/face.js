// 创建一个 EventSource 对象来连接到服务器上的 /get_face_info 路由
const eventSource = new EventSource('/get_face_info');
const eventSource_emotion = new EventSource('/get_emotion_info')
var globle_index = 0

// 监听 message 事件，当接收到新的数据时触发
eventSource.onmessage = function(event) {
    // 解析收到的 JSON 数据
    const data = JSON.parse(event.data);

    // 在这里处理收到的数据，比如更新页面上的内容
    // console.log(data); // 在控制台打印收到的数据
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
                console.log("列表中除了 'Unknown' 以外还有其他元素");
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
            console.log("列表中不包含 'Unknown'");
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

var flag = 0;

eventSource_emotion.onmessage = function (event1){
    const emotion_data = JSON.parse(event1.data);
    const probability = emotion_data.probability;
    const emotion = emotion_data.emotion;

    const max_len = 200
    const angry_bar = document.getElementById("angrybar");
    angry_bar.style.width = probability[0]*max_len + 'px';
    console.log(probability[0]*max_len)
    const disgustbar_bar = document.getElementById("disgustbar");
    disgustbar_bar.style.width = probability[1]*max_len + 'px';
    const fear_bar = document.getElementById("fearbar");
    fear_bar.style.width = probability[2]*max_len + 'px';
    const happy_bar = document.getElementById("happybar");
    happy_bar.style.width = probability[3]*max_len + 'px';
    const sad_bar = document.getElementById("sadbar");
    sad_bar.style.width = probability[4]*max_len + 'px';
    const surprise_bar = document.getElementById("surprisebar");
    surprise_bar.style.width = probability[5]*max_len + 'px';
    const neutral_bar = document.getElementById("neutralbar");
    neutral_bar.style.width = probability[6]*max_len + 'px';

    if (flag === 0){
        if(emotion === 'happy'){
            const happy_music = new Audio('./sing/happy.mp3');
            happy_music.play();
            console.log("happy")
            flag = 1 ;
        }
        else if(emotion === 'sad'){
            const sad_music = new Audio('./sing/sad.mp3');
            sad_music.play();
            flag = 1 ;
        }
    }

};

function transposeLag() {
    // 这里是转置 lag 的代码，你需要根据你的需求来实现
    console.log("Transposing lag...");
    if(flag === 1){
        flag =0
    }
}

// 每隔五分钟执行一次 transposeLag 函数
setInterval(transposeLag, 2 * 60 * 1000); // 五分钟的毫秒数


