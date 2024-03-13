import cv2
import time
import json
import base64
from flask import Flask
from flask import render_template
from flask import Flask, render_template, Response,send_file
from flask import Flask, request, jsonify
from application.guesture_model import gesTure
from mediapipe.tasks import python
from application.face_model import  Face_recognize
from mediapipe.tasks.python import vision
# from tencentcloud.common import credential
# from tencentcloud.common.profile.http_profile import HttpProfile
# from tencentcloud.common.exception.tencent_cloud_sdk_exception import TencentCloudSDKException
# from tencentcloud.common.profile.client_profile import ClientProfile
# from tencentcloud.iai.v20200303 import iai_client, models

# STEP 2: Create an GestureRecognizer object.一定要放在函数外面
base_options = python.BaseOptions(model_asset_path='./application/gesture_recognizer.task')
options = vision.GestureRecognizerOptions(base_options=base_options)
recognizer = vision.GestureRecognizer.create_from_options(options)

app = Flask(__name__)


camera1 = cv2.VideoCapture(0)
# camera1 = cv2.VideoCapture(0)
x = gesTure(recognizer)
face_model = Face_recognize()

def guesture_recognition(recognizer):

    res = x.Control()

    return res


def face_recognition():

    return face_model.show()


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/video_feed0')
def video_feed0():

    return Response(guesture_recognition(recognizer),mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/guesture_index')
def guesture_index():
    def generate():
        with app.app_context():  # 创建应用上下文
            status = 2
            name = 'N'
            while True:
                name = x.name
                if x.status == 1:
                    status = 1
                elif x.status == 2:
                    status = 2

                # result=json.dumps(json_dict,ensure_ascii=False)
                data = json.dumps({"status": status, "name": name},ensure_ascii=False)
                yield 'data: {}\n\n'.format(data)
            # yield 'data: {}\n\n'.format(status)  # 发送状态数据
    return Response(generate(), mimetype='text/event-stream')

@app.route('/face_video_feed')
def face_video_feed():
    return Response(face_recognition(),mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/get_face_info')
def get_face_info():
    def generate_face_info():
        while True:
            with app.app_context():
                data = face_model.face_info
                yield 'data: {}\n\n'.format(json.dumps(data))
    return Response(generate_face_info(),mimetype='text/event-stream')

@app.route('/download')
def download_file():
    filename = 'test1.txt'  # 文件的路径
    return send_file(filename, as_attachment=True)


if __name__ == "__main__":
    app.run( host='0.0.0.0', port=8080, debug=True)