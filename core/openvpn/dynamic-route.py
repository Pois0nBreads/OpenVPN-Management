#!/usr/bin/env python2
# -*- coding: utf-8 -*-
import sys
import os
import socket

# OpenVPN 会传递1个参数：
# 1. 临时配置文件的路径
# 2. 从环境变量username读取cn
if len(sys.argv) < 2:
    sys.stdout.write("错误: 参数不足。需要 Common Name 和配置文件路径。\n")
    sys.exit(1)
client_cn = os.environ.get('username')
config_file_path = sys.argv[1]

# 配置Unix Socket参数
SOCKET_PATH = '/tmp/openvpn.route.sock'

# 检查套接字文件是否存在
if not os.path.exists(SOCKET_PATH):
    sys.exit(-1)

# 创建Unix域套接字连接
client = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)

def on_connect():
    #print '已连接到OpenVPN Core Auther服务端'
    client.send('%s' % (client_cn))

def on_end():
    #print '连接已关闭'
    client.close()

def on_data(data):
    msg = data.strip()
    print 'msg: '
    print msg
    # 将路由指令写入临时配置文件
    try:
        with open(config_file_path, 'a') as f:
            f.write(msg + '\n')
            print("为客户端 {} 推送路由: {}".format(client_cn, msg))
    except IOError as e:
        sys.stdout.write("错误: 无法写入配置文件 {}: {}\n".format(config_file_path, e))
        sys.exit(1)

# 设置事件处理
try:
    client.settimeout(10)  # 设置超时
    client.connect(SOCKET_PATH)
    on_connect()  # 连接成功后立即调用
    
    while True:
        data = client.recv(1024)
        if not data:
            break
        on_data(data)
except socket.timeout:
    print '连接超时'
    sys.exit(-1)
except Exception as e:
    print '发生错误: %s' % e
    sys.exit(-1)
finally:
    on_end()