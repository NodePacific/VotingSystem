/*投票EOSPocafic-webapp */
window.onload = function () {
  requirejs.config({
    waitSeconds : 30,
    paths: {
      'jquery': 'https://dn-gmfproductintro.qbox.me/js/blockc-intro/jquery',
      'eosjs': 'https://dn-gmfproductintro.qbox.me/js/blockc-intro/eos',
      'eos-vote-sdk': '/js/eos/eos-vote-sdk',
      'rangeslider': '/js/rangeslider.min',
      'vue': '/js/vue.min',
      'iview': '/js/iview.min',
      'grayscale': '/js/grayscale',
      'easing': 'js/jquery.easing.min',
      'bootstrap-select': '/js/bootstrap-select.min'
    }
  })
  var sdk;
  var pledge_num_vote = 0;
  requirejs(['jquery', 'grayscale', 'iview', 'easing', 'bootstrap-select', 'vue', 'eos-vote-sdk', 'rangeslider'], function($,grayscale,iview,easing,bootstrapSelect,Vue,EosVoteSdk, rangeslider) {
    // perform anything u want
    $('html, body').scrollTop(0).animate({scrollTop: $("#vote-tip").offset().top});

    $.ajax({
      url: 'https://vot.nodepacific.com/v1/chain/get_info',
      type: 'GET',
      success: function (chainData) {
        sdk = new EosVoteSdk({
          eosjs: {
            httpEndpoint: 'https://vot.nodepacific.com',
            chainId: chainData.chain_id,
          },
          server: {
            schema: 'https',
            host: 'www.nodepacific.com',
            port: 443,
          }
        })
        Vue.use(iview);

        var $document = $(document);
        var current_language = '';
    
        var vue = new Vue({
          el: '#vote-tip',
          data: {
              visible: false
          },
          methods: {
            show: function () {
              this.visible = true;
            },
            info: function(nodesc, desc) {
              this.$Notice.info({
                // title: 'Notification title',蓝色框
                desc: nodesc ? desc : '您最多可选30个节点 '
              });
            },
            success: function(nodesc, desc) {
              this.$Notice.success({
                // title: 'Notification title',
                desc: nodesc ? desc : '取消质押成功!  '
              });
            },
            warning: function(nodesc, desc) {
              this.$Notice.warning({
                // title: 'Notification title',橙色框
                desc: nodesc ? desc : '可质押资金不足，需等待回款 '
              });
            },
            error: function(nodesc, desc) {
              this.$Notice.error({
                // title: 'Notification title',
                desc: nodesc ? desc : 'Here is the notification description. Here is the notification description. '
              });
            }
          }
        })
    
        // Initialize the elements
        $('[data-rangeslider]').rangeslider({
          polyfill: false
        });
    
        $document.on('input', '[data-rangeslider]', function(e) {
          $('.range-content__intro--num').html(e.target.value);
        });
        
        //查询初始映射账户名
        $('.import-account__key--map').on('click', function () {
          $('.mapping').show();
        })
        $('.mapping-content__confirm').on('click', function () {
          $('.mapping').hide();
          if (0 != $('.mapping-account-name').attr('data-account')) {
            $('.change-account').val($('.mapping-account-name').html());
          } else {
            $('.change-account').val('');
          }
          
          if ($.trim($('.private').val()) == '' || $.trim($('.change-account').val()) == '') {
            $('.import-account__import--btn').attr('disabled', 'disabled').removeClass('import-start');
            return false;
          }
          $('.import-account__import--btn').removeAttr('disabled').addClass('import-start');
        })
        $('.mapping-content__close').on('click', function () {
          $('.mapping').hide();
        })
        //active私钥描述
        $('.import-account__change--private').on('click', function () {
          $('.private-confirm').show();
        })
        $('.private-confirm__content--close').on('click', function () {
          $('.private-confirm').hide();
        })
        $('.private-confirm__content--btn').on('click', function () {
          $('.private-confirm').hide();
        })
    
        if (parseFloat(window.localStorage.getItem('web-instructions')) == 1) {
          $('.confirm').hide();
        } else {
          $('.confirm').show();
        }
    
        //数字分割
        Number.prototype.formatMoney = function(c, d, t){
          var n = this,
              c = isNaN(c = Math.abs(c)) ? 2 : c,
              d = d == undefined ? "." : d,
              t = t == undefined ? "," : t,
              s = n < 0 ? "-" : "",
              i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
              j = (j = i.length) > 3 ? j % 3 : 0;
          return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
        };
        
        var _balance_num = parseFloat($('.balance-num').html()).formatMoney(4,'.',',');
        $('.balance-num').html(_balance_num);
        //点击跳过
        $('.confirm-content__jump-btn').on('click', function () {
          $('.confirm').hide();
          window.localStorage.setItem('web-instructions', '1');
        })
    
        //中英文切换
        var tip = {};
        var languageMobile = {};
        var _current_tip = '';
        $.ajax({
          url: '/js/json/language-mobile.json',
          type: 'GET',
          success: function (res) {
            languageMobile = res;
            tip = languageMobile.english.tip;
            if (window.location.hash == '#zh_chs' || window.location.hash == '#english' || window.location.hash == '#zh_cht') {
              $('.pacific_tab').attr('href', '/vote' + window.location.hash);
              $('.home_tab').attr('href', '/' + window.location.hash);
              if ('#zh_chs' == window.location.hash) {
                _current_tip = '';
                languageChange(languageMobile.zhChs);
                tip = languageMobile.zhChs.tip;
              } else if ('#english' == window.location.hash) {
                _current_tip = 'english';
                languageChange(languageMobile.english);
                tip = languageMobile.english.tip;
              } else if ('#zh_cht' == window.location.hash) {
                _current_tip = '';
                languageChange(languageMobile.zhCht);
                tip = languageMobile.zhCht.tip;
              }
              $('.dropdown-menu__li').each(function (e) {
                if ('#' + $(this).attr('data-language') == window.location.hash) {
                  $('.current-language').html($(this).children('a').html());
                  $('.dropdown-toggle .current-language').html($(this).children('a').html());
                  $(this).addClass('active');
                }
              })
            } else {
              _current_tip = 'english';
              languageChange(languageMobile.english);
              tip = languageMobile.english.tip;
              $('.dropdown-menu__li').each(function (e) {
                if ($(this).attr('data-language') == 'english') {
                  $('.current-language').html($(this).children('a').html());
                  $('.dropdown-toggle .current-language').html($(this).children('a').html());
                  $(this).addClass('active');
                }
              })
            }
          }
        })
    
        var accountIntro = '';
        
        //语言切换事件
        var vote_advice_desc = '';
        $('.dropdown-menu__li').on('click', function () {
          $('.current-language').html($(this).children('a').html());
          $('.dropdown-toggle .current-language').html($(this).children('a').html());
          var _tip = $(this).attr('data-language');
          $(this).addClass('active').siblings().removeClass('active');
          current_language = _tip;
          // updateURLParameter(window.location.href, 'language', _tip);//修改url参数
    
          // window.location.replace('language', _tip)
          $('.pacific_tab').attr('href', '/vote#' + current_language);
          $('.home_tab').attr('href', '/#' + current_language);
          if ('zh_chs' == _tip) {
            _current_tip = '';
            languageChange(languageMobile.zhChs);
            tip = languageMobile.zhChs.tip;
          } else if ('english' == _tip) {
            _current_tip = 'english';
            languageChange(languageMobile.english);
            tip = languageMobile.english.tip;
            
          } else if ('zh_cht' == _tip) {
            _current_tip = '';
            languageChange(languageMobile.zhCht);
            tip = languageMobile.zhCht.tip;
          }
        })
        
        //设置字体大小
        var getSizeFun = function (change_ele, compare_ele) {
          var fontSize = 24;
          if ($(change_ele).width() > $(compare_ele).width()) {
            fontSize -= 4;
            $(change_ele).css('font-size', fontSize + 'px');
            getSizeFun(change_ele, compare_ele);
          }
        }
    
        var languageChange = function (language) {
          language.title.forEach(function (e, index) {
            $('.navbar-nav li:eq('+(index+1)+') a').html(e);//tab标题
          })
          $('.import-account__title').html(language.importAccount.title);
          $('.account-eos').html(language.importAccount.keyDesc);
          $('.import-account__key--map').html(language.importAccount.clickInquireDesc);
          $('.inqure-name').html(language.importAccount.inquireName);
          $('.import-account__inqure--btn--desc').html(language.importAccount.inquireAccount);
          $('.private-account').html(language.importAccount.inquireDesc);
          $('.import-account__change--private').html(language.importAccount.active_key);
          $('.worry_private-desc').html(language.importAccount.private_worry);
    
          $('.mapping-content__title').html(language.mapping.title);
          $('.mapping-content__inquire--btn--desc').html(language.mapping.inquireBtn);
          $('.mapping-content__account--desc').html(language.mapping.start_account);
          $('.mapping-content__confirm').html(language.mapping.confirmBtn);
    
          $('.private-confirm__content--title').html(language.private_active.title);
          $('.private-confirm__content--desc').html(language.private_active.desc);
          $('.private-confirm__content--btn').html(language.private_active.know);
    
          var _html = ''; 
          language.jump.desc.forEach(function (e) {
            _html += '<p class="confirm-content__desc--single">'+e+'</p>';
          })
          $('.confirm-content__desc').html(_html);
          $('.konw-eos').html(language.jump.know);
          $('.konw-code').html(language.code);
          $('.private').attr('placeholder', language.importAccount.keyPlaceholder);
          $('.change-account').attr('placeholder', language.importAccount.accountNamePlaceholder);
          $('.import-account__import--btn--desc').html(language.importAccount.importBtn);
          $('.pledge-title').html(language.pledge.title);
          $('.confirm-content__source').html(language.code);
          $('.account-balance').html(language.pledge.total);
          $('.pledge-already').html(language.pledge.pledgeAlready);
          $('.repayment').html(language.pledge.repayment);
          $('.balance-desc').html(language.pledge.totalTitle+'：'+language.pledge.totalDesc);
          $('.pledge-desc').html(language.pledge.pledgeAlreadyTitle+'：'+language.pledge.pledgeAlreadyDesc);
          $('.payment-desc').html(language.pledge.repaymentTitle+'：'+language.pledge.repaymentDesc);
          $('.range-desc').html(language.pledge.barDesc);
          $('.poll-title').html(language.poll.title);
          $('.poll-content__btn--desc').html(language.poll.pollBtn);
          $('.pledge-btn--desc').html(language.pledge.pledgeBtn);
          $('.confirm-content__jump-btn').html(language.jump.jump_btn);
          $('.disclaimer').html('《'+ language.disclaimer +'》').attr('href', '/vote/disclaimer'+window.location.hash);
          $('.empty-vote__desc').html(language.import_account);
          $('.recommend-account').html(language.recommend);
          $('.poll-content__append--desc').html(language.poll.pollDesc);
          $('.public-key__input').attr('placeholder', language.mapping.public_placeholder);
          $('.poll-show').html(language.pledge.showNode);
          $('.poll-disclaimer__desc').html(language.pledge.disclaimerTitle);
          $('.disclaimer-confirm__content--title').html(language.disclaimerConfirm.title);
          $('.disclaimer-confirm__content--intro').html(language.disclaimerConfirm.intro);
          $('.disclaimer-confirm__content--footer--know').html(language.private_active.know);
          vote_advice_desc = language.recommend;
          setTimeout(function () {
            $('.pledge-content .pledge-content__bar').height($('.pledge-content .pledge-content__account').height()+10+'px');
          })
          //查看免责声明
          $('.poll-disclaimer__desc').on('click', function () {
            $('.disclaimer-confirm').show();
          })
          $('.disclaimer-confirm__content--footer--know').on('click', function () {
            $('.disclaimer-confirm').hide();
          })
        }
    
        //查询账户名
        var accountNameNum = 0;
        var _inquire_flag = false;
        $('.mapping-content__inquire--btn').on('click', function () {
          var _this = this;
          
          if ('' == $.trim($('.public-key__input').val())) {
            vue.warning(true, tip.tip1);
            return false;
          }
    
          if (true == _inquire_flag) {
            return false;
          }
    
          _inquire_flag = true;
    
          $('.mapping-account-name').html('--');
          //根据公钥获取初始账户名
          sdk.fetchDefaultAccount({ //查询账户名
            eosPublicKey: $.trim($('.public-key__input').val())
          })
          .then(function (res) {
            if (0 == res.code) {
              accountNameNum = res.data.length;
              if (res.data.length > 1) {
                var _option_html = '';
                var _option_first = '';
                var _active = '';
                res.data.forEach(function (e, index) {
                  if (0 == index) {
                    $('.mapping-account-name').html(e.account_name).attr('data-account', accountNameNum);
                    _active = 'active';
                  } else {
                    _active = '';
                  }
                  _option_html += 
                    '<li class="dropdown-menu__li '+_active+'" value="'+e.account_name+'">' +
                      '<a href="#">'+e.account_name+'</a>' +
                    '</li>';
                })
                $('.mapping-content__account .dropdown').append('<ul class="dropdown-menu">'+_option_html+'</ul>');
                $('.mapping-content__account .dropdown-toggle .caret').show();
                $('.mapping-content__account .dropdown .dropdown-toggle').css('cursor', 'pointer');
                //账户名切换事件
                $('.mapping-content__account .dropdown-menu .dropdown-menu__li').on('click', function () {
                  $(this).addClass('active').siblings().removeClass('active');
                  $('.mapping-account-name').html($(this).children('a').html()).attr('data-account', accountNameNum);
                })
    
              } else if (res.data.length == 1){
                $('.mapping-account-name').html(res.data[0].account_name).addClass('vote-name').attr('data-account', accountNameNum);
                $('.mapping-content__account .dropdown-toggle .caret').hide();
                $('.mapping-content__account .dropdown .dropdown-toggle').css('cursor', 'auto');
              } else {
                vue.warning(true, tip.tip2);//'查询失败，请重试！'
                $('.mapping-account-name').html('--').attr('data-account', accountNameNum);
              }
              _inquire_flag = false;
            } else {
              vue.warning(true, tip.tip2);//'查询失败，请重试！'
              _inquire_flag = false;
            }
          })
          .catch(function (error) {
            vue.warning(true, tip.tip2);//'查询失败，请重试！'
            _inquire_flag = false;
          })
        })
    
        //查询账户余额
        var getAccountIntro = function (_account_name, _this) {
          sdk.fetchAccountInfo({ 
            accountName: _account_name
          })
          .then(function (res) {
            $(_this).children('.loading').hide();
            if (0 == res.code) {
              accountIntro = res;
              $('.pledge-btn').removeAttr('disabled').addClass('pledge_start');
              
              var total = (parseFloat(res.data.unstaking_of_cpu)+parseFloat(res.data.unstaking_of_net)+parseFloat(res.data.balance)+parseFloat(res.data.staked_of_cpu)+parseFloat(res.data.staked_of_net)).formatMoney(4,'.',',');
    
              $('.balance-num').html(total);//账户余额
              $('.pledge-num').html(parseInt(parseFloat(res.data.staked_of_cpu)+parseFloat(res.data.staked_of_net)));//已质押
              $('.repayment-num').html(parseInt(parseFloat(res.data.unstaking_of_cpu)+parseFloat(res.data.unstaking_of_net)));//回款中
    
              getSizeFun('.balance-num', '.pledge-content .pledge-content__account .pledge-content__account--asset .pledge-content__account--asset--single:first-child');
              getSizeFun('pledge-num', '.pledge-account .pledge-account__li:last-child');
              getSizeFun('repayment-num', '.pledge-content .pledge-content__account .pledge-content__account--asset .pledge-content__account--asset--single:last-child');
    
              if (parseInt(parseFloat(res.data.staked_of_cpu)+parseFloat(res.data.staked_of_net)) > 0) {
                $('.poll-content__btn').addClass('vote_start').removeAttr('disabled');
                pledge_num_vote = parseInt(parseFloat(res.data.staked_of_cpu)+parseFloat(res.data.staked_of_net));
              }
              $('input[type="range"]').attr({
                max: parseInt(parseFloat(res.data.unstaking_of_cpu)+parseFloat(res.data.unstaking_of_net)+parseFloat(res.data.balance)+parseFloat(res.data.staked_of_cpu)+parseFloat(res.data.staked_of_net)),
                step: 1,
                value: parseInt(parseFloat(res.data.staked_of_cpu)+parseFloat(res.data.staked_of_net)),
                // min: parseInt(parseFloat(res.data.staked_of_cpu)+parseFloat(res.data.staked_of_net))
              }).rangeslider('update', true);
              $('.rangeslider__fill').addClass('rangeslider__fill--bgd');
              $('.range-content__intro .range-content__intro--num').html(parseInt(parseFloat(res.data.staked_of_cpu)+parseFloat(res.data.staked_of_net)));
              $('.range-content .range-content__bar').val(parseInt(parseFloat(res.data.staked_of_cpu)+parseFloat(res.data.staked_of_net))).change();
              _import_account_flag = false;
              _pledge_flag = false;
            } else {
              vue.warning(true, tip.tip2);//'失败，请重试！'
              _import_account_flag = false;
              _pledge_flag = false;
            }
          })
          .catch(function (error) {
            vue.warning(true, tip.tip2);//'失败，请重试！'
            _import_account_flag = false;
            _pledge_flag = false;
          })
        }
    
        //账户名输入框失去焦点
        $('.change-account').on('input', function () {
          if ($.trim($(this).val()) == '' || $.trim($('.private').val()) == '') {
            $('.import-account__import--btn').attr('disabled', 'disabled').removeClass('import-start');
            return false;
          }
          $('.import-account__import--btn').removeAttr('disabled').addClass('import-start');
        })
        $('.private').on('input', function () {
          if ($.trim($(this).val()) == '' || $.trim($('.change-account').val()) == '') {
            $('.import-account__import--btn').attr('disabled', 'disabled').removeClass('import-start');
            return false;
          }
          $('.import-account__import--btn').removeAttr('disabled').addClass('import-start');
        })
    
        $('.public-key__input').on('input', function () {
          if ($(this).val() == '') {
            $('.public-key').css('border', '1px solid rgba(154, 160, 174, .2)');
          } else {
            $('.public-key').css('border', '1px solid #487DE3');
          }
        })
        //导入账户
        var _account_name = '';
        var _import_account_flag = false;
        var next_candidate = false;
        $('.import-account__import--btn').on('click', function () {
          _account_name = $.trim($('.change-account').val());
          if (true == _import_account_flag) {
            return false;
          }
          _import_account_flag = true;
          $(this).children('.loading').show();
          var _this = this;
          sdk.checkAccountValid({
            accountName: _account_name,
            secretKey: $.trim($('.private').val())
          })
          .then(function (resp) {
            if (0 == resp.code) {
              if (true == resp.data.account_existed && true == resp.data.account_match) {//账户存在
                $('.pledge-load').show();
                $('.poll-content__btn').show();
                $('.self_account').show();
                $('.empty-vote').hide();
                $('.list_box').html('');
                $('.self_account').html('');
                $('.poll-content__append').show();
                var has_next = 1;//还有下一页
                //加载更多
                var page = 1, //分页码
                  off_on = false, //分页开关(滚动加载方法 1 中用的)
                  timers = null; //定时器(滚动加载方法 2 中用的)
                
                var LoadingDataFn = function(p, n) {
                  var dom = '';
                  $('.pledge-load').show();
                  if (0 == has_next) {
                    $('.pledge-load').hide();
                    return false;
                  }
                  
                  sdk.listCandidate({ //获取选举人列表
                    accountName: _account_name,
                    pageSize: n,
                    pageIndex: p
                  })
                  .then(function (resp) {
                    if (0 == resp.code) {
                      $('.pledge-load').hide();
                      var index_num = -1;
                      if (0 == resp.data.has_next) {
                        has_next = 0;
                      }
                      if (resp.data.candidates.length > 0) {
                        var _html = '';
                        
                        resp.data.candidates.forEach(function (e, index) {
                          var _left_change = '';
                          if (0 != index) {
                            index_num += 1;
                          }
                          if (index_num%4 == 0) {
                            _left_change = 'left_change';
                          } else {
                            _left_change = '';
                          }
                          if (0 == index && 1 == p) {
                            $('.self_account').html(
                              '<span class="pledge-change__single--inteo" style="width:auto;">'+e.displayName+'（<span class="recommend-account">'+vote_advice_desc+'</span>）</span>' +
                              '<input class="pledge-change__single--checked" type="checkbox" name="pledge" checked="checked" accountName="'+e.accountName.account_name+'"/>'
                            )
                          } else {
                            _html += 
                              '<div class="pledge-change__single '+_left_change+'">' +
                                '<span class="pledge-change__single--inteo">'+e.displayName+'</span>' +
                                '<input class="pledge-change__single--checked" type="checkbox" name="pledge" accountName="'+e.accountName.account_name+'" is_voted="'+e.isVoted+'"/>' +
                              '</div>';
                          }
                          
                        })
                        
                        $('.list_box').append(_html);
                        next_candidate = true;
                      }
                    }
                  })
                  .catch(function (error) {
                    _import_account_flag = false;
                  })  
                };
                //初始化， 第一次加载
                $(document).ready(function() {
                  LoadingDataFn(1, 40);
                });
      
                //滚动加载方法2
                $('.pledge-change__content').scroll(function() {
                  //当时滚动条离底部60px时开始加载下一页的内容
                  if ((($(this)[0].scrollTop + $(this).height() + 60) >= $(this)[0].scrollHeight) && (true == next_candidate)) {
                    clearTimeout(timers);
                    //这里还可以用 [ 延时执行 ] 来控制是否加载 （这样就解决了 当上页的条件满足时，一下子加载多次的问题啦）
                    timers = setTimeout(function() {
                      if (has_next == 1) {
                        page++;
                        next_candidate = false;
                        LoadingDataFn(page,40); //调用执行上面的加载方法
                      }
                    }, 300);
                  }
                });
      
                //还可以基window窗口（body）来添加滚动事件, (因为布局不同,所以在这里没效果，因为[上面是基于body中的某个元素来添加滚动事的])
                $(window).scroll(function() {
                  //当时滚动条离底部60px时开始加载下一页的内容
                  if ((($(window).height() + $(window).scrollTop() + 60) >= $(document).height()) && (true == next_candidate)) {
                    clearTimeout(timers);
                    timers = setTimeout(function() {
                      if (has_next == 1) {
                        page++;
                        next_candidate = false;
                        LoadingDataFn(page,40); //调用执行上面的加载方法
                      }
                    }, 300);
                  }
                });
                getAccountIntro(_account_name, _this);
                
              } else { //账户不存在
                vue.warning(true, tip.tip3);//'失败，请重试！'
                _import_account_flag = false;
                $(_this).children('.loading').hide();
              }
            } else { //账户不存在
              vue.warning(true, tip.tip3);//'失败，请重试！'
              _import_account_flag = false;
              $(_this).children('.loading').hide();
            }
          })
          .catch(function () {
            vue.warning(true, tip.tip3);//'失败，请重试！'
            _import_account_flag = false;
            $(_this).children('.loading').hide();
          })
        })
        
        //质押
        var _pledge_flag = false;
        $('.pledge-btn').off().on('click', function (e) {
          var _this = this;
          if (parseFloat($('.range-content__intro--num').html()) == 0) {
            vue.warning(true, tip.tip6);
            return false;
          }
          if (true == _pledge_flag) {
            return false;
          }
    
          _pledge_flag = true;
    
          $(this).children('.loading').show();
          sdk.fetchAccountInfo({ //查询账户余额
            accountName: _account_name
          })
          .then(function (res) {
            if (0 == res.code) {
              accountIntro = res;
              $('.pledge-btn').removeAttr('disabled').addClass('pledge_start');
              
              var total = (parseFloat(res.data.unstaking_of_cpu)+parseFloat(res.data.unstaking_of_net)+parseFloat(res.data.balance)+parseFloat(res.data.staked_of_cpu)+parseFloat(res.data.staked_of_net)).formatMoney(4,'.',',');
    
              $('.balance-num').html(total);//账户余额
              $('.pledge-num').html(parseInt(parseFloat(res.data.staked_of_cpu)+parseFloat(res.data.staked_of_net)));//已质押
              $('.repayment-num').html(parseInt(parseFloat(res.data.unstaking_of_cpu)+parseFloat(res.data.unstaking_of_net)));//回款中
    
              getSizeFun('.balance-num', '.pledge-content .pledge-content__account .pledge-content__account--asset .pledge-content__account--asset--single:first-child');
              getSizeFun('pledge-num', '.pledge-account .pledge-account__li:last-child');
              getSizeFun('repayment-num', '.pledge-content .pledge-content__account .pledge-content__account--asset .pledge-content__account--asset--single:last-child');
    
              if (parseInt(parseFloat(res.data.staked_of_cpu)+parseFloat(res.data.staked_of_net)) > 0) {
                $('.poll-content__btn').addClass('vote_start').removeAttr('disabled');
                pledge_num_vote = parseInt(parseFloat(res.data.staked_of_cpu)+parseFloat(res.data.staked_of_net));
              }
              if (parseFloat($('.range-content__intro--num').html()) == parseFloat($('.pledge-num').html())) {//当前质押数量和现有质押数量相等时
                vue.warning(true, tip.tip7);//'失败，请重试！'
                _pledge_flag = false;
                $(_this).children('.loading').hide();
                return false;
              }
              sdk.stake({
                accountName: accountIntro.data.account_name,
                stakeCount: $('.range-content__intro--num').html(),
                secretKey: $.trim($('.private').val()),
                broadcast: true//todo上线时要修改为true
              })
              .then(function (res) {
                if (0 == res.code) {
                  getAccountIntro(accountIntro.data.account_name, _this);
                  vue.success(true, tip.tip4);//质押成功
                  _pledge_flag = false;
                } else {
                  vue.warning(true, tip.tip7);//'失败，请重试！'
                  _pledge_flag = false;
                }
                $(_this).children('.loading').hide();
              })
              .catch(function (error) {
                vue.warning(true, tip.tip7);//'失败，请重试！'
                $(_this).children('.loading').hide();
                _pledge_flag = false;
              })
            } else {
              vue.warning(true, tip.tip2);//'失败，请重试！'
              _pledge_flag = false;
              $(_this).children('.loading').hide();
            }
          })
          .catch(function (error) {
            vue.warning(true, tip.tip2);//'失败，请重试！'
            _pledge_flag = false;
            $(_this).children('.loading').hide();
          })
        })
    
        //选择票数
        var _checked_num = 1;
        $(document).on('click', "input[type='checkbox']", function (e) {
          if (_checked_num >= 30 && $(this).is(':checked')) {
            vue.warning(true, tip.tip10);//投票失败'最多可投30票！'
            $(this).attr('checked', '');
            return false;
          }
          if ($(this).is(':checked')) {
            _checked_num += 1;
            
          } else {
            _checked_num -= 1;
          }
          if (_checked_num > 0 && pledge_num_vote > 0) {
            $('.poll-content__btn').removeAttr('disabled').addClass('vote_start');
          } else {
            $('.poll-content__btn').attr('disabled', 'disabled').removeClass('vote_start');
          }
        })
    
        //投票
        var _vote_flag = false;
        $('.poll-content__btn').off().on('click', function () {
          var is_voted_arr = [];
          var _this = this;
          $(this).children('.loading').show();
          var candidates = [];//所有被投票的选举人
          $(".pledge-change__single").each(function () {
            if ($(this).children("input[type='checkbox']").is(':checked')) {
              candidates.push($(this).children("input[type='checkbox']").attr('accountName'));
            }
          })
          
          if (true == _vote_flag) {
            return false;
          }
          _vote_flag = true;
    
          sdk.vote({
            candidates: candidates,
            accountName: _account_name,
            secretKey: $.trim($('.private').val()),
            mode: 'append',//append追加 replace替换
            broadcast: true
          })
          .then(function (res) {
            if (0 == res.code) {
              if (res.data.failure_count == 0) {
                vue.success(true, tip.tip8);//投票成功'投票成功！ '
              } else {
                if ($('li.dropdown-menu__li.active').attr('data-language') == 'english') {
                  vue.success(true, res.data.success_count + ' ' + tip.tip_tick + ' ' + tip.tip_suc+'，'+res.data.failure_count + ' '+tip.tip_fail + '!');//投票成功'投票成功！ '
                } else {
                  vue.success(true, tip.tip_suc+res.data.success_count+tip.tip_tick+'，'+tip.tip_fail+res.data.failure_count+tip.tip_tick +'！');//投票成功'投票成功！ '
                } 
              }
              _vote_flag = false;
            } else {
              vue.warning(true, tip.tip11);//投票失败
              _vote_flag = false;
            }
            $(_this).children('.loading').hide();
          })
          .catch(function (error) {
            _vote_flag = false;
            vue.warning(true, tip.tip11);//投票失败
            $(_this).children('.loading').hide();
          })
        })
      }
    })
    
  })
}