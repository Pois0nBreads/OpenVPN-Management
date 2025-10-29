/**
*	package httpserver/systemController.js
**/
const express = require('express');
const os = require('os');
const SystemInformation = require('systeminformation');
const { execSync } = require('child_process');

//时间戳变 xxd xxh xxm xxs
function time2day(time){
    let upS = time % 60;
    time = (time - upS) / 60;
    let upM = time % 60;
    time = (time - upM) / 60;
    let upH = time % 24;
    let upD = (time - upH) / 24;
    return `${upD}d ${upH}h ${upM}m ${upS}s`;
}

class SystemController {
    constructor(tokenManager) {
        this.tokenManager = tokenManager;
        let router = express.Router();
        /**
         * 权限管理 @Administrator
         */
        router.use(function (req, res, next) {
            if (req.__access_level > 1) {
                next();
                return;
            }
            res.type('application/json');
            res.send({ code: 401, msg: "权限不足" });
        });
        /**
         * 查询系统信息
         */
        router.post('/systemInfo', async (req, res) => {
            try {
                let cpuInfo = await SystemInformation.cpu();
                let osInfo = await SystemInformation.osInfo();
                let sysInfo = await SystemInformation.system();

                let data = {
                    hostname: osInfo.fqdn,
                    model: `${sysInfo.model} ${sysInfo.manufacturer}`,
                    cpuname: `${cpuInfo.vendor} ${cpuInfo.brand} @ ${cpuInfo.speed}GHz`,
                    arch: `${osInfo.platform} ${osInfo.arch}`,
                    target: `${osInfo.distro} ${osInfo.release} ${osInfo.arch}`,
                    kernel: osInfo.kernel,
                    localtime: new Date().toString(),
                    uptime: time2day(parseInt(os.uptime())),
                    loadavg: os.loadavg().join(', ')
                }
                res.send({
                    code: 0,
                    msg: '查询系统信息成功',
                    data: data
                });
            } catch (e) {
                res.send({
                    code: -1,
                    msg: '查询系统信息失败' + e
                });
            }
        });
        /**
         * 查询内存信息
         */
        router.post('/memInfo', async (req, res) => {
            try {
                let memData = await SystemInformation.mem();
                const toMiB = (b) => (b / 1024 / 1024).toFixed(2);

                let data = {
                    total: toMiB(memData.total),
                    available: toMiB(memData.available),
                    used: toMiB(memData.used),
                    buffers: toMiB(memData.buffers),
                    cached: toMiB(memData.cached),
                }
                res.send({
                    code: 0,
                    msg: '查询内存信息成功',
                    data: data
                });
            } catch (e) {
                res.send({
                    code: -1,
                    msg: '查询内存信息失败' + e
                });
            }
        });
        /**
         * 查询磁盘信息
         */
        router.post('/diskInfo', async (req, res) => {
            try {
                let diskData = await SystemInformation.fsSize();
                const toMiB = (b) => (b / 1024 / 1024).toFixed(2);

                for (let disk of diskData) {
                    disk.size = toMiB(disk.size)
                    disk.used = toMiB(disk.used)
                    disk.available = toMiB(disk.available)
                }
                res.send({
                    code: 0,
                    msg: '查询磁盘信息成功',
                    data: diskData
                });
            } catch (e) {
                res.send({
                    code: -1,
                    msg: '查询磁盘信息失败' + e
                });
            }
        });
        /**
         * 查询CPU负载
         */
        router.post('/cpuInfo', async (req, res) => {
            try {
                let cpuData = await SystemInformation.currentLoad();
                res.send({
                    code: 0,
                    msg: '查询CPU负载成功',
                    data: cpuData
                });
            } catch (e) {
                res.send({
                    code: -1,
                    msg: '查询CPU负载失败' + e
                });
            }
        });
        /**
         * 查询网络接口
         */
        router.post('/netInfo', async (req, res) => {
            try {
                let intfaceData = await SystemInformation.networkInterfaces();
                res.send({
                    code: 0,
                    msg: '查询网络接口成功',
                    data: intfaceData
                });
            } catch (e) {
                res.send({
                    code: -1,
                    msg: '查询网络接口失败' + e
                });
            }
        });
        /**
         * 查询防火墙接口
         */
        router.post('/firewall', async (req, res) => {
            try {
                let firewallData = this.iptableManager.getFilterTables();
                res.send({
                    code: 0,
                    msg: '查询防火墙数据成功',
                    data: firewallData
                });
            } catch (e) {
                res.send({
                    code: -1,
                    msg: '查询防火墙数据失败' + e
                });
            }
        });
        /**
         * 查询路由表接口
         */
        router.post('/route', async (req, res) => {
            try {
                const output = execSync(`route -vne`); 
                let result = output.toString().split('\n').filter(Boolean);

                let routes = [];
                for (let i = 2;i < result.length;i++) {
                    let routeRaw = result[i].split(' ').filter(Boolean);
                    let route = {};
                    route.dest      = routeRaw[0];
                    route.next      = routeRaw[1];
                    route.mask      = routeRaw[2];
                    route.flag      = routeRaw[3];
                    route.mss       = routeRaw[4];
                    route.window    = routeRaw[5];
                    route.irtt      = routeRaw[6];
                    route.iface     = routeRaw[7];
                    routes.push(route);
                }
                res.send({
                    code: 0,
                    msg: '查询路由表数据成功',
                    data: routes
                });
            } catch (e) {
                res.send({
                    code: -1,
                    msg: '查询路由表数据失败' + e
                });
            }
        });


        this.controller = router;
    }

    setConfigDAO(dao) {
        this.configDAO = dao;
        return this;
    }

    setIptableManager(manager) {
        this.iptableManager = manager;
        return this;
    }

    create() {
        return this.controller;
    }
}
module.exports = SystemController;