import time
import cv2
import face_recognition
import numpy as np


class Face_recognize:
    #初始化
    def __init__(self):
        # 公仔图片
        # self.img_tmp = face_recognition.load_image_file("test.jpg")
        self.face_info=[]

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

    def show(self):
        # self.save_data()
        self.load_face_database()
        cap = cv2.VideoCapture(0)
        self.pTime = 0

        while cap.isOpened():
            ret, frame = cap.read()
            if ret:
                frame = cv2.flip(frame, 1)
                face_locations, face_names, min_distances, best_match_index ,flag= self.process_frame(frame)
                for (top, right, bottom, left), name in zip(face_locations, face_names):
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
                    self.face_info=[self.fps, len(face_locations), "None", "None"]
                    print(self.fps, len(face_locations), None, None)
                else:
                    #有匹配的人,face_names是检测到的所有人的名字，min_distances是检测到的所有人的距离，每一个检测到的人的时间都用网页当前时间表示
                    if flag:
                        #检测到的每个人的信息：face_names，min_distances一一对应
                        #只 打印检测到的最后一个人的信息
                        self.face_info=[self.fps, len(face_locations), face_names, min_distances]
                        print(self.fps, len(face_locations), face_names, min_distances)
                    else:
                        self.face_info=[self.fps, len(face_locations), face_names, min_distances]
                        print(self.fps, len(face_locations), face_names, min_distances)

                _, buffer = cv2.imencode('.jpg', frame)
                frame = buffer.tobytes()

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