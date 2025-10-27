/**
*	package httpserver/systemController.js
**/
const express = require('express');
const os = require('os');
const { exec } = require('child_process');
const util = require('util');
const SystemInformation = require('systeminformation');
const execPromise = util.promisify(exec);

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

        
        this.controller = router;
    }

    create() {
        return this.controller;
    }
}
module.exports = SystemController;