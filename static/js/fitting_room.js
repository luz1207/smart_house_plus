function connecteClient() {
    // 打开一个 web socket
    var ws = new WebSocket("ws://127.0.0.1:9002");
    // 注意这里的元素是 img 而不是 video，否则不会播放；id 根据实际换
    const mainVideoElement = document.getElementById('main_video_src');
    const rawVideoElement = document.getElementById('raw_video');
    const shirtElement = document.getElementById('current_shirt');
    const pantElement = document.getElementById('current_pant');

    const shirt_name = document.getElementById('shirt_name');
    const shirt_price = document.getElementById('shirt_price');
    const shirt_material = document.getElementById('shirt_material');
    const shirt_type = document.getElementById('shirt_type');
    const shirt_color = document.getElementById('shirt_color');
    const shirt_time = document.getElementById('shirt_time');

    const pant_name = document.getElementById('pant_name');
    const pant_price = document.getElementById('pant_price');
    const pant_material = document.getElementById('pant_material');
    const pant_type = document.getElementById('pant_type');
    const pant_length = document.getElementById('pant_length');
    const pant_time = document.getElementById('pant_time');


    var shirts_info = {
        0: { "材料": "", "价格": "" },
        1: { "材料": "", "价格": "" },
        2: { "材料": "", "价格": "" },
        3: { "材料": "", "价格": "" },
        4: { "材料": "", "价格": "" },
        5: { "材料": "", "价格": "" },
    };
    var pants_info = {
        0: { "材料": "", "价格": "" },
        1: { "材料": "", "价格": "" },
        2: { "材料": "", "价格": "" },
        3: { "材料": "", "价格": "" },
        4: { "材料": "", "价格": "" },
        5: { "材料": "", "价格": "" },
    };
    ws.onmessage = function (event) {
        const data = JSON.parse(event.data); // 解析收到的消息为JSON对象
        const raw_video = data.raw; // 原始数据
        const cloth_video = data.cloth; // 衣服视频
        const current_shirt = data.shirt;
        const current_pant = data.pant;

        shirtElement.src = "../images/shirt" + current_shirt + ".png";
        pantElement.src = "../images/pant" + current_pant + ".png";

        mainVideoElement.src = 'data:image/jpeg;base64,' + cloth_video;
        rawVideoElement.src = 'data:image/jpeg;base64,' + raw_video;
    };
};
connecteClient();
