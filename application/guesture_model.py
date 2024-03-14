import cv2
import time
import mediapipe as mp
import math

from mediapipe.framework.formats import landmark_pb2

class gesTure:
    #初始化
    def __init__(self,recognizer):
        self.name = 'N'
        self.status = 0
        self.recognizer =recognizer
        self.mphands = mp.solutions.hands #mediapipe手部关键点检测的方法
        self.hands = self.mphands.Hands(min_detection_confidence=0.75,min_tracking_confidence=0.75)
        self.mpDraw = mp.solutions.drawing_utils #绘制手部关键点的连线的方法
        self.pointStyle = self.mpDraw.DrawingSpec(color=(255, 0, 255), thickness=4)  # 点的样式
        self.lineStyle = self.mpDraw.DrawingSpec(color=(0, 0, 255), thickness=4)  # 线的样式


    def display_batch_of_images_with_gestures_and_hand_landmarks(self,image, result):
        mp_hands = mp.solutions.hands
        mp_drawing = mp.solutions.drawing_utils
        mp_drawing_styles = mp.solutions.drawing_styles

        """Displays a batch of images with the gesture category and its score along with the hand landmarks."""
        # Images and labels.
        images = image.numpy_view()
        gestures = result[0]
        multi_hand_landmarks_list = result[1]

        # Auto-squaring: this will drop data that does not fit into square or square-ish rectangle.
        title = f"{gestures.category_name} ({gestures.score:.2f})"
        annotated_image = images.copy()

        for hand_landmarks in multi_hand_landmarks_list:
            hand_landmarks_proto = landmark_pb2.NormalizedLandmarkList()
            hand_landmarks_proto.landmark.extend([
                landmark_pb2.NormalizedLandmark(x=landmark.x, y=landmark.y, z=landmark.z) for landmark in hand_landmarks
            ])
            mp_drawing.draw_landmarks(
                annotated_image,
                hand_landmarks_proto,
                mp_hands.HAND_CONNECTIONS,
                mp_drawing_styles.get_default_hand_landmarks_style(),
                mp_drawing_styles.get_default_hand_connections_style())
        return annotated_image,title,gestures.category_name#放回输出的一张图像和对应的手势名字和分数,

    #主函数
    def Control(self):
        cap = cv2.VideoCapture(0)
        self.resize_w,self.resize_h= 640,480 #原窗口大小
        self.pTime = 0  # 设置第一帧开始处理的起始时间
        font = cv2.FONT_HERSHEY_SIMPLEX
        font_scale = 1
        color = (255, 0, 0)
        thickness = 2
        position = (50, 50)
        while cap.isOpened():
            red,self.img = cap.read()
            if red:
                img1 = cv2.flip(self.img, 1)  # 镜头翻转
                # 将图像数据转换为RGB格式
                image_data = cv2.cvtColor(img1, cv2.COLOR_BGR2RGB)
                # 创建mp.Image对象
                image = mp.Image(image_format=mp.ImageFormat.SRGB, data=image_data)
                #手势结果
                recognition_result = self.recognizer.recognize(image)
                # STEP 5: Process the result. In this case, visualize it.
                try:
                    top_gesture = recognition_result.gestures[0][0]
                    hand_landmarks = recognition_result.hand_landmarks
                    result = (top_gesture, hand_landmarks)

                    img,title,name = self.display_batch_of_images_with_gestures_and_hand_landmarks(image, result)
                    cv2.putText(img, title, position, font, font_scale, color, thickness, cv2.LINE_AA)

                    img= cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
                    self.name = name
                except:
                    img=img1
                    name=None

                self.status = self.EXEcute_judge(name)
                self.Frame_Rate()
                ret, buffer = cv2.imencode('.jpg', img)
                # 将缓存里的流数据转成字节流
                frame = buffer.tobytes()



                # 指定字节流类型image/jpeg
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')



    #判断手势
    def EXEcute_judge(self,name):
        #手势指令
        # 开1灯,拇指
        if name=='Thumb_Up':
            # print(1)
            with open('test1.txt', 'w') as file:
                file.write('1')

            return 1
        # 关1灯，二手指
        elif name=='Thumb_Down':
            # print(2)
            with open('test1.txt', 'w') as file:
                file.write('2')

            return 2
        #开2灯
        elif name == 'Open_Palm':
            # print(3)
            with open('test1.txt', 'w') as file:
                file.write('3')

            return 3
        #关2灯
        elif name == 'Closed_Fist':
            # print(4)
            with open('test1.txt', 'w') as file:
                file.write('4')

            return 4
        else:
            with open('test1.txt', 'w') as file:
                # print(0)
                file.write('0')

            return 0
    #显示FPS
    def Frame_Rate(self):
        self.cTime = time.time()  # 处理完一帧图像的时间
        self.fps = 1 / (self.cTime - self.pTime)
        self.pTime = self.cTime #重置起始时间
        cv2.putText(self.img,str(int(self.fps)),(70,40),cv2.FONT_HERSHEY_PLAIN,3,(255,0,0),3)

#
# x = gesTure()
# x.Control()