jQuery.fn.extend({
    /**
     * 将获取的内容加载到元素的内部
     * 如果从选择器中选择到了多个元素，只对第一个元素有效
     *
     * @date 2015/12/10 17:57
     * @param _url 待获取其内容页面的url地址
     * @returns {jQuery}
     */
    loadPage:function( _url ){

        var domObj = this[0];
        if( undefined == _url ){
            return this;
        }
        if( undefined == domObj.isLoaded || domObj.lastUrl != _url ){
            domObj.lastUrl = _url;          //设置上次加载的url地址
            domObj.isLoaded = true;         //已经加载

            $.get( _url, null, function( _rspResult ){
                $(domObj).html(_rspResult);
            })
        }//if
        return this;
    },
    /**
     * 点击当前checkbox时，选择器中指定的其他checkbox变为和当前
     * checkbox一样的状态
     *
     * @date 2015/12/10 18:59
     * @apply 适用于复选框的全选和取消全选
     *
     * @param _selector 受当前checkbox的其他checkbox的选择器
     * @returns {jQuery}
     */
    cbxToggleSelect:function( _selector ){
        var $obj = this;
        this.click(function(){
            if( $obj.prop("checked") ){
                $(_selector).filter(":not(:checked)").prop("checked", true);
            }else{
                $(_selector).filter(":checked").prop("checked", false);
            }
        });//click
        return this;
    }

});//extend

