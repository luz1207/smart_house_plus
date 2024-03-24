import cv2
import time
import dlib
import numpy as np
import face_recognition
from statistics import mode
from datetime import datetime
from imutils import face_utils
from keras.models import load_model
from utils.datasets import get_labels
from utils.inference import draw_text
from utils.inference import apply_offsets
from utils.inference import draw_bounding_box
from utils.preprocessor import preprocess_input


# parameters for loading data and images
emotion_model_path = './application/emotion_model.hdf5'
emotion_labels = get_labels('fer2013')

# hyper-parameters for bounding boxes shape
frame_window = 10
emotion_offsets = (20, 40)

# loading models
detector = dlib.get_frontal_face_detector()
emotion_classifier = load_model(emotion_model_path)

emotion_target_size = emotion_classifier.input_shape[1:3]
# starting lists for calculating modes
emotion_window = []

class Face_recognize:
    #初始化
    def __init__(self):
        # 公仔图片
        # self.img_tmp = face_recognition.load_image_file("test.jpg")
        self.face_info=[]
        self.emotion = 'None'
        self.probability = 'None'

    #建立人脸库
    def save_data(self):
        face_database = {
            "Zeng": "zeng.jpg",
            "Huang": "huang.jpg",
            # 添加更多人脸和对应的图像路径
        }
        known_face_encodings = []
        known_face_names = []
        known_faces=[]
        for name, face_image_path in face_database.items():
            #923*1027
            image = face_recognition.load_image_file(face_image_path)
            face_encoding = face_recognition.face_encodings(image)[0]#?
            known_faces.append(image)
            known_face_encodings.append(face_encoding)
            known_face_names.append(name)
        data = {
            'known_faces': known_faces,
            'known_face_names': known_face_names,
            'known_face_encodings':known_face_encodings
        }
        np.save('data.npy', data)
    def load_face_database(self):
        data = np.load('./static/face_library/data.npy', allow_pickle=True).item()
        self.known_faces = data['known_faces']
        self.known_face_names = data['known_face_names']
        self.known_face_encodings = data['known_face_encodings']
        self.kown_faces_path=[ "zeng.jpg", "huang.jpg"]
    def process_frame(self, frame):

        small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
        rgb_small_frame = small_frame[:, :, ::-1]

        face_locations = face_recognition.face_locations(rgb_small_frame)
        face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)

        face_names = []
        min_distances=[]
        best_match_index=None
        flag=0
        #检测到的每一个人
        for face_encoding in face_encodings:
            matches = face_recognition.compare_faces(self.known_face_encodings, face_encoding, tolerance=0.4)
            name = "Unknown"


            face_distances = face_recognition.face_distance(self.known_face_encodings, face_encoding)#长度是人脸库的长度
            best_match_index = np.argmin(face_distances)
            min_distance = min(face_distances)

            if matches[best_match_index] and min_distance < 0.5:
                flag=1
                name = self.known_face_names[best_match_index]

            face_names.append(name)
            min_distances.append(min_distance)
        #返回最后检测到的人
        return face_locations, face_names, min_distances, best_match_index,flag

    def show(self,cap):
        # self.save_data()
        self.load_face_database()
        # cap = cv2.VideoCapture(0)
        self.pTime = 0

        times = []

        while cap.isOpened():
            ret, frame = cap.read()
            if ret:
                frame = cv2.flip(frame, 1)
                face_locations, face_names, min_distances, best_match_index ,flag= self.process_frame(frame)
                for (top, right, bottom, left), name in zip(face_locations, face_names):

                    # 获取当前时间
                    current_datetime = datetime.now()

                    # 将日期和时间格式化为字符串
                    formatted_datetime = current_datetime.strftime("%Y-%m-%d %H:%M:%S")
                    times.append(formatted_datetime)

                    top *= 4
                    right *= 4
                    bottom *= 4
                    left *= 4
                    cv2.rectangle(frame, (left, top), (right, bottom), (0, 0, 255), 2)
                    cv2.rectangle(frame, (left, bottom - 35), (right, bottom), (0, 0, 255), cv2.FILLED)
                    font = cv2.FONT_HERSHEY_DUPLEX
                    cv2.putText(frame, name, (left + 6, bottom - 6), font, 1.0, (255, 255, 255), 1)
                self.Frame_Rate()
                #没检测到人
                if not face_locations:
                    #帧率，检测到的人脸个数，名字，距离，人脸库中对应的图片（没有匹配的返回公仔self.img_tmp）
                    self.face_info=[self.fps, len(face_locations), -1, "None","None"]
                    # print(self.fps, len(face_locations), None, None)
                    # print(self.face_info)
                else:
                    #有匹配的人,face_names是检测到的所有人的名字，min_distances是检测到的所有人的距离，每一个检测到的人的时间都用网页当前时间表示
                    if flag:
                        #检测到的每个人的信息：face_names，min_distances一一对应
                        #只 打印检测到的最后一个人的信息
                        self.face_info=[self.fps, len(face_locations), face_names, min_distances,times]
                        # print(self.fps, len(face_locations), face_names, min_distances)
                        # print(self.face_info)
                    else:
                        self.face_info=[self.fps, len(face_locations), face_names, min_distances,times]
                        # print(self.face_info)

                _, buffer = cv2.imencode('.jpg', frame)
                frame = buffer.tobytes()

                times = []

                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
            else:
                pass
    #显示FPS
    def Frame_Rate(self):
        self.cTime = time.time()  # 处理完一帧图像的时间
        self.fps = 1 / (self.cTime - self.pTime)
        self.pTime = self.cTime #重置起始时间
        # cv2.putText(self.img,str(int(self.fps)),(70,40),cv2.FONT_HERSHEY_PLAIN,3,(255,0,0),3)

    def detect_emotion(self,cap):
        while cap.isOpened(): # True:
            ret, frame = cap.read()
            if ret:
                frame = cv2.flip(frame, 1)
                gray_image = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                rgb_image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

                faces = detector(rgb_image)

                if len(faces)==0 :
                    self.emotion = 'undetected'
                else:
                    for face_coordinates in faces:
                        # print ("forrrrr")
                        x1, x2, y1, y2 = apply_offsets(face_utils.rect_to_bb(face_coordinates), emotion_offsets)
                        gray_face = gray_image[y1:y2, x1:x2]
                        try:
                            gray_face = cv2.resize(gray_face, (emotion_target_size))
                        except:
                            continue


                        gray_face = preprocess_input(gray_face, True)
                        gray_face = np.expand_dims(gray_face, 0)
                        gray_face = np.expand_dims(gray_face, -1)

                        emotion_prediction = emotion_classifier.predict(gray_face)

                        self.probability = [float(item) for sublist in emotion_prediction for item in sublist]

                        emotion_probability = np.max(emotion_prediction)
                        emotion_label_arg = np.argmax(emotion_prediction)
                        emotion_text = emotion_labels[emotion_label_arg]
                        emotion_window.append(emotion_text)

                        if len(emotion_window) > frame_window:
                            emotion_window.pop(0)
                        try:
                            emotion_mode = mode(emotion_window)
                        except:
                            continue

                        if emotion_text == 'angry':
                            color = emotion_probability * np.asarray((255, 0, 0))
                            self.emotion = 'angry'
                        elif emotion_text == 'sad':
                            color = emotion_probability * np.asarray((0, 0, 255))
                            self.emotion = 'sad'
                        elif emotion_text == 'happy':
                            color = emotion_probability * np.asarray((255, 255, 0))
                            self.emotion = 'happy'
                        elif emotion_text == 'surprise':
                            color = emotion_probability * np.asarray((0, 255, 255))
                            self.emotion = 'surprise'
                        elif emotion_text == 'disgust':
                            color = emotion_probability * np.asarray((100, 200, 255))
                            self.emotion = 'disgust'
                        elif emotion_text == 'fear':
                            color = emotion_probability * np.asarray((200, 200, 100))
                            self.emotion = 'fear'
                        elif emotion_text == 'neutral':
                            color = emotion_probability * np.asarray((167, 24, 188))
                            self.emotion = 'neutral'
                        else:
                            color = emotion_probability * np.asarray((0, 255, 0))
                            self.emotion = 'undetected'

                        color = color.astype(int)
                        color = color.tolist()


                        name = emotion_text

                        draw_bounding_box(face_utils.rect_to_bb(face_coordinates), rgb_image, color)
                        draw_text(face_utils.rect_to_bb(face_coordinates), rgb_image, name,
                                  color, 0, -45, 0.5, 1)

                frame = cv2.cvtColor(rgb_image, cv2.COLOR_RGB2BGR)

                _, buffer = cv2.imencode('.jpg', frame)
                frame = buffer.tobytes()

                # 指定字节流类型image/jpeg
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
