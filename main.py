from fastapi_login.exceptions import InvalidCredentialsException
from fastapi import FastAPI, Form, UploadFile, Response
from fastapi.staticfiles import StaticFiles
from roboflow import Roboflow
from typing import Annotated
from typing import List
import binascii
import sqlite3
import pygame

# sqlite3 database 연결
con = sqlite3.connect('db.db', check_same_thread=False)
# 데이터 베이스 현재 위치
cur = con.cursor()

# main.py 실행시 해당 테이블이 없으면 생성
cur.execute(f"""
            CREATE TABLE IF NOT EXISTS users (
                number INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL,pip 
                id TEXT NOT NULL,
                password TEXT NOT NULL
            );
            """)

cur.execute(f"""
            CREATE TABLE IF NOT EXISTS detect (
                id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                condition TEXT,
                image BLOB
            );
            """)

cur.execute(f"""
            CREATE TABLE IF NOT EXISTS train (
                id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                image_name TEXT,
                image BLOB
            );
            """)


app = FastAPI()

# 로그인을 위해 user의 데이터를 가져온다.
def query_user(data):
    WHERE_STATEMENTS = f'''id="{data}"'''
    if type(data) == dict:
        WHERE_STATEMENTS = f'''id="{data["id"]}"'''
    con.row_factory = sqlite3.Row
    cur = con.cursor()
    user = cur.execute(f"""
                       SELECT * FROM users WHERE {WHERE_STATEMENTS}
                       """).fetchone()
    return user

# 회원 가입
@app.post('/signup')
def signup(
    name:Annotated[str, Form()], 
    email:Annotated[str, Form()], 
    id:Annotated[str, Form()], 
    password:Annotated[str, Form()]
    ):

    cur.execute(f"""
                INSERT INTO users(name, email, id, password)
                VALUES ('{name}','{email}','{id}','{password}');
                """)
    con.commit()

    return "200"

# 로그인
@app.post('/login')
def login(
    id:Annotated[str, Form()],
    password:Annotated[str,Form()]):

    user = query_user(id)
    if not user:
        raise InvalidCredentialsException
    elif password != user['password']:
        raise InvalidCredentialsException
    elif user['id'] == "admin":
        return '210'
    else: 
        return '200'
   
# 이미지 업로드 후 학습 모델을 거쳐 예측 결과 이미지와 라벨을 데이터 베이스에 저장
@app.post('/upload')
async def create_image(image:UploadFile):
    image_name = image.filename

    contents = await image.read()
    with open(f"./upload_img/{image_name}", "wb") as f:
        f.write(contents)

    # Roboflow API를 사용해 미리 학습 시킨 모델을 가져와서 사용 (직접 라벨링을 해서 학습을 시킴)
    rf = Roboflow(api_key="YOUT_API_KEY")
    project = rf.workspace("WORKSPACE").project("PROJECT")
    model = project.version(2).model
    prediction = model.predict(f'./upload_img/{image_name}', confidence=40, overlap=30).json()
    detect_image = model.predict(f'./upload_img/{image_name}', confidence=40, overlap=30).save(f"./detect_img/detect_{image_name}")

    condition = prediction["predictions"][0]["class"]
    
    detect_image_path = f"./detect_img/detect_{image_name}"
    
    # 이미지를 읽어와 16진수로 변환
    with open(detect_image_path, "rb") as f:
        image_data = f.read()
        hex_data = binascii.hexlify(image_data)
        hex_string = hex_data.decode('utf-8')
    
    # 데이터 베이스에 라벨과 이미지를 저장
    cur.execute(f"""
                INSERT INTO detect(condition, image)
                VALUES ('{condition}','{hex_string}')
                """)
    con.commit()
    return '200'

# 예측된 이미지를 반환
@app.get('/detect_image')
async def get_detect_image():
    cur = con.cursor()
    # 16진법
    # 데이터 베이스에 가장 마지막 이미지를 꺼내와 반환
    image_bytes = cur.execute(f"""
                            SELECT image FROM detect ORDER BY ROWID DESC LIMIT 1;
                            """).fetchone()[0]
    
    return Response(content=bytes.fromhex(image_bytes), media_type='image/*')

# 예측된 라벨에 맞는 경고음 반환
def play_sound(path):
    pygame.init()

    # MP3 파일 재생
    pygame.mixer.music.load(path)
    pygame.mixer.music.play()

    # 재생이 완료될 때까지 대기
    while pygame.mixer.music.get_busy():
        pygame.time.Clock().tick(10)
  
# 경고음 파일 경로와 함께 play_sound 함수 호출
warning_path = "./mp3_file/warning.mp3"
fall_path = "./mp3_file/fall.mp3"


# 예측된 결과의 라벨을 반환
@app.get('/condition')
async def get_condition():
    con.row_factory = sqlite3.Row
    cur = con.cursor()
    # 데이터 베이스에 가장 마지막 라벨을 반환
    row = cur.execute(f"""
                    SELECT condition FROM detect ORDER BY ROWID DESC LIMIT 1;
                    """).fetchone()[0]
    
    if (row == "warning"):
        play_sound(warning_path)
    elif (row == "fall"):
        play_sound(fall_path)
  
    return row

# 학습을 시킬 이미지를 데이터 베이스에 저장
@app.post('/train')
async def create_image(images:List[UploadFile]):
    for image in images:
        image_name = image.filename
        image_bytes = await image.read()
        # 이미지를 16진수로 변환하여 데이터 베이스에 저장
        cur.execute(f"""
                    INSERT INTO train(image_name, image)
                    VALUES ('{image_name}','{image_bytes.hex()}')
                    """)
    con.commit()
    return '200'

app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")