// 创建一个 EventSource 对象来连接到服务器上的 /get_face_info 路由
const eventSource = new EventSource('/get_face_info');


// 监听 message 事件，当接收到新的数据时触发
eventSource.onmessage = function(event) {
    // 解析收到的 JSON 数据
    const data = JSON.parse(event.data);

    // 在这里处理收到的数据，比如更新页面上的内容
    console.log(data); // 在控制台打印收到的数据
};