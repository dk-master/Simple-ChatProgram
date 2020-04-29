//설치한 express 모듈 불러오기
const express = require('express');
// 설치한 socket.io 모듈 불러오기
const socket = require('socket.io');
//node.js 기본 내장 모듈 불러오기
const http = require('http');

//node.js 기본 내장 모듈 불러오기
const fs = require('fs');

//express 객체 생성
const app = express();

//express http 서버생성
const server = http.createServer(app);

const io = socket(server)

//정적파일을 제공하기 위해 미들웨어를 사용하는 코드
//기본적으로 클라이언트가 http://서버주소/css로 엑세스할 경우 엑세스가 거부됨
app.use('/css', express.static('./static/css'))
app.use('/js', express.static('./static/js'))



app.get('/', function(req,res){
    fs.readFile('./static/index.html', function(err,data){
        if(err) {
            res.send('에러');
        }else{
            res.writeHead(200,{'Content-Type':'text/html'})
            res.write(data)
            res.end()
        }
    })
})


io.sockets.on('connection', function(socket) {
    //새로운 유저가 접속했을 경우 다른 소켓에게도 알려줌
    socket.on('newUser', function(name) {
    console.log(name + ' 님이 접속하였습니다.')

    // 소켓에 이름 저장해두기
    socket.name = name
    
    //모든 소켓에게 전송
    io.sockets.emit('update', {type: 'connect', name: "SERVER", message: name + '님이 접속하였습니다.'})
    }) 
    


    //전송한 메세지 받기
    socket.on('message',function(data){ //유저가 보내는 메세지는 모두 type이 message인 데이터로 정의.
        data.name = socket.name

        console.log(data)

        socket.broadcast.emit('update', data); // 본인을 제외한 나머지 유저에게 데이터를 전송 가능
    })



    //접속 종료
    socket.on('disconnect', function(){
        console.log(socket.name + '님이 나가셨습니다.')

        //나가는 사람을 제외한 나머지 유저에게 메시지 전송
        socket.broadcast.emit('update', {type: 'disconnect', name: "SERVER", message: socket.name + '님이 나가셨습니다.'});
    })
})

//서버를 8080포트로 listen
server.listen(8080, function(){
    console.log('server 8080 start!!!');
})