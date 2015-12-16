/**
 * changelog: 2015/12/17 02:22 添加内置验证规则方法 isInt(),验证表单值是否为整数
 * changelog: 2015/12/16 11:48 修改input[type=checkbox]以及input[type=radio]控件的值采集逻辑
 * changelog: 2015/12/16 10:48 添加一个标志变量 bCollectDisabled，以及设置的此属性的方法 disabledOn(),disabledOff()
 *            是否收集处于disbled状态下的数据，默认不收集
 */
jQuery.extend({
		pageH:function( _selector ){

				/*获取控件集合*/
				$.ph = {};
                var ph = $.ph;
                ph.bCollectDisabled = false;
                ph.errMsg = "";

				//采集规则
				ph.collectRules = {
						'txt' : 'input[type=text], input[type=password], textarea'	,
						'selc' : 'select',
						'span' : "span",
						'cbx' : "input[type=checkbox]",
                        'rdo' : "input[type=radio]",
						'btn' : "input[type=button], a[href=#], button",
						'hd' : "input[type=hidden]",
                        'img' : "img"
				};
				/** 
				  *内置验证函数
				  *供ph.doValidate方法使用
				  *验证函数，验证通过则返回true，不通过则返回false
				  */
				ph.validateRules = {
                        //是否已经填写
						'required' : function( _arg ){
								if( "" == this.val().trim() ){
										ph.errMsg = _arg;
										return false;
								}
								return true;
						},
                        //是否与指定表单控件的值相等
						'confirm' : function( _arg ){
								var argComp = _arg.split(":");
								var $target  = $( "#"+argComp[0] );
								if( $target.val().trim() != this.val().trim() ){
										ph.errMsg = argComp[1];
										return false;
								}
								return true;
						},
                        //是否是整数
                        'isInt' : function( _arg ){
                            var isTrue = /\d/.test( this.val().trim() );
                            if( !isTrue ){
                                ph.errMsg = _arg;
                                return false;
                            }
                            return true;
                        }
				};
				//前导标记
				ph.leadingMark = {
						'required' : '<span class="ph_required">*</span>'
				};

				//表单元素采集
				(ph.collect = function( _s ){

						if( undefined == _s || "" ==_s ){
								_s= $("body");
						}
						if( undefined == _s.jquery ){		//如果不是 jq 对象
								_s = $( _s );
						}
						var rules = ph.collectRules, set;
						for( var tag in rules ){
								ph[ tag + "Set" ] = $( rules[tag], _s);
						}

						return ph;
				})( _selector );
		
				/*准备前导标识，为拥有前导标识者添加对应的data-check项*/
				(function(){
						var rules = ph.collectRules;		//采集规则
						for( var tag in rules){
								if( ['span', 'btn', 'hd'].indexOf(tag) >= 0 )	continue;

								ph[ tag + 'Set' ].each(function(){
										var $obj = $(this);
										if( undefined == $obj.attr("data-required") ){		//如果没有required,继续
												return true;
										}
										
										var id = tag + "_" + $obj.attr("name");
										$("label[for=" + id + "]").prepend( ph.leadingMark.required );

										//将required验证加入data-check
										var dataCheck = $obj.attr("data-check");
										dataCheck = ( undefined == dataCheck ) ? 'required' : 'required,' + dataCheck ;
										$obj.attr("data-check", dataCheck);
								});
						}//for
				})();//run

                /* 允许采集disabled下的表单数据 */
                ph.disabledOn = function(){
                    this.bCollectDisabled = true;
                    return this;
                };

                /* 禁止采集disabled下的表单数据 */
                ph.disabledOff = function(){
                    this.bCollectDisabled = false;
                    return this;
                };

				/* 验证函数注册 */
				ph.validateRegister = function( _funcName, _callback ){
						ph.validateRules[_funcName] = _callback;
				};

				/* 通知错误消息 */
				ph.notice = function( _callback ){
						if( $.isFunction(_callback) ){
								_callback( this.errMsg );
						}else{
								alert( this.errMsg );		
						}
				};

				/* 数据验证- 验证txt/selc */
				ph.doValidate = function(){
							var isPassed = true, target = ['txt', 'selc'];
							for(var i=0, len = target.length; i<len; i++ ){
									this[target[i]+"Set"].each(function(){
										    var $obj = $(this);
											var funcSetStr = $obj.attr("data-check");		//检测列表
											//如果不需要验证，则继续
											if( undefined == funcSetStr || "" == funcSetStr ){
													return true;
											}

											//逐个验证
											var funcSet  = funcSetStr.split(","), arg;
											for( var j=0, len2 = funcSet.length; j<len2; j++){
													if( undefined == ph.validateRules[ funcSet[j] ] ){
															isPassed = false;
															ph.errMsg = "元素id="+$obj.attr("id")+"没有找到对应的验证函数"+funcSet[j];
															return false;
													}

													arg = $obj.attr( "data-"+funcSet[j] );
													isPassed = ph.validateRules[ funcSet[j] ].call( $obj, arg );		//传递元素的jq对象
													if( !isPassed ){
															return false;
													}
											}//for
									});//each
									if( !isPassed ) return false;
							}//for

							return isPassed;
				};//doValidate

				/* 将表单元素的值以对象形式返回 */
				ph.getFormDataObj = function( _tagAry ){
						_tagAry = (undefined == _tagAry) ?  ['txt', 'selc', 'cbx', 'rdo'] : _tagAry;
						if(  !$.isArray( _tagAry ) )  return null;
						
						var dataObj = {}, i, $obj, $elementSet;
						for( i = 0, len = _tagAry.length; i < len; i++){

                            $elementSet = ph[ _tagAry[i] + "Set" ];
                            if( 'img' == _tagAry[i] ){

                                $elementSet.each(function(){
                                    $obj = $(this);
                                    dataObj[ $obj.attr('name') ] = $obj.attr("src");
                                });

                            }else if( 'rdo' == _tagAry[i] ){

                                $elementSet.each(function(){
                                    $obj = $(this);
                                    if( !$obj.prop("checked") ){  //不采集未选中的数据
                                        return true;
                                    }
                                    if( !ph.bCollectDisabled && $obj.prop("disabled") ){  //不采集disabled
                                        return true;
                                    }
                                    dataObj[ $obj.attr('name') ] = $obj.val();
                                });

                            }else if( 'cbx' == _tagAry[i] ){

                                $elementSet.each(function(){
                                    $obj = $(this);
                                    if( !$obj.prop("checked") ){  //不采集未选中的数据
                                        return true;
                                    }
                                    if( !ph.bCollectDisabled && $obj.prop("disabled") ){  //不采集disabled
                                        return true;
                                    }
                                    dataObj[ $obj.attr('name') ] = $obj.val();
                                });

                            }else{
                                $elementSet.each(function(){
                                    $obj = $(this);
                                    if( !ph.bCollectDisabled && $obj.prop("disabled") ){    //不采集disabled下的数据
                                        return true;
                                    }
                                    dataObj[ $obj.attr('name') ] = $obj.val();
                                });

                            }//else
						}//for

						return dataObj;
				}//getFormDataObj
				
				/**将表单元素的值以查询字符的形式返回(Qstr = query string)**/
				ph.getFormDataQstr = function( _tagAry ){

						var dataObj = this.getFormDataObj( _tagAry );
						if( null == dataObj ) return "";
						
						var argItems = [];
						for(var key in dataObj){
								argItems.push( key + "=" + dataObj[key] );
						}
						return argItems.join("&");
				}//getFormDataQstr
				
				/****/
				ph.getTxtByName = function( _name ){
						var selector = "input[type=text][name="+_name+"],"+
													"input[type=password][name="+_name+"],"+
													"textarea[name="+_name+"]";
						return this.txtSet.filter(selector);
				}

				/****/
				ph.getTxtValByName = function( _name ){
						var selector = "input[type=text][name="+_name+"],"+
													"input[type=password][name="+_name+"],"+
													"textarea[name="+_name+"]";
						return this.txtSet.filter(selector).val().trim();
				}

                /****/
                ph.getHdValByName = function( _name ){
                    return this.hdSet.filter("[name=" + _name + "]").val().trim();
                }
				
				/****/
				ph.getSelcByName = function( _name ){
						return this.selcSet.filter("[name=" + name + "]");
				}

				/****/
				ph.getSelcValByName = function( _name ){
						return this.selcSet.filter("[name=" + name + "]").val().trim();
				}
				
				/****/
				ph.getSpanById = function( _id ){
						return this.spanSet.filter("#" + _id);
				}
				
				/****/
				ph.getSpanValById = function( _id ){
						return this.spanSet.filter("#" + _id).html().trim();
				}

                /****/
                ph.getImgByName = function( _name ){

                    return this.imgSet.filter("[name=" + _name + "]");
                }

				return ph;
		}//pageH()
});//extend