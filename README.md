# todolist_front
## TODO 앱 화면
**개발기간** : 2024-12-10 ~ 2024-12-20

### 📢프로젝트 소개
- 기본적인 TODO 어플리케이션의 화면입니다.
- 소셜 API를 사용하여 로그인 기능을 구현하였습니다.
- 캘린더를 활용하여 해당날짜를 선택하여 일정을 확인하고
  추가,수정,삭제 할 수 있습니다.

### 프로젝트 실행방법
- 터미널 <br/>
mysql -u root -p <br/>
- mysql todolist_db 데이터베이스 생성 <br/>
CREATE DATABASE todolist_db <br/>
- todo 계정 생성 <br/> 
CREATE USER 'todo'@'localhost' IDENTIFIED BY 'todo' <br/>
- 테이블 생성 <br/>
CREATE TABLE MEMBER ( 
    MEM_ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    EMAIL VARCHAR(50) not NULL,
    NICKNAME VARCHAR(50) not NULL,
    TOKEN_ID VARCHAR(255) NOT NULL UNIQUE 
);<br/>
CREATE TABLE TODOLIST (
    TODO_ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    TITLE VARCHAR(200) not NULL,
    CONTENT VARCHAR(4000) not NULL,
    START_DATE TIMESTAMP,
    END_DATE TIMESTAMP,
    CREATE_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UPDATE_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    COMPLETEYN BOOLEAN,
    MEM_ID INT,
    CONSTRAINT FK_MEMBER FOREIGN KEY (MEM_ID) REFERENCES MEMBER(MEM_ID)
);<br/>
CREATE TABLE CALENDAR (
    CAL_ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    CALDATE TIMESTAMP not NULL,
    TODO_ID INT,   
    MEM_ID INT,
    CONSTRAINT FK_TODOLIST FOREIGN KEY (TODO_ID) REFERENCES TODOLIST(TODO_ID) ON DELETE CASCADE,
    CONSTRAINT FK_MEM FOREIGN KEY (MEM_ID) REFERENCES MEMBER(MEM_ID)
);
<br/>
- 리액트 실행 <br/>
todolist_front> cd todolist <br/>
todolist_front/todolist > npm start <br/>