jQuery.extend({
    /**
     * 检测当前<img>的src是否是没有实际图片的情况
     * 次函数需要根据项目进行针对型配置
     *
     * @param _src 待检测的图片路径
     * @return 图片为空返回 true
     *         不为空则返回 false
     */
    isPictureEmpty:function( _src ){

        //wbk项目中当图片不存在时，指定显示的图片路径
        var emptyPicurl = "/Public/images/no_picture.png";

        if( _src == emptyPicurl ){
            return true;
        }
        return false;
    },
    /**
     * 单条数据删除确认
     * @date 2015/12/17 15:45
     * @param _confirmMsg 提示信息
     * @returns 如果继续，返回true
     *          否则，返回false
     */
    singleDelConfim:function( _confirmMsg ){
        if( undefined == _confirmMsg || null == _confirmMsg ){
            _confirmMsg = "删除将导致数据不可恢复,是否继续?";
        }
        return confirm( _confirmMsg );
    },
    /**
     * 当点击当前控件时，进行批量删除确认
     * @date 2015/12/17 15:54
     * @notes 必须遵守lucius前端命名规则
     * @param _selector 包含所有相关待删除行的任意祖先元素
     * @param _confirmMsg 删除确认信息
     * @returns 如果继续，返回idSet结果集 {2d Array}
     *             否则，返回false
     */
    batchDelConfirm:function( _selector, _confirmMsg ){
        var $cbxSet = $("input[type=checkbox]:checked", _selector);
        if( 0 == $cbxSet.length ){
            alert("请先选择要删除的记录");
            return false;
        }

        if( undefined == _confirmMsg || null == _confirmMsg ){
            _confirmMsg = "删除将导致数据不可恢复,是否继续?";
        }

        /*删除确认*/
        if( confirm( _confirmMsg )){

            var idSet = [];
            $cbxSet.each(function(){
                idSet.push( $(this).attr("data-id") );
            });

            return idSet;
        }else{
            return false;
        }
    },
    /**
     * 按给定的id集合，Ajax方式删除记录(GET请求)
     * @date 2015/12/17 15:33
     * @notes 在后台通过 $_GET['idSet']获取到传递的数据
     *        并且后台的返回数据要符合 rspResult对象的规范
     * @param _reqUrl {string} '删除'接口url地址
     * @param _idSet {2d array} 指定的id集合
     */
    delRecordsByIdSet:function( _reqUrl, _idSet ){
        $.get(_reqUrl, {idSet:_idSet}, function( _rspResult ){
            if( 0 == _rspResult.state ){
                alert(_rspResult.sucMsg);
                location.reload();   //刷新页面
            }else{
                alert(_rspResult.errMsg);
            }
        });
    },
    /**
     * 通过给定的数据对象，Ajax方式更新记录
     * @date 2015/12/17 17:20
     * @notes 在后台通过 $_POST[]获取到传递的数据
     * @param _reqUrl {}
     * @param _data
     */
    updateRecords:function( _reqUrl, _data ){
        $.post(_reqUrl, _data, function( _rspResult ){
            if( 0 == _rspResult.state ){
                alert(_rspResult.sucMsg);
                location.reload();   //刷新页面
            }else{
                alert(_rspResult.errMsg);
            }
        });
    },
    /**
     * Ajax分页相关函数
     * 使用GET方式，ajax获取分页数据
     *
     * @param _reqUrl 请求接口地址
     * @param _page 待请求的页面数=
     * @param _extraData 需要传递给后台的数据
     * @param _fnDisplayData 加载数据后台返回数据的回调函数
     * @param _callback 善后操作，当获取数据完成后调用
     */
    getListByPage:function( _reqUrl, _page, _extraData, _fnDisplayData, _callback ){
        if( null == _page || undefined == _page ){      //默认获取第一页
            _page = 1;
        }
        _reqUrl += "/_page/"+_page;     //添加页数

        //请求第_page页的数据
        $.get(_reqUrl, _extraData, function( _rspResult ) {

            if (0 == _rspResult.state) {    //获取成功
                _fnDisplayData(_rspResult.data);
            } else {
                alert(_rspResult.errMsg);
            }

            //善后处理
            ( typeof _callback == "function" ) && _callback();
        });
    },
    /**
     * Ajax分页相关函数
     *
     * @param _pSelector 分页相关按钮所在的父选择器
     * @param _callback 回调函数，本函数为回调函数提供合理的的'页面数'
     */
    bindPageBtnHandler : function( _pSelector, _callback ){

        $(_pSelector).on("click", "#btn_firstPage, #btn_prePage, #btn_nextPage, #btn_lastPage", function(){

            var toPage = $(this)[0].dataset.page;
            var curPage = parseInt($("#curPage").html());

            if( toPage == curPage ){        //如果已经是当前页面，直接返回
                return ;
            }

            ( typeof _callback == "function" ) && _callback( toPage );
        });
    },
    /**
     * Ajax分页相关函数
     *
     * @param _pSelector 分页相关按钮所在的父选择器
     * @param _callback 回调函数，本函数为回调函数提供合理的的'页面数'
     */
    bindJumpBtnHandler : function( _pSelector, _callback ){

        $(_pSelector).on("click", "#btn_jump", function(){

            var toPage = $("#txt_toPage").val();
            if( '' == toPage ){
                alert("请输入要跳转的页码！");
            }

            var firstPage = $("#btn_firstPage")[0].dataset.page;
            var lastPage = $("#btn_lastPage")[0].dataset.page;
            toPage = parseInt( toPage );

            if( toPage < firstPage || toPage > lastPage ){
                alert("输入的页码不正确");
                return;
            }

            ( typeof _callback == "function" ) && _callback( toPage );
        });
    },
    /**
     * 关闭artDialog对话框，如果提供id，则关闭指定的对话框，否则关闭所有
     * 依赖：artDialog4.3 库
     * @param _dlgId 指定要关闭的 artDialog 对话框id
     */
    closeArtDialog : function( _dlgId ){

        if( undefined == _dlgId || null == _dlgId || '' == _dlgId ){
            //关闭所有对话框
            var list = $.dialog.list;
            for( var dlgId in list ){
                list[dlgId].close();
            }
        }else{
            //关闭指定对话框
            $.dialog.list[_dlgId].close();
        }
    },
    /**
     * 获取指定artDialog的标题
     * 依赖：artDialog4.3 库
     * @param _dlgId 要获取其标题的artDialog对话框id
     */
    getArtDialogTitle : function( _dlgId ){
        return $.dialog.list[_dlgId].title().innerHTML.trim();
    }
});