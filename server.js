'use strict';

var express = require('express');
var path = require('path');
var sockjs = require('sockjs');

var PORT = process.env.PORT || 3000;
var INDEX = path.join(__dirname, 'index.html');

var server = express()
    .use(function (req, res) {
        res.sendFile(INDEX)
    })
    .listen(PORT, function () {
        console.log("Listening on " + PORT + "")
    });

var servidorWs = sockjs.createServer();

var conexoes = [];

servidorWs.on('connection', function (conexaoSocket) {
    console.log('Client connected');
    conexoes.push(conexaoSocket);

    conexaoSocket.on('close', function () {
        console.log('Client disconnected')
    });

    conexaoSocket.on('data', function (m) {
       // console.log(m);

        for(var i in conexoes){
            if(conexaoSocket == conexoes[i]){
                continue;
            }
            conexoes[i].write(m);
        }

    });

    // Envia para todas as conexoes o horário do servidor
    setInterval(function () {
        var msg = {
            dataServidor :new Date().toTimeString()
        };
        msg = JSON.stringify(msg);
            conexaoSocket.write(msg);
        }, 1000
    );

    // Hack Heroku
    var t = setInterval(function () {
        try {
            conexaoSocket._session.recv.didClose();
        } catch (x) {
        }
    }, 15000);

    conexaoSocket.on('close', function () {
        console.log(" [.] close event received");
        clearInterval(t);
    });
});

// Funcao para saber tipo de objeto
function typeOf(obj) {
    return {}.toString.call(obj).split(' ')[1].slice(0, -1).toLowerCase();
}

servidorWs.installHandlers(server, {prefix: '/projetoiot'});


