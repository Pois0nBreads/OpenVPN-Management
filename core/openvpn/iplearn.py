#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
import socket
import sys

#接收传参
op = sys.argv[1]    #操作类型
addr = sys.argv[2]  #IP地址
cn = 'null'
if len(sys.argv) > 3:
    cn = sys.argv[3]    #用户名
print "Learn Ip Address - <op: %s> <addr: %s> <cn: %s>" % (op, addr, cn)

# 配置参数
SOCKET_PATH = '/tmp/openvpn.iplearn.sock'

# 检查套接字文件是否存在
if not os.path.exists(SOCKET_PATH):
    sys.exit(-1)

# 创建Unix域套接字连接
client = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)

def on_connect():
    #print '已连接到OpenVPN IP Learn服务端'
    client.send('%s\n%s\n%s' % (op, addr, cn))

def on_end():
    #print '连接已关闭'
    client.close()


# 设置事件处理
try:
    client.settimeout(10)  # 设置超时
    client.connect(SOCKET_PATH)
    on_connect()  # 连接成功后立即调用
except socket.timeout:
    print '连接超时'
    sys.exit(-1)
except Exception as e:
    print '发生错误: %s' % e
    sys.exit(-1)
finally:
    on_end()
    
    
sys.exit(0)
