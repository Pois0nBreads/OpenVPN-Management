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
                case '/myupdate/nickname':
                case '/myupdate/passwd':
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
                case '/update/nickname':
                case '/update/passwd':
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
            let userData = await this.userDAO.getUserByName(user);
            
            let userInfo = {};
            userInfo.uid = userData.uid;
            userInfo.username = userData.username;
            userInfo.nickname = userData.nickname;
            userInfo.last_login = userData.last_login;
            userInfo.roles = [];
            for (let roleID of userData.roles) {
                let role = await this.roleDAO.getRoleByUID(roleID);
                let roleInfo = {};
                roleInfo.id = role.uid;
                roleInfo.name = role.role_name;
                roleInfo.networkList = [];
                for (let networkID of role.networks) {
                    let networkList = await this.networkDAO.getNetworkByUID(networkID);
                    let networkInfo = {};
                    networkInfo.networks = [];
                    networkInfo.id = networkList.uid;
                    networkInfo.name = networkList.network_name;
                    for (let network of networkList.networks)
                        networkInfo.networks.push(network);
                    roleInfo.networkList.push(networkInfo);
                }
                userInfo.roles.push(roleInfo);
            }


            res.send({
                code: 0,
                msg: '获取成功',
                data: userInfo
            });
        });
        /**
         * 修改用户自己昵称接口 @User
         */
        router.post('/myupdate/nickname', async (req, res) => {
            let user = req.__access_user;
            try {
                let nickname = req.body.nickname;
                if (nickname == null || nickname.trim() == '')
                    throw new Error('nickname 不能为空');
                let code = await this.userDAO.changeNicknameByName(user, nickname);
                res.send({
                    code: 0,
                    msg: '修改成功'
                });
            } catch(e) {
                res.send({
                    code: -1,
                    msg: '修改失败' + e
                });
            }
        });
        /**
         * 修改用户自己密码接口 @User
         */
        router.post('/myupdate/passwd', async (req, res) => {
            let user = req.__access_user;
            try {
                const regex = /^[A-Za-z0-9~!@#$%^&*()_=+-]+$/;
                let password = req.body.password;
                if (password == null || password == '')
                    throw new Error('password 不能为空');
                if (password.length < 8)
                    throw new Error('password 不能小于8位');
                if (!regex.test(password)) 
                    throw new Error('password 包含非法字符');
                let code = await this.userDAO.changePassByName(user, password);
                res.send({
                    code: 0,
                    msg: '修改成功'
                });
            } catch(e) {
                res.send({
                    code: -1,
                    msg: '修改失败' + e
                });
            }
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

    setNetworkDAO(dao) {
        this.networkDAO = dao;
        return this;
    }

    create() {
        return this.controller;
    }
}
module.exports = UserController;