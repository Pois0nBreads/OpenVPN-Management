#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
import socket
import sys

# 从环境变量获取用户名和密码
username = os.environ.get('username')
password = os.environ.get('password')

#print "用户名: %s, 密码: %s" % (username, password)

# 配置参数
SOCKET_PATH = '/tmp/openvpn.passwd.sock'

# 检查套接字文件是否存在
if not os.path.exists(SOCKET_PATH):
    sys.exit(-1)

# 创建Unix域套接字连接
client = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)

def on_connect():
    #print '已连接到OpenVPN Core Auther服务端'
    client.send('%s\n%s' % (username, password))

def on_end():
    #print '连接已关闭'
    client.close()

def on_data(data):
    msg = data.strip()
    if msg == '0':
        print '验证成功！'
        sys.exit(0)
    elif msg == '1':
        print '密码错误！'
        sys.exit(1)
    elif msg == '2':
        print '用户不存在！'
        sys.exit(2)
    else:
        print '未知返回码！'
        sys.exit(-1)

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
