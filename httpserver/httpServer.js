/**
*	package httpserver/httpServer.js
**/
const express = require('express');
const path = require('path');
const normalizePath = require('normalize-path');
const cookieParser = require('cookie-parser');

function getBearerToken(req) {
    // 获取 Authorization 头
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return null;
    }
    
    // 检查格式是否为 "Bearer [token]"
    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
        return null;
    }
    
    return token;
}

class HttpServer {

    constructor(port) {
        let _this = this;
        this.app = express();
        this.port = port || 8080;

        this.app.use(cookieParser());

        // 在静态文件中间件之前应用路径清理
        this.app.use(function (req, res, next) {
            // 规范化路径并解析相对路径符号
            const normalizedPath = normalizePath(path.resolve('/', req.path));

            //解析token向后传递访问权限
            // 0: 匿名用户 1: 普通用户 2: 管理员
            if (normalizedPath.startsWith('/api')) {
                //let token = req.cookies.token;
                let token = getBearerToken(req);
                console.debug(`token: ${token}`);
                req.__access_level = _this.authorization(token).level;
                req.__access_user = _this.authorization(token).user;
            }

            // 检查规范化后的路径是否仍在公共目录内
            if (!normalizedPath.startsWith(path.resolve('/'))) {
                console.warn(`检测到路径遍历攻击尝试: ${req.originalUrl}`);
                return res.sendStatus(403);
            }

            // 检查URL编码的斜杠字符（%2f, %5c）
            if (req.path.includes('%2f') || req.path.includes('%2F') ||
                req.path.includes('%5c') || req.path.includes('%5C')) {
                console.warn(`检测到编码的路径遍历攻击尝试: ${req.originalUrl}`);
                return res.sendStatus(403);
            }

            next();
        });
        this.app.use('/', express.static(path.join('./public')));
    }

    authorization(token) {
        if (!this.tokenManager) 
            return {level: 0, user: ""};
        let info = this.tokenManager.getInfoByToken(token);
	    return {level: info.level, user: info.user};
    }

    setTokenManager(tokenManager) {
        this.tokenManager = tokenManager;
        return this;
    }

    configureServer(prefix, router) {
        this.app.use(path.join('/api', prefix), router);
        return this;
    }

    startServer() {
        let _this = this;
        this.app.listen(this.port, () => {
            console.log(`Http服务器运行在 http://localhost:${_this.port}`);
        });
        return this;
    }
}

module.exports = HttpServer;