import boto3
import paho.mqtt.client as mqtt
import json
import smbus2
from datetime import datetime
from pymongo import MongoClient
from dotenv import load_dotenv
load_dotenv()

import os

# AWS Configuration
AWS_S3_BUCKET = "vascueye"
AWS_REGION = "ap-southeast-2"
AWS_IOT_ENDPOINT = "a3h9z6xkbf4wb1-ats.iot.ap-southeast-2.amazonaws.com"

# MQTT Configuration
MQTT_TOPIC = "sensor/data"
MQTT_PORT = 8883
MQTT_CLIENT_ID = "RaspberryPi"
MQTT_CERT_PATH = "certs/certificate.pem.crt"
MQTT_KEY_PATH = "certs/private.pem.key"
MQTT_ROOT_CA = "certs/rootCA.pem"


ACCESS_KEY = os.getenv("AWS_ACCESS_KEY_ID")
SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")

# MongoDB Configuration
MONGO_URI = "mongodb+srv://e20158:6VJV4h0qK1Qqzeac@vescueye.qucur.mongodb.net/?retryWrites=true&w=majority&appName=Vescueye" 
db_client = MongoClient(MONGO_URI)
db = db_client["test"] 
patients_collection = db["patients"]  


# Initialize MLX90614 Sensor
bus = smbus2.SMBus(3) #use i2c bus 3
MLX90614_I2C_ADDR = 0x5A
OBJECT_TEMP_REG = 0x07


def fetch_patients():
    return list(patients_collection.find({}, {"_id": 1, "name": 1}))

def read_temp(bus, address, register):
    data = bus.read_word_data(address, register)
    temp = (data * 0.02) - 273.15 +7  #To Calibration add 7
    if temp < 0 or temp > 50:
        return None
    return temp

def upload_to_s3(file_path):

    s3 = boto3.client("s3", region_name=AWS_REGION, aws_access_key_id=ACCESS_KEY, aws_secret_access_key=SECRET_ACCESS_KEY)
    s3_key = f"flapImg/{file_path.split('/')[-1]}"
    try:
        s3.upload_file(file_path, AWS_S3_BUCKET, s3_key,ExtraArgs={"ContentType": "image/jpeg"})
        image_url = f"https://{AWS_S3_BUCKET}.s3.{AWS_REGION}.amazonaws.com/{s3_key}"
        print(f"[SUCCESS] Image uploaded: {image_url}")
        return image_url
    except Exception as e:
        print(f"[ERROR] Failed to upload image: {e}")
        return None

def send_data_to_aws(temperature, image_url, patient_id,results):
    mqtt_client = mqtt.Client(client_id=MQTT_CLIENT_ID, protocol=mqtt.MQTTv311)
    mqtt_client.tls_set(ca_certs=MQTT_ROOT_CA, certfile=MQTT_CERT_PATH, keyfile=MQTT_KEY_PATH)
    mqtt_client.connect(AWS_IOT_ENDPOINT, MQTT_PORT, 60)
    mqtt_client.loop_start()

    payload = {
        "patient_id": patient_id,
        "temperature": temperature,
        "image_url": image_url,
        "timestamp": datetime.now().isoformat(),
        "vein_percentage": results.get("vein_percentage"),
        "vein_line_percentage": results.get("vein_line_percentage"),
        "continuity_score": results.get("continuity_score")
    }
    mqtt_client.publish(MQTT_TOPIC, json.dumps(payload), qos=1)
    #mqtt_client.loop_stop()
    #mqtt_client.disconnect()
    print("[SUCCESS] Data sent to AWS IoT!")
    

def cloud_upload(image,patient_id,results):
    print("[INFO] Reading ambient temperature...")
    temperature = read_temp(bus, MLX90614_I2C_ADDR, OBJECT_TEMP_REG)

    if temperature is None:
        print("[ERROR] Failed to read temperature")
        return

    print("[INFO] Uploading image to AWS S3...")
    image_url = upload_to_s3(image)
        
    print(f"[INFO] Sending data: Temperature={temperature}°C, Image={image_url}, Patient ID={patient_id}")
    send_data_to_aws(temperature, image_url, patient_id,results)

