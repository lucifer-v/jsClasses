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