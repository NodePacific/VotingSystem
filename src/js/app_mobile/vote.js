/*投票EOSPocafic-webapp */
$(function () {
  requirejs.config({
    paths: {
      'jquery': 'https://dn-gmfproductintro.qbox.me/js/blockc-intro/jquery',
      'eosjs': 'https://dn-gmfproductintro.qbox.me/js/blockc-intro/eos',
      'eos-vote-sdk': '/js/eos/eos-vote-sdk',
      'selectpicker': '/js/bootstrap-select.min',
      'rangeslider': '/js/rangeslider.min',
      'bootstrap': '/js/bootstrap.min',
      'dropdown': '/js/bootstrap-dropdown.min'
    }
  })
  
  requirejs(['eos-vote-sdk', 'bootstrap', 'selectpicker', 'rangeslider', 'dropdown'], function(EosVoteSdk, bootstrap, selectpicker, rangeslider, dropdown) {
    // perform anything u want
    $.ajax({
      url: 'https://vot.nodepacific.com/v1/chain/get_info',
      type: 'GET',
      success: function (chainData) {
        var sdk = new EosVoteSdk({
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
        
        setTimeout(function () {
          $('.confirm .confirm-content').css('margin-top', ($(window).height()-$('.confirm .confirm-content').height())/2+'px');
        })
        var $document   = $(document);
        var accountIntro = {};//账户信息
        $document.on('input', '[data-rangeslider]', function(e) {
          $('.range-content__intro--num').html(e.target.value);
        });
    
        if (parseFloat(window.localStorage.getItem('confirm-instructions')) == 0) {
          $('.confirm').hide();
        } else {
          $('.confirm').show();
        }

        //页面加载弹窗消失
        $('.loading-confirm').hide();
        
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
        $('.confirm-content__jump').on('click', function () {
          $('.confirm').hide();
          window.localStorage.setItem('confirm-instructions', 0);
        })
    
        if ($.trim($('.vote-account__key').val()) == '' || $.trim($('.change-account').val()) == '') {
          $('.import-account').attr('disabled', 'disabled').removeClass('import-bgd');
        } else {
          $('.import-account').removeAttr('disabled').addClass('import-bgd');
        }
        
        //质押帐户总额、已质押、回款中名词解释
        $('.pledge-account__li').on('click', '.question-icon', function () {
          $(this).children('.pledge-confirm').show();
          $(this).parent().parent().siblings().children('.pledge-account__li--balance').children('.question-icon').children('.pledge-confirm').hide();
        })
        
        // Initialize the elements
        $('[data-rangeslider]').rangeslider({
          polyfill: false
        });
    
        //中英文切换
        var languageMobile = {};
        var tip = {};
        $.ajax({
          url: '/js/json/language-mobile.json',
          type: 'GET',
          success: function (res) {
            languageMobile = res;
            languageChange(languageMobile.zhChs);
            tip = languageMobile.zhChs.tip;
          }
        })
    
        $('.language').on('click', function () {
          $(this).addClass('current_language').siblings().removeClass('current_language');
          if ('cn' == $(this).attr('value')) {
            languageChange(languageMobile.zhChs);
            tip = languageMobile.zhChs.tip;
            $('.language[value=cn]').map(function () {
              return $(this).addClass('current_language').siblings().removeClass('current_language');
            })
          } else if ('en' == $(this).attr('value')) {
            languageChange(languageMobile.english);
            tip = languageMobile.english.tip;
            $('.language[value=en]').map(function () {
              return $(this).addClass('current_language').siblings().removeClass('current_language');
            })
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
        
        var pledge_num_vote = 0;
        //查询账户余额
        var getAccountIntro = function (_account_name, _this) {
          sdk.fetchAccountInfo({ 
            accountName: _account_name
          })
          .then(function (res) {
            if (0 == res.code) {
              $('.vote-page').show();
              $('.import-page').hide();
              $('.private-active').hide();
              $('.vote-mapping').hide();
              res.data.secretKey = $.trim($('.vote-account__key').val());
              accountIntro = res;
              $('.pledge-btn').removeAttr('disabled').addClass('pledge_start');
              
              var total = (parseFloat(res.data.unstaking_of_cpu)+parseFloat(res.data.unstaking_of_net)+parseFloat(res.data.balance)+parseFloat(res.data.staked_of_cpu)+parseFloat(res.data.staked_of_net)).formatMoney(4,'.',',');
    
              $('.balance-num').html(total);//账户余额
              $('.pledge-num').html(parseInt(parseFloat(res.data.staked_of_cpu)+parseFloat(res.data.staked_of_net)).formatMoney(0,'.',','));//已质押
              $('.repayment-num').html(parseInt(parseFloat(res.data.unstaking_of_cpu)+parseFloat(res.data.unstaking_of_net)).formatMoney(0,'.',','));//回款中
              getSizeFun('.balance-num', '.pledge-account .pledge-account__li:first-child');
              getSizeFun('pledge-num', '.pledge-account .pledge-account__li:last-child');
              getSizeFun('repayment-num', '.pledge-account .pledge-account__li:last-child');
              
              if (parseInt(parseFloat(res.data.staked_of_cpu)+parseFloat(res.data.staked_of_net)) > 0) {
                $('.poll-content__btn').addClass('vote_start').removeAttr('disabled');
                pledge_num_vote = parseInt(parseFloat(res.data.staked_of_cpu)+parseFloat(res.data.staked_of_net));
              }
              $('input[type="range"]').attr({
                max: parseInt(parseFloat(res.data.unstaking_of_cpu)+parseFloat(res.data.unstaking_of_net)+parseFloat(res.data.balance)+parseFloat(res.data.staked_of_cpu)+parseFloat(res.data.staked_of_net)),
                step: 1
              }).rangeslider('update', true);
    
              $('.range-content__intro--num').html(parseInt(parseFloat(res.data.staked_of_cpu)+parseFloat(res.data.staked_of_net)));
              $('.range-content__bar').val(parseInt(parseFloat(res.data.staked_of_cpu)+parseFloat(res.data.staked_of_net))).change();
              _import_account_flag = false;
              _pledge_flag = false;
              $(_this).children('.loading').hide();
            } else {
              tipConfirm('/images/app_mobile/import-tip-icon.png', tip.tip2);
              _import_account_flag = false;
              _pledge_flag = false;
              $(_this).children('.loading').hide();
            }
          })
          .catch(function (error) {
            tipConfirm('/images/app_mobile/import-tip-icon.png', tip.tip2);
            $(_this).children('.loading').hide();
            _import_account_flag = false;
            _pledge_flag = false;
          })
        }
    
        var languageChange = function (language) {
          $('.account-eos').html(language.importAccount.keyDesc);
          $('.mapping-desc').html(language.importAccount.clickInquireDesc);
          $('.vote-mapping__content--title').html(language.mapping.title);
          $('.inqure-name').html(language.mapping.inquireBtn);
          $('.vote-account__confirm').val(language.mapping.confirmBtn);
          $('.account-eos-desc').html(language.importAccount.inquireDesc);
          $('.vote-account__change--private').html(language.importAccount.active_key);
          $('.worry-public-key').html(language.importAccount.private_worry);
          $('.inqure-account').html(language.mapping.start_account);
          $('.vote-github-code').html(language.code);
          var _html = '';
          language.jump.desc.forEach(function (e) {
            _html += '<p class="confirm-content__intro--desc--single">'+e+'</p>';
          })
          $('.confirm-content__intro--desc').html(_html);
          $('.konw-eos').html(language.jump.know);
          $('.konw-code').html(language.code);
          $('.vote-account__key').attr('placeholder', language.importAccount.keyPlaceholder);
          $('.change-account').attr('placeholder', language.importAccount.accountNamePlaceholder);
          $('.import-btn').html(language.importAccount.importBtn);
    
          $('.pledge-title--desc').html(language.pledge.title);
          $('.balance-title').html(language.pledge.total);
          $('.pledge-already-title').html(language.pledge.pledgeAlready);
          $('.repayment-title').html(language.pledge.repayment);
          $('.balance-name').html(language.pledge.totalTitle);
          $('.balance-content .pledge-confirm__desc').html(language.pledge.totalDesc);
          $('.pledge-content .pledge-confirm__desc').html(language.pledge.pledgeAlreadyDesc);
          $('.pledge-name').html(language.pledge.pledgeAlreadyTitle);
          $('.repayment-content .pledge-confirm__desc').html(language.pledge.repaymentDesc);
          $('#repayment-name').html(language.pledge.repaymentTitle);
          $('.range-desc').html(language.pledge.barDesc);
          $('.pledge-btn-desc').html(language.pledge.pledgeBtn);
          $('.vote-github-code').html(language.code);
          $('.vote-title').html(language.poll.title);
          $('.vote-btn-desc').html(language.poll.pollBtn);
          $('.pledge-confirm__close').html(language.pledge.konw_btn);
          $('.disclaimer').html(language.disclaimer);
          $('.contact-desc').html(language.email_desc);
          $('.recommend-account').html(language.recommend);
          $('.confirm-content__icon').attr('src', language.jump.jump_icon);
          $('.vote-append-desc').html(language.poll.pollDesc);
          $('.vote-mapping__content--public').attr('placeholder', language.mapping.public_placeholder);
    
          $('.private-active__title').html(language.private_active.title);
          $('.private-active__desc').html(language.private_active.desc);
          $('.private-active__know').html(language.private_active.know);
    
          $('.disclaimer-confirm__content--title').html(language.disclaimerConfirm.title);
          $('.disclaimer-confirm__content--intro').html(language.disclaimerConfirm.intro);
          $('.disclaimer-confirm__content--know').html(language.jump.jump_btn);
    
    
          $('.vote-account .vote-account__name .vote-account__name--intro').width($('.vote-account .vote-account__name').width()-$('.inqure-account').width()-5+'px');
          $('.dropdown, .dropup').width($('.vote-account__name').width()-$('.vote-account__name .inqure-account').width()-5 + 'px');
          $('.dropdown-menu').width($('.vote-account__name').width()-$('.vote-account__name .inqure-account').width()-5 + 'px');
          $('.mapping-account-name').width($('.dropdown .dropdown-toggle').width()-$('.dropdown-toggle .caret').width()-12-12 + 'px');
          $('.vote-mapping').css('top', $('.mapping-desc').offset().top+30 + 'px');
        }
    
        //img小图标，tip_desc提示文案
        var tipConfirm = function (img, tip_desc) {
          $('.tip-dl__dt--img').attr('src', img);
          $('.tip-dl__dd').html(tip_desc);
          $('.confirm-tip').show();
          setTimeout(function () {
            $('.confirm-tip .confirm-tip__content').css({'margin-top': ($(window).height()-$('.confirm-tip .confirm-tip__content').height())/2+'px', 'height': $('.tip-dl .tip-dl__dd').height()+38+'px'});
          })
          setTimeout(function () {
            $('.confirm-tip').hide();
          }, 3000)
          return false;
        }
    
        //查询初始映射账户名
        $('.mapping-desc').on('click', function () {
          $('.vote-mapping').css('top', $(this).offset().top + 30 + 'px').show();
          $('.dropdown, .dropup').width($('.vote-account__name').width()-$('.vote-account__name .inqure-account').width()-5 + 'px');
        })
        $('.vote-mapping__content--close').on('click', function () {
          $('.vote-mapping').hide();
        })
        $('.vote-account__confirm').on('click', function () {
          $('.vote-mapping').hide();
          if (0 != $('.mapping-account-name').attr('data-account')) {
            $('.change-account').val($.trim($('.mapping-account-name').html()));
          } else{
            $('.change-account').val('');
          }
          
          if ($.trim($('.vote-account__key').val()) == '' || $.trim($('.change-account').val()) == '') {
            $('.import-account').attr('disabled', 'disabled').removeClass('import-bgd');
          } else {
            $('.import-account').removeAttr('disabled').addClass('import-bgd');
          }
        })
    
        //免责声明
        $('.disclaimer').on('click', function () {
          $('.disclaimer-confirm').show();
          $('.disclaimer-confirm__content--intro').addClass('auto');
          $('html, body').css({'height': '100%', 'overflow': 'hidden'}); 
        })
        $('.disclaimer-confirm__content--know').on('click', function () {
          $('.disclaimer-confirm').hide();
          $('.disclaimer-confirm__content--intro').removeClass('auto');
          $('html, body').css({'height': '100%', 'overflow': 'visible'}); 
        })
    
        var mappingConfirmFun = function (tip) {
          $('.mapping-tip').show().html(tip);
          setTimeout(function () {
            $('.mapping-tip').hide();
          }, 3000)
        }
    
        //account-name
        $('.change-account').on('input', function () {
          if ($.trim($(this).val()) == '' || $.trim($('.vote-account__key').val()) == '') {
            $('.import-account').attr('disabled', 'disabled').removeClass('import-bgd');
          } else {
            $('.import-account').removeAttr('disabled').addClass('import-bgd');
          }
        })
        $('.vote-account__key').on('input', function () {
          if ($.trim($(this).val()) == '' || $.trim($('.change-account').val()) == '') {
            $('.import-account').attr('disabled', 'disabled').removeClass('import-bgd');
          } else {
            $('.import-account').removeAttr('disabled').addClass('import-bgd');
          }
        })
    
        //active key desc
        $('.vote-account__change--private').on('click', function () {
          $('.private-active').css('top', $(this).offset().top + 30 + 'px').show();
        })
        $('.private-active__know').on('click', function () {
          $('.private-active').hide();
        })
        $('.private-active__close').on('click', function () {
          $('.private-active').hide();
        })
    
        //有多少个账户名
        var accountNameNum = 0;
        var voted_arr = [];
        //查询账户名
        $('.vote-account__inquire').on('click', function () {
          if ('' == $.trim($('.vote-mapping__content--public').val())) {
            mappingConfirmFun(tip.tip1);
            return false;
          }
          var _this = this;
          $('.mapping-account-name').html('--').removeClass('account-color');
          $('.import-account').attr('disabled', 'disabled').removeClass('import-bgd');
          $('.vote-account__name .dropdown .dropdown-menu').remove();
          $('.dropdown-toggle .caret').hide();
          //得到公钥 data.data.public_key
          sdk.fetchDefaultAccount({ //查询账户名
            eosPublicKey: $.trim($('.vote-mapping__content--public').val())
          })
          .then(function (res) {
            if (0 == res.code) { //得到初始账户名
              accountNameNum = res.data.length;
              $('.mapping-account-name').attr('data-account', accountNameNum);
              if (res.data.length > 1) {
                var _option_html = '';
                var _option_first = '';
                var _current_active = '';
                var _active = '';
                res.data.forEach(function (e, index) {
                  if (0 == index) {
                    $('.mapping-account-name').html(e.account_name);
                    _active = 'active';
                  } else {
                    _active = '';
                  }
                  _option_html += 
                    '<li class="dropdown-menu__li '+_active+'" value="'+e.account_name+'">' +
                      '<a href="#">'+e.account_name+'</a>' +
                    '</li>';
                })
                $('.vote-account__name .dropdown').append('<ul class="dropdown-menu">'+_option_html+'</ul>');
                $('.vote-account__name .dropdown-toggle .caret').show();
                $('.remove-example').html(_option_html);
                //账户名切换事件
                $('.vote-account__name .dropdown-menu .dropdown-menu__li').on('click', function () {
                  $(this).addClass('active').siblings().removeClass('active');
                  $('.dropdown-toggle .mapping-account-name').html($(this).children('a').html());
                })
                $('.dropdown, .dropup').width($('.vote-account__name').width()-$('.vote-account__name .inqure-account').width()-5 + 'px');
                $('.dropdown-menu').width($('.vote-account__name').width()-$('.vote-account__name .inqure-account').width()-5 + 'px');
                $('.mapping-account-name').width($('.dropdown .dropdown-toggle').width()-$('.dropdown-toggle .caret').width()-12-12 + 'px');
              } else if (res.data.length == 1){
                $('.mapping-account-name').html(res.data[0].account_name).addClass('account-color');
              } else {
                mappingConfirmFun(tip.tip2);
              }
    
            } else {
              mappingConfirmFun(tip.tip2);
              $('.mapping-account-name').attr('data-account', res.data.length);
            }
          })
          .catch(function (error) {
            mappingConfirmFun(tip.tip2);
          })
        })
        
        //导入账户
        var _account_name = '';
        var _import_account_flag = false;
        var next_candidate = false;
        $('.import-account').on('click', function () {
          _account_name = $.trim($('.change-account').val());
          if (true == _import_account_flag) {
            return false;
          }
          _import_account_flag = true;
          var _this = this;
          $(this).children('.loading').show();
          sdk.isValidSecretKey({
            secretKey: $.trim($('.vote-account__key').val())
          })
          .then(function (res) {
            if (0 == res.code && true == res.data.is_valid_secret_key) {
              sdk.checkAccountValid({
                accountName: $.trim(_account_name),
                secretKey: $.trim($('.vote-account__key').val())
              })
              .then(function (resp) {
                if (0 == resp.code) {
                  if (true == resp.data.account_existed && true == resp.data.account_match) {//账户存在
                    sdk.fetchAccountInfo({
                      accountName: _account_name
                    })
                    .then(function (res) {
                      if (0 == res.code) {
                        var has_next = 1;//还有下一页
                        //加载更多
                        var page = 1, //分页码
                          off_on = false, //分页开关(滚动加载方法 1 中用的)
                          timers = null; //定时器(滚动加载方法 2 中用的)
                        var LoadingDataFn = function(p, n) {
                          var dom = '';
                          $('.pledge-load').show();
                          sdk.listCandidate({ //获取选举人列表
                            accountName: _account_name,
                            pageSize: n,
                            pageIndex: p
                          })
                          .then(function (resp) {
                            if (0 == resp.code) {
                              $('.pledge-load').hide();
                              var index_num = -1;
                              if (1 != resp.data.has_next) {
                                has_next = 0;
                              }
                              if (resp.data.candidates.length > 0) {
                                var _html = '';
                                resp.data.candidates.forEach(function (e, index) {
                                  var _left_change = '';
                                  if (0 != index) {
                                    index_num += 1;
                                  }
                                  if (index_num%2 == 0) {
                                    _left_change = 'left_change';
                                  } else {
                                    _left_change = '';
                                  }
                                  if (0 == index && 1 == p) {
                                    $('.recommend-candidate').html(
                                      '<span class="pledge-change__single--inteo" style="width:auto;">'+e.displayName+'（<span class="recommend-account">推荐</span>）</span>' +
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
                        
                        res.data.secretKey = $.trim($('.vote-account__key').val());
                        accountIntro = res;
                        location.href = '#vote-account';
                        _import_account_flag = false;
                      } else {
                        tipConfirm('/images/app_mobile/import-tip-icon.png', tip.tip3);
                        _import_account_flag = false;
                        $(_this).children('.loading').hide();
                      }
                      
                    })
                    .catch(function (error) {
                      tipConfirm('/images/app_mobile/import-tip-icon.png', tip.tip3);
                      _import_account_flag = false;
                      $(_this).children('.loading').hide();
                    })
                  } else {
                    tipConfirm('/images/app_mobile/import-tip-icon.png', tip.tip3);
                    _import_account_flag = false;
                    $(_this).children('.loading').hide();
                  }
                } else {
                  tipConfirm('/images/app_mobile/import-tip-icon.png', tip.tip3);
                  _import_account_flag = false;
                  $(_this).children('.loading').hide();
                }
              })
              .catch(function (error) {
                tipConfirm('/images/app_mobile/import-tip-icon.png', tip.tip3);
                _import_account_flag = false;
                $(_this).children('.loading').hide();
              })
            } else {
              tipConfirm('/images/app_mobile/import-tip-icon.png', tip.tip3);
              _import_account_flag = false;
              $(_this).children('.loading').hide();
            }
          })
          .catch(function (error) {
            tipConfirm('/images/app_mobile/import-tip-icon.png', tip.tip3);
            _import_account_flag = false;
            $(_this).children('.loading').hide();
          })
        })
    
        //质押帐户总额、已质押、回款中名词解释
        $('.pledge-account__li').on('click', '.question-icon', function () {
          $(this).children('.pledge-confirm').show();
          $(this).parent().parent().siblings().children('.pledge-account__li--balance').children('.question-icon').children('.pledge-confirm').hide();
        })
        
        $(document).on('click', '.pledge-confirm__close',function () {
          $(this).parent('.pledge-confirm').hide();
        })
    
        //选择票数
        var _checked_num = 1;
        $(document).on('click', "input[type='checkbox']", function (e) {
          if (_checked_num >= 30 && $(this).is(':checked')) {
            tipConfirm('/images/app_mobile/import-tip-icon.png', tip.tip10);//投票失败'最多可投30票！'
            $(this).attr('checked', '');
            return false;
          }
          if ($(this).is(':checked')) {
            _checked_num += 1;
            
          } else {
            _checked_num -= 1;
          }
    
          if (_checked_num > 0 && pledge_num_vote > 0) {
            $('.vote-btn').removeAttr('disabled').removeClass('not_vote');
          } else {
            $('.vote-btn').attr('disabled', 'disabled').addClass('not_vote');
          }
        })
    
        //质押
        var _pledge_flag = false;
        $('.pledge-btn').on('click', function (e) {
          if (parseFloat($('.range-content__intro--num').html()) == 0) {
            tipConfirm('/images/app_mobile/import-tip-icon.png', tip.tip6);//投票失败
            return false;
          }
    
          if (true == _pledge_flag) {
            return false;
          }
          _pledge_flag = true;
          $(this).children('.loading').show();
          var _this = this;
    
          sdk.fetchAccountInfo({ //查询账户余额
            accountName: _account_name
          })
          .then(function (res) {
            if (0 == res.code) {
              $('.vote-page').show();
              $('.import-page').hide();
              $('.confirm').hide();
              res.data.secretKey = $.trim($('.vote-account__key').val());
              accountIntro = res;
              $('.pledge-btn').removeAttr('disabled').addClass('pledge_start');
              
              var total = (parseFloat(res.data.unstaking_of_cpu)+parseFloat(res.data.unstaking_of_net)+parseFloat(res.data.balance)+parseFloat(res.data.staked_of_cpu)+parseFloat(res.data.staked_of_net)).formatMoney(4,'.',',');
    
              $('.balance-num').html(total);//账户余额
              $('.pledge-num').html(parseInt(parseFloat(res.data.staked_of_cpu)+parseFloat(res.data.staked_of_net)).formatMoney(0,'.',','));//已质押
              $('.repayment-num').html(parseInt(parseFloat(res.data.unstaking_of_cpu)+parseFloat(res.data.unstaking_of_net)).formatMoney(0,'.',','));//回款中
              getSizeFun('.balance-num', '.pledge-account .pledge-account__li:first-child');
              getSizeFun('pledge-num', '.pledge-account .pledge-account__li:last-child');
              getSizeFun('repayment-num', '.pledge-account .pledge-account__li:last-child');
              
              if (parseInt(parseFloat(res.data.staked_of_cpu)+parseFloat(res.data.staked_of_net)) > 0) {
                $('.poll-content__btn').addClass('vote_start').removeAttr('disabled');
                pledge_num_vote = parseInt(parseFloat(res.data.staked_of_cpu)+parseFloat(res.data.staked_of_net));
              }
    
              if (parseFloat($('.pledge-num').html()) == parseFloat($('.range-content__intro--num').html())) {
                tipConfirm('/images/app_mobile/import-tip-icon.png', tip.tip7);
                _pledge_flag = false;
                $(_this).children('.loading').hide();
                return false;
              }
              
              sdk.stake({
                accountName: accountIntro.data.account_name,
                stakeCount: $('.range-content__intro--num').html(),
                secretKey: $.trim($('.vote-account__key').val()),
                broadcast: true
              })
              .then(function (res) {
                if (0 == res.code) {
                  sdk.fetchAccountInfo({
                    accountName: accountIntro.data.account_name
                  })
                  .then(function (resp) {
                    if (0 == resp.code) {
                      getAccountIntro(accountIntro.data.account_name, _this);
                      tipConfirm('/images/app_mobile/success-icon.png', tip.tip4);//质押成功
                    } else {
                      $(_this).children('.loading').hide();
                    }
                  })
                  .catch(function () {
                    tipConfirm('/images/app_mobile/import-tip-icon.png', tip.tip7);//投票失败
                    _pledge_flag = false;
                    $(_this).children('.loading').hide();
                  })
                } else {
                  tipConfirm('/images/app_mobile/import-tip-icon.png', tip.tip7);//投票失败
                  _pledge_flag = false;
                  $(_this).children('.loading').hide();
                }
              })
              .catch(function (error) {
                tipConfirm('/images/app_mobile/import-tip-icon.png', tip.tip7);//投票失败
                $(_this).children('.loading').hide();
                _pledge_flag = false;
              })
            } else {
              tipConfirm('/images/app_mobile/import-tip-icon.png', tip.tip2);
              $(_this).children('.loading').hide();
              _pledge_flag = false;
            }
          })
          .catch(function (error) {
            tipConfirm('/images/app_mobile/import-tip-icon.png', tip.tip2);
            $(_this).children('.loading').hide();
            _pledge_flag = false;
          })
        })
    
        //投票
        var _vote_flag = false;
        $('.vote-btn').off().on('click', function () {
          var is_voted_arr = [];
          var candidates = [];//所有被投票的选举人
          var _this = this;
          $('.pledge-change__single').each(function () {
            if ($(this).children("input[type='checkbox']").is(':checked')) {
              candidates.push($(this).children("input[type='checkbox']").attr('accountName'));
            }
          })
          if (true == _vote_flag) {
            return false;
          }
          $(this).children('.loading').show();
          _vote_flag = true;
          sdk.vote({
            candidates: candidates,
            secretKey: $.trim($('.vote-account__key').val()),
            broadcast: true,
            mode: 'append',//append为追加 replace为替换
            accountName: accountIntro.data.account_name
          })
          .then(function (res) {
            if (0 == res.code) {
              if (res.data.failure_count == 0) {
                tipConfirm('/images/app_mobile/success-icon.png', tip.tip8);//投票成功'投票成功！ '
              } else {
                if ($('.current_language').attr('value') == 'en') {
                  tipConfirm('/images/app_mobile/success-icon.png', res.data.success_count + ' ' + tip.tip_tick + ' ' + tip.tip_suc+'，'+res.data.failure_count + ' '+tip.tip_fail + '!');//投票成功'投票成功！ '
                } else {
                  tipConfirm('/images/app_mobile/import-tip-icon.png', tip.tip_suc+res.data.success_count+tip.tip_tick+'，'+tip.tip_fail+res.data.failure_count+tip.tip_tick +'！');//投票成功'投票成功！ '
                } 
              }
              _vote_flag = false;
            } else {
              tipConfirm('/images/app_mobile/import-tip-icon.png', tip.tip11);//投票失败
              _vote_flag = false;
            }
            $(_this).children('.loading').hide();
          })
          .catch(function (error) {
            tipConfirm('/images/app_mobile/import-tip-icon.png', tip.tip11);//投票失败
            $(_this).children('.loading').hide();
            _vote_flag = false;
          })
        })
      }
    })
  })
})