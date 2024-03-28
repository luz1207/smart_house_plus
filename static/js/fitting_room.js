function connecteClient() {
    // 打开一个 web socket
    var ws = new WebSocket("ws://127.0.0.1:9002");
    // 注意这里的元素是 img 而不是 video，否则不会播放；id 根据实际换
    const mainVideoElement = document.getElementById('main_video_src');
    const rawVideoElement = document.getElementById('raw_video');
    const shirtElement = document.getElementById('current_shirt_info');
    const pantElement = document.getElementById('current_pant_info');

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
        0: { 材质: "棉", 价格: "60", 类型: "T恤", 领型: "圆形领口", 颜色: "粉色", 上市时间: "2024 春" },
        1: { 材质: "棉", 价格: "60", 类型: "T恤", 领型: "圆形领口", 颜色: "黄色", 上市时间: "2024 春" },
        2: { 材质: "聚酯纤维", 价格: "100", 类型: "衬衫", 领型: "翻领", 颜色: "浅蓝", 上市时间: "2024 春" },
        3: { 材质: "棉", 价格: "60", 类型: "T恤", 领型: "圆形领口", 颜色: "红色", 上市时间: "2024 春" },
        4: { 材质: "聚酯纤维", 价格: "200", 类型: "夹克", 领型: "翻领", 颜色: "黑色", 上市时间: "2024 春" },
        5: { 材质: "聚酯纤维", 价格: "150", 类型: "外套", 领型: "翻领", 颜色: "蓝色", 上市时间: "2024 春" },
    };
    var pants_info = {
        0: { 材质: "棉", 价格: "100", 类型: "长裤", 款式: "宽松直筒", 裤长: "100cm", 上市时间: "2024 春" },
        1: { 材质: "棉", 价格: "100", 类型: "牛仔裤", 款式: "宽松直筒", 裤长: "100cm", 上市时间: "2024 春" },
        2: { 材质: "棉", 价格: "100", 类型: "牛仔裤", 款式: "宽松直筒", 裤长: "100cm", 上市时间: "2024 春" },
        3: { 材质: "棉", 价格: "100", 类型: "长裤", 款式: "宽松直筒", 裤长: "100cm", 上市时间: "2024 春" },
        4: { 材质: "棉", 价格: "50", 类型: "短裤", 款式: "宽松直筒", 裤长: "50cm", 上市时间: "2024 春" },
        5: { 材质: "棉", 价格: "100", 类型: "长裤", 款式: "宽松直筒", 裤长: "100cm", 上市时间: "2024 春" },
    };
    ws.onmessage = function (event) {
        const data = JSON.parse(event.data); // 解析收到的消息为JSON对象
        const raw_video = data.raw; // 原始数据
        const cloth_video = data.cloth; // 衣服视频
        const current_shirt = data.shirt;
        const current_pant = data.pant;

        shirtElement.src = "../static/images/shirts/shirt" + current_shirt + ".png";
        pantElement.src = "../static/images/pants/pant" + current_pant + ".png";

        mainVideoElement.src = 'data:image/jpeg;base64,' + cloth_video;
        rawVideoElement.src = 'data:image/jpeg;base64,' + raw_video;

        shirt_name.textContent = shirts_info[current_shirt]["类型"];
        shirt_price.textContent = shirts_info[current_shirt]["价格"];
        shirt_material.textContent = shirts_info[current_shirt]["材质"];
        shirt_type.textContent = shirts_info[current_shirt]["领型"];
        shirt_color.textContent = shirts_info[current_shirt]["颜色"];
        shirt_time.textContent = shirts_info[current_shirt]["上市时间"];

        pant_name.textContent = pants_info[current_pant]["类型"];
        pant_price.textContent = pants_info[current_pant]["价格"];
        pant_material.textContent = pants_info[current_pant]["材质"];
        pant_type.textContent = pants_info[current_pant]["款式"];
        pant_length.textContent = pants_info[current_pant]["裤长"];
        pant_time.textContent = pants_info[current_pant]["上市时间"];
    };
    ws.onopen = function (event) {
        ws.send("3");
    }
};
connecteClient();
