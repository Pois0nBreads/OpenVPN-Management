(() => {
    let html = `
<!-- 加载中模态框 -->
<div class="modal fade" id="loadingModal" data-backdrop="static" data-keyboard="false" tabindex="-1">
    <div class="modal-dialog modal-sm">
        <div class="modal-content">
            <div class="modal-body text-center">
                <div class="spinner" style="font-size: 24px; margin-bottom: 10px;">⏳</div>
                <h5>正在修改</h5>
            </div>
        </div>
    </div>
    <script>
        let loadingModal = {
            show: () => {
                $('#loadingModal').modal('show');
            },
            hide: () => {
                $('#loadingModal').modal('hide');
            }
        }
    </script>
</div>

<!-- 失败弹窗 -->
<div class="modal fade" id="errorModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                <h4 class="modal-title">操作失败</h4>
            </div>
            <div class="modal-body">
                <p id="errorModal-message"></p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>
            </div>
        </div>
    </div>
    <script>
        let errorModal = {
            show: (msg, next) => {
                $('#errorModal').on('hidden.bs.modal', e => {if (next) next();else reflush();} );
                $('#errorModal-message').text(msg || '操作失败。');
                $('#errorModal').modal('show');
            },
            hide: () => {
                $('#errorModal').modal('hide');
            }
        }
    </script>
</div>

<!-- 成功弹窗 -->
<div class="modal fade" id="successModal" tabindex="-1">
    <div class="modal-dialog modal-sm">
        <div class="modal-content">
            <div class="modal-body text-center">
                <h5><span class="glyphicon glyphicon-check"></span><span id="successModal-message">操作成功！</span></h5>
                <button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>
            </div>
        </div>
    </div>
    <script>
        let successModal = {
            show: (msg, next) => {
                $('#successModal').on('hidden.bs.modal', e => {if (next) next();else reflush();} );
                $('#successModal-message').text(msg || '操作成功！');
                $('#successModal').modal('show');
            },
            hide: () => {
                $('#successModal').modal('hide');
            }
        }
    </script>
</div>

<!-- 确认弹窗 -->
<div class="modal fade" id="confirmModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                <h4 class="modal-title">确认操作?</h4>
            </div>
            <div class="modal-body">
                <p id="confirmModal-message"></p>
            </div>
            <div class="modal-footer">
                <button id="confirmModal-button" type="button" class="btn btn-success"
                    data-dismiss="modal">确认</button>
                <button type="button" class="btn btn-default" data-dismiss="modal">取消</button>
            </div>
        </div>
    </div>
    <script>
        let confirmModal = {
            show: (msg, next) => {
                $('#confirmModal-button').off('click').click(() => next());
                $('#confirmModal-message').text(msg);
                $('#confirmModal').modal('show');
            },
            hide: () => {
                $('#confirmModal').modal('hide');
            }
        }
    </script>
</div>
`
    $('body').append($(html));
})();

