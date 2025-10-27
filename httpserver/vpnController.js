/**
*	package httpserver/vpnController.js
**/
const express = require('express');
const bodyParser = require('body-parser');
const Netmask = require('netmask').Netmask;


class VPNController {
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
                //用户接口
                case '/getMyClients':
                case '/getClientConfig':
                case '/killMyClient':
                    if (level > 0) {
                        next();
                        break;
                    }
                    res.type('application/json');
                    res.send({ code: 401, msg: "权限不足" });
                    break;
                //管理员接口
                case '/getLog':
                case '/start':
                case '/stop':
                case '/status':
                case '/getClients':
                case '/killClient':
                case '/getConfig':
                case '/setConfig':
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
        //管理员接口
        /**
         * 查询VPN日志
         */
        router.post('/getLog', async (req, res) => {
            try {
                let data = this.vpn.getLog();
                res.send({
                    code: 0,
                    msg: '查询VPN日志成功',
                    data: data
                });
            } catch (e) {
                res.send({
                    code: -1,
                    msg: '查询VPN日志失败' + e
                });
            }
        });
        /**
         * 启动VPN
         */
        router.post('/start', async (req, res) => {
            try {
                //启动前刷新链表
                if (!this.vpn.statusVPN()) {
                    this.manager.reflushVPNChain();
                    let vpnConfig = await this.configDAO.getAllConfig();
                    let serverNet = new Netmask(vpnConfig.serverNet);
                    
			        Object.assign(this.vpn.config, {
                        ca: vpnConfig.ca,
                        cert: vpnConfig.cert,
                        key: vpnConfig.key,
                        dh: vpnConfig.dh,
                        port: vpnConfig.serverPort,
                        server_net: serverNet.base,
                        server_mask: serverNet.mask,
                        http_server_port: this.vpn.config.http_server_port
                    });
                    
                    this.vpn.startVPN();
                }
                res.send({
                    code: 0,
                    msg: '已启动'
                });
            } catch (e) {
                res.send({
                    code: -1,
                    msg: '启动失败' + e
                });
            }
        });
        /**
         * 停止VPN
         */
        router.post('/stop', async (req, res) => {
            try {
                this.vpn.stopVPN();
                res.send({
                    code: 0,
                    msg: '已停止'
                });
            } catch (e) {
                res.send({
                    code: -1,
                    msg: '停止失败' + e
                });
            }
        });
        /**
         * 查询VPN运行状态
         */
        router.post('/status', async (req, res) => {
            try {
                let status =  this.vpn.statusVPN();
                res.send({
                    code: 0,
                    msg: '查询VPN运行状态成功',
                    status: status
                });
            } catch (e) {
                res.send({
                    code: -1,
                    msg: '查询VPN运行状态失败' + e
                });
            }
        });
        /**
         * 查询VPN当前连接客户端
         */
        router.post('/getClients', async (req, res) => {
            try {
                let data = this.vpn.manager.getClientList();
                
                res.send({
                    code: 0,
                    msg: '查询VPN当前连接客户端成功',
                    data: data
                });
            } catch (e) {
                res.send({
                    code: -1,
                    msg: '查询VPN当前连接客户端失败' + e
                });
            }
        });
        /**
         * 踢出VPN当前连接客户端
         */
        router.post('/killClient', async (req, res) => {
            try {
                let id = req.body.id;
                if (id == null || id == '')
                    throw new Error('id 不能为空');
                this.vpn.manager.killClientByID(id);
                
                res.send({
                    code: 0,
                    msg: '踢出VPN当前连接客户端成功'
                });
            } catch (e) {
                res.send({
                    code: -1,
                    msg: '踢出VPN当前连接客户端失败' + e
                });
            }
        });
        /**
         * 获取VPN配置
         */
        router.post('/getConfig', async (req, res) => {
            try {
                let vpnConfig = await this.configDAO.getAllConfig();
                res.send({
                    code: 0,
                    msg: '获取VPN配置成功',
                    data: vpnConfig
                });
            } catch (e) {
                res.send({
                    code: -1,
                    msg: '获取VPN配置失败' + e
                });
            }
        });
        /**
         * 设置VPN配置
         */
        router.post('/setConfig', async (req, res) => {
            let data = req.body;
            if (data.ca == null || data.ca == '')
                throw new Error('ca 不能为空');
            if (data.cert == null || data.cert == '')
                throw new Error('cert 不能为空');
            if (data.key == null || data.key == '')
                throw new Error('key 不能为空');
            if (data.dh == null || data.dh == '')
                throw new Error('dh 不能为空');
            try {
                await this.configDAO.setAllConfig(data);
                res.send({
                    code: 0,
                    msg: '设置VPN配置成功'
                });
            } catch (e) {
                res.send({
                    code: -1,
                    msg: '设置VPN配置失败' + e
                });
            }
        });
        

        //用户接口
        /**
         * 查询VPN当前用户连接客户端
         */
        router.post('/getMyClients', async (req, res) => {
            try {
                let data = this.vpn.manager.getClientList();
                
                res.send({
                    code: 0,
                    msg: '查询VPN当前连接客户端成功',
                    data: data
                });
            } catch (e) {
                res.send({
                    code: -1,
                    msg: '查询VPN当前连接客户端失败' + e
                });
            }
        });
        /**
         * 踢出VPN当前用户连接客户端
         */
        router.post('/killMyClient', async (req, res) => {
            try {
                let id = req.body.id;
                if (id == null || id == '')
                    throw new Error('id 不能为空');

                let data = this.vpn.manager.getClientList();

                this.vpn.manager.killClientByID(id);
                
                res.send({
                    code: 0,
                    msg: '踢出VPN当前连接客户端成功'
                });
            } catch (e) {
                res.send({
                    code: -1,
                    msg: '踢出VPN当前连接客户端失败' + e
                });
            }
        });
        /**
         * 踢出VPN当前用户连接客户端
         */
        router.get('/getClientConfig', async (req, res) => {
            try {
                let data = this.vpn.config.getClientConfig();
                res.type('text/plain'); // 设置MIME类型为纯文本
                res.attachment('config.ovpn')
                res.send(data);
            } catch (e) {
                res.send({
                    code: -1,
                    msg: '踢出VPN当前连接客户端失败' + e
                });
            }
        });
        this.controller = router;
    }

    setVPNCore(vpn) {
        this.vpn = vpn;
        return this;
    }

    setIptableManager(manager) {
        this.manager = manager;
        return this;
    }

    setConfigDAO(dao) {
        this.configDAO = dao;
        return this;
    }

    create() {
        return this.controller;
    }
}
module.exports = VPNController;