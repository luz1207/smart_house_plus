import cv2
import numpy as np
import dlib
from imutils import face_utils
from keras.models import load_model
import face_recognition
from statistics import mode
from utils.datasets import get_labels
from utils.inference import detect_faces
from utils.inference import draw_text
from utils.inference import draw_bounding_box
from utils.inference import apply_offsets
from utils.inference import load_detection_model
from utils.preprocessor import preprocess_input

USE_WEBCAM = True # If false, loads video file source

# parameters for loading data and images
emotion_model_path = './application/emotion_model.hdf5'
emotion_labels = get_labels('fer2013')

# hyper-parameters for bounding boxes shape
frame_window = 10
emotion_offsets = (20, 40)

# loading models
detector = dlib.get_frontal_face_detector()
emotion_classifier = load_model(emotion_model_path)

# predictor = dlib.shape_predictor("shape_predictor_68_face_landmarks.dat")

# getting input model shapes for inference
emotion_target_size = emotion_classifier.input_shape[1:3]

# starting lists for calculating modes
emotion_window = []

class emotion_model:
    def __init__(self):
        self.emotion = 'None'
        self.probability = 'None'

    def detect_emotion(self):
        cap = cv2.VideoCapture(0) # Webcam source

        while cap.isOpened(): # True:
            ret, frame = cap.read()

            if ret:
                frame = cv2.flip(frame, 1)
                gray_image = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                rgb_image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

                faces = detector(rgb_image)


                for face_coordinates in faces:
                    print ("forrrrr")
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

                    self.probability = list(emotion_prediction)

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
                        self.emotion = 'angray'
                    elif emotion_text == 'sad':
                        color = emotion_probability * np.asarray((0, 0, 255))
                        self.emotion = 'sad'
                    elif emotion_text == 'happy':
                        color = emotion_probability * np.asarray((255, 255, 0))
                        self.emotion = 'happy'
                    elif emotion_text == 'surprise':
                        color = emotion_probability * np.asarray((0, 255, 255))
                        self.emotion = 'surprise'
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


# x = emotion_model()
# x.detect_emotion()



