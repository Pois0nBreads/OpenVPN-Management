//登出接口
function logout() {
    $.ajax({
        url: '/api/user/logout',
        method: 'POST',
        contentType: 'application/json',
        timeout: 10000
    });
    
    localStorage.removeItem('authToken');
    window.location.href = '/';
}

//检查token权限，跳转到对应网页
function checkPermission() {
    const savedToken = localStorage.getItem('authToken');
    if (!savedToken) {
        window.location.href = '/';
        return;
    }
    $.ajax({
        url: '/api/user/mylevel',
        method: 'POST',
        contentType: 'application/json',
        headers: { "Authorization": savedToken},
        timeout: 10000
    })
    .done(function(response) {
        $('#loadingModal').modal('hide');
        switch (response.level) {
            case 1:
                console.log('普通用户');
                window.location.href = '/user/';
                break;
            case 2:
                console.log('管理员');
                window.location.href = '/admin/';
                break;
            default:
                console.log('无权限');
                localStorage.removeItem('authToken');
                window.location.href = '/';
                break;
        }
    })
    .fail(function(xhr, status, error) {
        window.location.href = '/';
    });
}

//检查权限
function checkResCode(next) {
    return function(res) {
        if (res.code == 401) {
            checkPermission();
            return;
        }
        if (res.code != 0) {
            console.log(res);
            return;
        }
        next(res);
    }
}