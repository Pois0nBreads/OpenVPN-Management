/**
*	package httpserver/userController.js
**/
const express = require('express');
const bodyParser = require('body-parser');

function isValidPassword(pass) {
    const regex = /^[A-Za-z0-9~!@#$%^&*()_=+-]+$/;
    return regex.test(pass);
}
function isValidUserName(name) {
    const regex = /^[A-Za-z0-9]+$/;
    return regex.test(name);
}

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
                case '/mylevel':
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
                case '/update/roles':
                case '/info':
                case '/getAll':
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
                        let info = this.tokenManager.getInfoByToken(token);
                        result.code = 0;
                        result.token = token;
                        result.level = info.level;
                        result.msg = '登陆成功';
                        break;
                    case 1:
                        result.code = 1;
                        result.token = '';
                        result.level = 0;
                        result.msg = '用户不存在';
                        break;
                    case 2:
                        result.code = 2;
                        result.token = '';
                        result.level = 0;
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
            this.tokenManager.destoryToken(req.__token);
            res.send({
                code: 0,
                msg: '登出成功'
            });
        });
        /**
         * 查询用户自己权限接口 @User
         */
        router.post('/mylevel', async (req, res) => {
            let user = req.__access_user;
            let level = req.__access_level;
            res.send({
                code: 0,
                msg: '获取成功',
                user: user,
                level: level
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
            } catch (e) {
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
                let password = req.body.password;
                if (password == null || password == '')
                    throw new Error('password 不能为空');
                if (password.length < 8)
                    throw new Error('password 不能小于8位');
                if (!isValidPassword(password))
                    throw new Error('password 包含非法字符');
                let code = await this.userDAO.changePassByName(user, password);
                res.send({
                    code: 0,
                    msg: '修改成功'
                });
            } catch (e) {
                res.send({
                    code: -1,
                    msg: '修改失败' + e
                });
            }
        });

        /**
         * 增加用户接口 @Admin
         */
        router.post('/add', async (req, res) => {
            try {
                let username = req.body.username;
                if (username == null || username == '')
                    throw new Error('username 不能为空');
                if (username.length < 5)
                    throw new Error('username 不能小于4位');
                if (!isValidUserName(username))
                    throw new Error('username 只允许包含英文大小写和数字');

                let password = req.body.password;
                if (password == null || password == '')
                    throw new Error('password 不能为空');
                if (password.length < 8)
                    throw new Error('password 不能小于8位');
                if (!isValidPassword(password))
                    throw new Error('password 只允许包含大小写英文数字和 ~!@#$%^&*()_=+-');

                let code = await this.userDAO.addUser(username, password);
                await this.tokenManager.syncDatabase(); //刷新tokenManage缓存
                res.send({
                    code: 0,
                    msg: '创建用户成功'
                });
            } catch (e) {
                res.send({
                    code: -1,
                    msg: '创建用户失败' + e
                });
            }
        });
        /**
         * 删除用户接口 @Admin
         */
        router.post('/delete', async (req, res) => {
            try {
                let username = req.body.username;
                if (username == null || username == '')
                    throw new Error('username 不能为空');
                if (username.length < 5)
                    throw new Error('username 不能小于8位');
                if (!isValidUserName(username))
                    throw new Error('username 只允许包含英文大小写和数字');

                let code = await this.userDAO.delUserByName(username);
                await this.tokenManager.syncDatabase(); //刷新tokenManage缓存
                res.send({
                    code: 0,
                    msg: '删除用户成功'
                });
            } catch (e) {
                res.send({
                    code: -1,
                    msg: '删除用户失败' + e
                });
            }
        });
        /**
         * 修改用户密码接口 @Admin
         */
        router.post('/update/passwd', async (req, res) => {
            try {
                let username = req.body.username;
                if (username == null || username == '')
                    throw new Error('username 不能为空');
                if (username.length < 5)
                    throw new Error('username 不能小于8位');
                if (!isValidUserName(username))
                    throw new Error('username 只允许包含英文大小写和数字');

                let password = req.body.password;
                if (password == null || password == '')
                    throw new Error('password 不能为空');
                if (password.length < 8)
                    throw new Error('password 不能小于8位');
                if (!isValidPassword(password))
                    throw new Error('password 只允许包含大小写英文数字和 ~!@#$%^&*()_=+-');

                let code = await this.userDAO.changePassByName(username, password);
                res.send({
                    code: 0,
                    msg: '修改用户密码成功'
                });
            } catch (e) {
                res.send({
                    code: -1,
                    msg: '修改用户密码失败' + e
                });
            }
        });
        /**
         * 修改用户昵称接口 @Admin
         */
        router.post('/update/nickname', async (req, res) => {
            try {
                let username = req.body.username;
                if (username == null || username == '')
                    throw new Error('username 不能为空');
                if (username.length < 5)
                    throw new Error('username 不能小于8位');
                if (!isValidUserName(username))
                    throw new Error('username 只允许包含英文大小写和数字');

                let nickname = req.body.nickname;
                if (nickname == null || nickname == '')
                    throw new Error('nickname 不能为空');

                let code = await this.userDAO.changeNicknameByName(username, nickname);
                res.send({
                    code: 0,
                    msg: '修改用户昵称成功'
                });
            } catch (e) {
                res.send({
                    code: -1,
                    msg: '修改用户昵称失败' + e
                });
            }
        });
        /**
         * 修改用户规则接口 @Admin
         */
        router.post('/update/roles', async (req, res) => {
            try {
                let username = req.body.username;
                if (username == null || username == '')
                    throw new Error('username 不能为空');
                if (username.length < 5)
                    throw new Error('username 不能小于8位');
                if (!isValidUserName(username))
                    throw new Error('username 只允许包含英文大小写和数字');

                let roles = req.body.roles;
                if (!Array.isArray(roles))
                    throw new Error('roles 必须是数组');
                for (let roleID of roles) {
                    if (!await this.roleDAO.roleExists(roleID))
                        throw new Error(`roleID:${roleID} 角色不存在`);
                }

                let code = await this.userDAO.changeRolesByName(username, roles);
                res.send({
                    code: 0,
                    msg: '修改用户规则成功'
                });
            } catch (e) {
                res.send({
                    code: -1,
                    msg: '修改用户规则失败' + e
                });
            }
        });
        /**
         * 查询用户接口 @Admin
         */
        router.post('/info', async (req, res) => {
            try {
                let username = req.body.username;
                if (username == null || username == '')
                    throw new Error('username 不能为空');
                if (username.length < 5)
                    throw new Error('username 不能小于8位');
                if (!isValidUserName(username))
                    throw new Error('username 只允许包含英文大小写和数字');

                let userData = await this.userDAO.getUserByName(username);
                res.send({
                    code: 0,
                    msg: '查询用户成功',
                    data: userData
                });
            } catch (e) {
                res.send({
                    code: -1,
                    msg: '查询用户失败' + e
                });
            }
        });
        /**
         * 查询全部用户接口 @Admin
         */
        router.post('/getAll', async (req, res) => {
            try {
                let users = await this.userDAO.getAllUsers();
                res.send({
                    code: 0,
                    msg: '查询用户成功',
                    data: users
                });
            } catch (e) {
                res.send({
                    code: -1,
                    msg: '查询用户失败' + e
                });
            }
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