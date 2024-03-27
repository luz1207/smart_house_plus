# -*- coding: utf-8 -*-
# 引用 SDK

import time
import sys
import threading
from datetime import datetime
import json
import pyaudio
sys.path.append("../..")
from common import credential
from asr import speech_recognizer
import wenxin
import tts_ws_python3_demo as au

APPID = "1318726746"
SECRET_ID = "AKIDnaJtIZfbP6lQyaAmR0Skxyz461x39BKU"
SECRET_KEY = "Le2Z3Rn6VsBKLAr9LRVchkcIl2A7829G"
ENGINE_MODEL_TYPE = "16k_zh"
SLICE_SIZE = 6400

name_list=['小奇','小七','小齐','小琪','小旗']
close_text = "关机"


class MySpeechRecognitionListener(speech_recognizer.SpeechRecognitionListener):
    def __init__(self, id):
        self.id = id
        self.first_time = True
        self.flag = 0
        self.is_closed = False

    def on_recognition_start(self, response):
        print("%s|%s|OnRecognitionStart\n" % (
            datetime.now().strftime("%Y-%m-%d %H:%M:%S"), response['voice_id']))
        rsp_str = json.dumps(response, ensure_ascii=False)

        # print(rsp_str)

    def on_sentence_begin(self, response):
        rsp_str = json.dumps(response, ensure_ascii=False)

        # data = json.loads(rsp_str)
        # print(data['result']['voice_text_str'])
        # data = {"user": data['result']['voice_text_str']}
        #
        # # 将字典写入JSON文件
        # with open('../static/user.json', 'w') as f:
        #     json.dump(data, f)

        print("%s|%s|OnRecognitionSentenceBegin, rsp %s\n" % (
            datetime.now().strftime("%Y-%m-%d %H:%M:%S"), response['voice_id'], rsp_str))

    def on_recognition_result_change(self, response):
        rsp_str = json.dumps(response, ensure_ascii=False)
        # print("%s|%s|OnResultChange, rsp %s\n" % (datetime.now().strftime(
        #     "%Y-%m-%d %H:%M:%S"), response['voice_id'], rsp_str))
        data = json.loads(rsp_str)
        # print(data['result']['voice_text_str'])
        # data = {"user": data['result']['voice_text_str']}
        #
        # # 将字典写入JSON文件
        # with open('../static/user.json', 'w') as f:
        #     json.dump(data, f)

    def on_sentence_end(self, response):
        rsp_str = json.dumps(response, ensure_ascii=False)
        # print("%s|%s|OnSentenceEnd, rsp %s\n" % (datetime.now().strftime(
        #     "%Y-%m-%d %H:%M:%S"), response['voice_id'], rsp_str))
        #语音识别的内容 text
        text = response['result']['voice_text_str']
        print(text)
        # print(text)
        # 如果是第一次，需要启动唤醒功能，否则直接调用大模型回复
        if self.first_time:
            if any(substring in text for substring in name_list):
                self.first_time = False
                text = "小奇，小奇！"
                data = {"user": text}

                # 将字典写入JSON文件
                with open('../static/user.json', 'w') as f:
                    json.dump(data, f)
                #answer 大模型的回复
                answer = "你好，我是小奇，有什么可以帮助你的吗？"
                data = {"answer": "你好，我是小奇，有什么可以帮助你的吗？"}

                # 将字典写入JSON文件
                with open('../static/output.json', 'w') as f:
                    json.dump(data, f)

                au.create_audio(answer)
                self.is_closed = False

        else:
            if "中国大学生计算机设计大赛" in text:
                data = {"user": text}
                # 将字典写入JSON文件
                with open('../static/user.json', 'w') as f:
                    json.dump(data, f)

                answer = "中国大学生计算机设计大赛是由中国教育部、中国计算机学会和全国高等学校计算机教育研究会联合举办的面向全国高校学生的计算机科学与技术类竞赛活动。该比赛旨在促进大学生的计算机科学技术创新能力，提高学生的实践能力和团队协作能力，推动计算机教育和学科建设。它是国内具有一定影响力和知名度的大学生科技竞赛之一，吸引了众多高校学生积极参与，展示了中国大学生在计算机科学领域的创新能力和技术水平。"
                answer_data = {"answer": answer}
                with open('../static/output.json', 'w') as f:
                    json.dump(answer_data, f)
                au.create_audio(answer)

            else:
                if close_text in text:
                    answer = "好的，再见！有任何需要时，随时呼唤我哦。"
                    # create_audio调用生成音频文件并播放音乐
                    answer_data = {"answer": answer}
                    with open('../static/output.json', 'w') as f:
                        json.dump(answer_data, f)
                    au.create_audio(answer)

                    self.is_closed = True
                    self.first_time = True

                else:
                    if not self.is_closed:
                        data = {"user": text}
                        # 将字典写入JSON文件
                        with open('../static/user.json', 'w') as f:
                            json.dump(data, f)

                        modify_text = text+"回复在十五个字以内"

                        answer = wenxin.create_gpt(modify_text)
                        # create_audio调用生成音频文件并播放音乐
                        answer_data = {"answer": answer}
                        with open('../static/output.json', 'w') as f:
                            json.dump(answer_data, f)
                        au.create_audio(answer)



    def on_recognition_complete(self, response):
        # print("%s|%s|OnRecognitionComplete\n" % (
        #     datetime.now().strftime("%Y-%m-%d %H:%M:%S"), response['voice_id']))
        pass

    def on_fail(self, response):
        rsp_str = json.dumps(response, ensure_ascii=False)
        # print("%s|%s|OnFail,message %s\n" % (datetime.now().strftime(
        #     "%Y-%m-%d %H:%M:%S"), response['voice_id'], rsp_str))


def process(id):
    stream = pyaudio.PyAudio().open(format=pyaudio.paInt16, channels=1, rate=16000, input=True, frames_per_buffer=1024)
    listener = MySpeechRecognitionListener(id)
    credential_var = credential.Credential(SECRET_ID, SECRET_KEY)
    recognizer = speech_recognizer.SpeechRecognizer(
        APPID, credential_var, ENGINE_MODEL_TYPE,  listener)
    recognizer.set_filter_modal(1)
    recognizer.set_filter_punc(1)
    recognizer.set_filter_dirty(1)
    recognizer.set_need_vad(1)
    #recognizer.set_vad_silence_time(600)
    recognizer.set_voice_format(1)
    recognizer.set_word_info(1)
    #recognizer.set_nonce("12345678")
    recognizer.set_convert_num_mode(1)
    try:
        recognizer.start()
        while True:
            data = stream.read(1024)  # 从音频流中读取数据
            recognizer.write(data)  # 将数据发送到语音识别服务
            # 模拟实际实时语音发送间隔
            time.sleep(0.02)
    except Exception as e:
        print(e)
    finally:
        recognizer.stop()


def process_multithread(number):
    thread_list = []
    for i in range(0, number):
        thread = threading.Thread(target=process, args=(i,))
        thread_list.append(thread)
        thread.start()

    for thread in thread_list:
        thread.join()


if __name__ == "__main__":
    process(0)
    # process_multithread(20)
