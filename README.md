# todolist_front
## TODO 앱 화면
**개발기간** : 2024-12-10 ~ 2024-12-20

## 📢 프로젝트 소개
- 기본적인 TODO 어플리케이션의 화면입니다.
- 소셜 API를 사용하여 로그인 기능을 구현하였습니다.
- 캘린더를 활용하여 해당날짜를 선택하여 일정을 확인하고
  추가,수정,삭제 할 수 있습니다.

## ➡️ 프로젝트 실행방법
- 터미널 <br/>
mysql -u root -p <br/>
- mysql todolist_db 데이터베이스 생성 <br/>
CREATE DATABASE todolist_db <br/>
- todo 계정 생성 <br/> 
CREATE USER 'todo'@'localhost' IDENTIFIED BY 'todo' <br/>
- 리액트 실행 <br/>
todolist_front> cd todolist <br/>
todolist_front/todolist > npm start <br/>

## 🛠️ 기술 스택 todolist_front
<img src="https://simpleicons.org/icons/createreactapp.svg" width="50px"/> **react :**  리액트를 활용하여 화면을 구현하였습니다.<br />
<img src="https://simpleicons.org/icons/kakaotalk.svg" width="50px"/> **kakao API :**  카카오API를 활용하여 소셜로그인을 구현하였습니다.<br />
<img src="https://simpleicons.org/icons/google.svg" width="50px"/> **google API :**  구글API를 활용하여 소셜로그인을 구현하였습니다.<br />
<img src="https://simpleicons.org/icons/axios.svg" width="50px" /> **aixos :** 백엔드와의 HTTP 통신을 위해 사용하였습니다.<br />
<img src="https://simpleicons.org/icons/css3.svg" width="50px" /> **css :** 화면 구성을 디자인하기 위해 사용하였습니다.<br />

## 📚 앱 페이지 구성

