import time
import cv2
import face_recognition
import numpy as np

class Face_recognize:
    #初始化
    def __init__(self):
        self.face_database={
            "Zeng": "./static/face_library/zeng.png",
            "Huang": "./static/face_library/huang.jpg",
            # 添加更多人脸和对应的图像路径
        }
    #主函数
    def show(self):
        known_face_encodings = []
        known_face_names = []
        known_faces=[]
        for name, face_image_path in self.face_database.items():
            #923*1027
            image = face_recognition.load_image_file(face_image_path)
            face_encoding = face_recognition.face_encodings(image)[0]#?
            known_faces.append(image)
            known_face_encodings.append(face_encoding)
            known_face_names.append(name)
        cap = cv2.VideoCapture(0)
        self.pTime = 0  # 设置第一帧开始处理的起始时间
        process_this_frame = True
        #帧数
        face_count = 0
        while cap.isOpened():
            red,frame = cap.read()#
            frame = cv2.flip(frame, 1)  # 镜头翻转

            if red:
                # Resize frame of video to 1/4 size for faster face recognition processing
                small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)

                # Convert the image from BGR color (which OpenCV uses) to RGB color (which face_recognition uses)
                rgb_small_frame = small_frame[:, :, ::-1]

                # Find all the faces and face encodings in the current frame of video
                face_locations = face_recognition.face_locations(rgb_small_frame)
                face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)

                face_names = []
                for face_encoding in face_encodings:
                    # See if the face is a match for the known face(s)
                    matches = face_recognition.compare_faces(known_face_encodings, face_encoding)
                    name = "Unknown"

                    # Or instead, use the known face with the smallest distance to the new face
                    face_distances = face_recognition.face_distance(known_face_encodings, face_encoding)
                    best_match_index = np.argmin(face_distances)
                    if matches[best_match_index]:
                        name = known_face_names[best_match_index]

                    face_names.append(name)

            process_this_frame = not process_this_frame

            # Display the results
            for (top, right, bottom, left), name in zip(face_locations, face_names):
                # Scale back up face locations since the frame we detected in was scaled to 1/4 size
                top *= 4
                right *= 4
                bottom *= 4
                left *= 4

                # Draw a box around the face
                cv2.rectangle(frame, (left, top), (right, bottom), (0, 0, 255), 2)

                # Draw a label with a name below the face
                cv2.rectangle(frame, (left, bottom - 35), (right, bottom), (0, 0, 255), cv2.FILLED)
                font = cv2.FONT_HERSHEY_DUPLEX
                cv2.putText(frame, name, (left + 6, bottom - 6), font, 1.0, (255, 255, 255), 1)
            self.Frame_Rate()
            # 返回帧率，检测到的人脸个数，最后一个检测到额脸的名字，最后一个检测到的人的距离，匹配的人脸库图像
            #(2.7813521006837494, 1, 'Zeng', 0.39615311230694766),图象是numpy
            # return self.fps,len(face_locations),name,min(face_distances),known_faces[best_match_index]
            ret, buffer = cv2.imencode('.jpg',frame)
            # 将缓存里的流数据转成字节流
            frame = buffer.tobytes()
            # 指定字节流类型image/jpeg
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')


    #显示FPS
    def Frame_Rate(self):
        self.cTime = time.time()  # 处理完一帧图像的时间
        self.fps = 1 / (self.cTime - self.pTime)
        self.pTime = self.cTime #重置起始时间
        # cv2.putText(self.img,str(int(self.fps)),(70,40),cv2.FONT_HERSHEY_PLAIN,3,(255,0,0),3)