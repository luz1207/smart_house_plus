import cv2
import json
import time
import mediapipe as mp
import math

from mediapipe.framework.formats import landmark_pb2

class gesTure:
    #初始化
    def __init__(self,recognizer):
        self.status = 0
        self.name = 'N'
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
        return annotated_image,title,gestures.category_name#放回输出的一张图像和对应的手势名字和分数

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
                self.Frame_Rate()
                ret, buffer = cv2.imencode('.jpg', img)
                # 将缓存里的流数据转成字节流
                frame = buffer.tobytes()
                # 指定字节流类型image/jpeg
                self.status = self.GesTure_control()

                # yield frame, status
            # yield (self.status , frame)
            yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
    # 手势识别
    def GesTure_control(self):
        # cap = cv2.VideoCapture(0)
        # red,self.img = cap.read()
        imgRGB = cv2.cvtColor(self.img,cv2.COLOR_BGR2RGB) #把BGR转换为RGB
        result = self.hands.process(imgRGB)
        if result.multi_hand_landmarks: #判断是否检测到手
            for self.handLms in result.multi_hand_landmarks: # 获得手的坐标，线，画出来
                self.mpDraw.draw_landmarks(self.img,self.handLms,self.mphands.HAND_CONNECTIONS, self.pointStyle, self.lineStyle) #把关键点连起来
                return self.Count()

    #计算关键点的距离(有_的是用来获取坐标的，没有_的是用来距离比较的)
    def Count(self):
        #0到食指关节
        p0x = self.handLms.landmark[0].x
        p0y = self.handLms.landmark[0].y
        p5x = self.handLms.landmark[5].x
        p5y = self.handLms.landmark[5].y
        distance_0_5 = pow(p0x - p5x, 2) + pow(p0y - p5y, 2)
        self.dis05 = pow(distance_0_5, 0.5) #0到5的距离

        #拇指坐标
        p4x = self.handLms.landmark[4].x
        p4y = self.handLms.landmark[4].y
        p4_x = math.ceil(p4x * self.resize_w)
        p4_y = math.ceil(p4y * self.resize_h)
        self.thumb = (p4_x,p4_y)
        distance_4_5 = pow(p4x - p5x, 2) + pow(p4y - p5y, 2)
        self.dis45 = pow(distance_4_5, 0.5) #拇指到5的距离

        #食指坐标
        p8x = self.handLms.landmark[8].x
        p8y = self.handLms.landmark[8].y
        self.p8_x = math.ceil(self.handLms.landmark[8].x * self.resize_w)
        self.p8_y = math.ceil(self.handLms.landmark[8].y * self.resize_h)
        self.index = (self.p8_x,self.p8_y)
        distance_0_8 = pow(p0x - p8x, 2) + pow(p0y - p8y, 2)
        self.dis08 = pow(distance_0_8, 0.5) #0到食指的距离

        #中指坐标
        p12x = self.handLms.landmark[12].x
        p12y = self.handLms.landmark[12].y
        self.p12_x = math.ceil(self.handLms.landmark[12].x * self.resize_w)
        self.p12_y = math.ceil(self.handLms.landmark[12].y * self.resize_h)
        self.middle = (self.p12_x,self.p12_y)
        distance_0_12 = pow(p0x-p12x,2) + pow(p0y-p12y,2)
        self.dis012 = pow(distance_0_12,0.5) #0到中指的距离
        distance_8_12 = pow(p8x - p12x,2) + pow(p8y - p12y,2)
        self.dis812 = pow(distance_8_12,0.5)

        #无名指坐标
        p16x = self.handLms.landmark[16].x
        p16y = self.handLms.landmark[16].y
        self.p16_x = math.ceil(self.handLms.landmark[16].x * self.resize_w)
        self.p16_y = math.ceil(self.handLms.landmark[16].y * self.resize_h)
        self.ring = (self.p16_x,self.p16_y)
        distance_0_16 = pow(p0x-p16x,2) + pow(p0y-p16y,2)
        self.dis016 = pow(distance_0_16,0.5) #无名指到0的距离

        #尾指的坐标
        p20x = self.handLms.landmark[20].x
        p20y = self.handLms.landmark[20].y
        self.p20_x = math.ceil(self.handLms.landmark[20].x * self.resize_w)
        self.p20_y = math.ceil(self.handLms.landmark[20].y * self.resize_h)
        self.caudal = (self.p20_x,self.p20_y)
        distance_0_20 = pow(p0x-p20x,2) + pow(p0y-p20y,2)
        self.dis020 = pow(distance_0_20,0.5) #尾指到0的位置
        distance_16_20 = pow(p16x-p20x,2) + pow(p16y-p20y,2)
        self.dis1620 = pow(distance_16_20,0.5) #16到20的距离
        # print(self.dis1620)

        self.img = cv2.circle(self.img, self.index, 10, (255, 0, 0), cv2.FILLED) #食指的样式
        self.img = cv2.circle(self.img, self.thumb, 10 ,(255, 0, 0), cv2.FILLED) #拇指样式
        self.img = cv2.circle(self.img, self.middle, 10, (255, 0, 0), cv2.FILLED) #中指样式
        self.img = cv2.circle(self.img, self.ring, 10, (0, 255, 0), cv2.FILLED) #无名指的样式
        self.img = cv2.circle(self.img, self.caudal, 10, (0, 255, 0), cv2.FILLED) #尾指的样式
        return self.EXEcute_judge()


    #判断手势
    def EXEcute_judge(self):
        #手势指令
        # 关灯,拇指
        if self.dis012 < self.dis05 and self.dis08 < self.dis05 and self.dis812 < 0.05:
            # print(2)
            with open('test1.txt', 'w') as file:
                file.write('2')

            return 2
        # 开灯，二手指
        elif self.dis012 < self.dis05 and self.dis08 > self.dis05*1.4 and self.dis812 > 0.07:
            # print(1)
            with open('test1.txt', 'w') as file:
                file.write('1')

            return 1
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