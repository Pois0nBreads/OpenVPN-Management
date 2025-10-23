/**
*	package httpserver/userController.js
**/
const express = require('express');
const bodyParser = require('body-parser');

class UserController {
    constructor(tokenManager) {
        this.tokenManager = tokenManager;
        let router = express.Router();
        router.use(bodyParser.json());
        /**
         * 权限管理 @Administrator
         */
        router.use(function (req, res, next) {
            let level = req.__access_level;
            let user = req.__access_user;
            console.debug(`UserController: path - ${req.path}, user - ${user}, level - ${level}`);
            switch (req.path) {
                case '/hello':
                case '/login':
                    next();
                    break;
                //用户接口
                case '/myinfo':
                case '/myupdate':
                case '/logout':
                    if (level > 0) {
                        next();
                        break;
                    }
                    res.send({ code: 401, msg: "权限不足" });
                    break;
                //管理员接口
                case '/add':
                case '/delete':
                case '/update':
                case '/info':
                    if (level > 1) {
                        next();
                        break;
                    }
                    res.type('application/json');
                    res.send({ code: 401, msg: "权限不足" });
                    break;
                default:
                    res.type('application/json');
                    res.send({ code: 404, msg: "未注册的接口" });
                    break;
            }
        });
        /**
         * 登录接口 @User
         */
        router.post('/login', async (req, res) => {
            res.type('application/json');
            let data = req.body;
            let result = {}
            try {
                let resultCode = await this.userDAO.authLogin(data.user, data.pass);
                switch (resultCode) {
                    case 0:
                        let token = this.tokenManager.createToken(data.user);
                        result.code = 0;
                        result.token = token;
                        result.msg = '登陆成功';
                        break;
                    case 1:
                        result.code = 1;
                        result.token = '';
                        result.msg = '用户不存在';
                        break;
                    case 2:
                        result.code = 2;
                        result.token = '';
                        result.msg = '密码错误';
                        break;
                }
            } catch (e) {
                result.code = -1;
                result.token = '';
                result.msg = e.toString();
            }
            res.send(result);
        });
        /**
         * 登出接口 @User
         */
        router.post('/logout', (req, res) => {
            this.tokenManager.destoryToken(req.cookies.token);
            res.send({
                code: 0,
                msg: '登出成功'
            });
        });
        /**
         * 查询用户自己接口 @User
         */
        router.post('/myinfo', async (req, res) => {
            let user = req.__access_user;
            let userInfo = await this.userDAO.getUserByName(user);
            res.send({
                code: 0,
                msg: '获取成功',
                data: userInfo
            });
        });
        /**
         * 修改用户自己接口 @User
         */
        router.post('/myupdate', async (req, res) => {
            let user = req.__access_user;
            let userInfo = await this.userDAO.getUserByName(user);
            res.send({
                code: 0,
                msg: '获取成功',
                data: userInfo
            });
        });

        /**
         * 增加用户接口 @Admin
         */
        router.post('/add', (req, res) => {
            res.send('????????');
        });
        /**
         * 删除用户接口 @Admin
         */
        router.post('/delete', (req, res) => {
            res.send('????????');
        });
        /**
         * 修改用户接口 @Admin
         */
        router.post('/update', (req, res) => {
            res.send('????????');
        });
        /**
         * 查询用户接口 @Admin
         */
        router.post('/info', (req, res) => {
            res.send('????????');
        });
        this.controller = router;
    }

    setUserDAO(dao) {
        this.userDAO = dao;
        return this;
    }

    setRoleDAO(dao) {
        this.roleDAO = dao;
        return this;
    }

    create() {
        return this.controller;
    }
}
module.exports = UserController;