/*投票EOSPocafic-webapp */
$(function () {
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
      success: function(nodesc) {
        this.$Notice.success({
          // title: 'Notification title',
          desc: nodesc ? '' : '取消质押成功!  '
        });
      },
      warning: function(nodesc, desc) {
        this.$Notice.warning({
          // title: 'Notification title',橙色框
          desc: nodesc ? desc : '可质押资金不足，需等待回款 '
        });
      },
      error: function(nodesc) {
        this.$Notice.error({
          // title: 'Notification title',
          desc: nodesc ? '' : 'Here is the notification description. Here is the notification description. '
        });
      }
    }
  })

  requirejs.config({
    paths: {
      'jquery': '/js/jquery',
      'eosjs': '/js/eos/eos',
      'eos-vote-sdk': '/js/eos/eos-vote-sdk',
      'rangeslider': '/js/rangeslider.min'
    },
    shim: {
      'rangeslider': {
          deps: ['jquery'],
  　　 }
    }
  })
  var sdk;
  requirejs(['eos-vote-sdk', 'rangeslider'], function(EosVoteSdk) {
    // perform anything u want
    sdk = new EosVoteSdk({
      eosjs: {
        httpEndpoint: 'http://46.101.95.5:8888',
        chainId: 'a628a5a6123d6ed60242560f23354c557f4a02826e223bb38aad79ddeb9afbca',
      },
      server: {
        schema: 'http',
        host: '192.168.0.21',
        port: 62281,
      }
    })

    var $document = $(document);
    var current_language = '';
    var voted_arr = [];

    // Initialize the elements
    $('[data-rangeslider]').rangeslider({
      polyfill: false
    });

    $document.on('input', '[data-rangeslider]', function(e) {
      $('.range-content__intro--num').html(e.target.value);
    });
    
    
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
    })

    //中英文切换
    var tip = {};
    var languageMobile = {};
    $.ajax({
      url: '/js/json/language-mobile.json',
      type: 'GET',
      success: function (res) {
        languageMobile = res;
        // languageChange(languageMobile.english);
        tip = languageMobile.english.tip;
        if (window.location.hash != '' || window.location.hash != undefined) {
          $('.pacific_tab').attr('href', '/vote' + window.location.hash);
          $('.home_tab').attr('href', '/' + window.location.hash);
          if ('#zh_chs' == window.location.hash) {
            languageChange(languageMobile.zhChs);
            tip = languageMobile.zhChs.tip;
          } else if ('#english' == window.location.hash) {
            languageChange(languageMobile.english);
            tip = languageMobile.english.tip;
          } else if ('#zh_cht' == window.location.hash) {
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
        }
      }
    })

    var accountIntro = '';
    
    //语言切换事件
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
        languageChange(languageMobile.zhChs);
        tip = languageMobile.zhChs.tip;
      } else if ('english' == _tip) {
        languageChange(languageMobile.english);
        tip = languageMobile.english.tip;
      } else if ('zh_cht' == _tip) {
        languageChange(languageMobile.zhCht);
        tip = languageMobile.zhCht.tip;
      }
    })

    var languageChange = function (language) {
      $('.import-account__title').html(language.importAccount.title);
      $('.import-account__key').html(language.importAccount.keyDesc);
      $('.inqure-name').html(language.importAccount.inquireName);
      $('.import-account__inqure--btn').html(language.importAccount.inquireAccount);
      $('.import-account__change').html(language.importAccount.inquireDesc);
      var _html = '';
      language.jump.desc.forEach(function (e) {
        _html += '<p class="confirm-content__desc--single">'+e+'</p>';
      })
      $('.confirm-content__desc').html(_html);
      $('.konw-eos').html(language.jump.know);
      $('.konw-code').html(language.code);
      $('.input-box__detail').attr('placeholder', language.importAccount.keyPlaceholder);
      $('.change-account').attr('placeholder', language.importAccount.accountNamePlaceholder);
      $('.import-account__import--btn').html(language.importAccount.importBtn);
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
      $('.poll-content__btn').html(language.poll.pollBtn);
      $('.pledge-btn').html(language.pledge.title);
    }

    var accountNameNum = 0;
    //查询账户名
    $('.import-account__inqure--btn').on('click', function () {
      if ('' == $('.input-box__detail').val()) {
        // tipConfirm('/images/app_mobile/import-tip-icon.png', tip.tip1);//'请输入私钥！'
        vue.warning(true, '请输入私钥！');
        return false;
      }
      //私钥是否合法
      sdk.isValidSecretKey({
        secretKey: $('.input-box__detail').val()
      })
      .then(function (resp) {
        if (true == resp.data.is_valid_secret_key) { //私钥存在
          sdk.secretToPublic({ //私钥转化成公钥
            secretKey: $('.input-box__detail').val()
          })
          .then(function (data) {
            //得到公钥 data.data.public_key
            sdk.fetchDefaultAccount({ //查询账户名
              eosPublicKey: data.data.public_key
            })
            .then(function (res) {
              accountNameNum = res.data.length;
              if (res.data.length > 1) {
                var _option_html = '';
                var _option_first = '';
                res.data.forEach(function (e, index) {
                  if (0 == index) {
                    _option_first += 
                      '<a class="dropdown-toggle" data-toggle="dropdown" value="'+e.account_name+'">' +
                        '<span class="current-language">'+e.account_name+'</span>' +
                        '<span class="caret"></span>' +
                      '</a>'; 
                  }
                  _option_html += 
                    '<li class="dropdown-menu__li" value="'+e.account_name+'">' +
                      '<a href="#">'+e.account_name+'</a>' +
                    '</li>';
                })
                $('.import-account__name--desc').html('<div class="dropdown">' + _option_first +'<ul class="dropdown-menu">'+_option_html+'</ul></div>');
                
                $('.remove-example').html(_option_html);
                //账户名切换事件
                $('.import-account__name--desc .dropdown-menu .dropdown-menu__li').on('click', function () {
                  $(this).addClass('active').siblings().removeClass('active');
                  $('.dropdown-toggle .current-language').html($(this).children('a').html());
                })

              } else if (res.data.length == 1){
                $('.import-account__name--desc').html(res.data[0].account_name).addClass('account-color');
              } else {
                $('.import-account__name--desc').html('loin').addClass('account-color');//todo
              }
              $('.import-account__import--btn').addClass('import-start').removeAttr('disabled');
            })
            .catch(function () { //转化公钥失败
              vue.warning(true, tip.tip2);//'查询失败，请重试！'
            })
          })
          .catch(function () { //转化公钥失败
            vue.warning(true, tip.tip2);//'查询失败，请重试！'
          })
        } else { //私钥不存在
          vue.warning(true, tip.tip2);//'查询失败，请重试！'
        }
      })
      .catch(function (error) {
        vue.warning(true, tip.tip2);//'查询失败，请重试！'
      })
    })

    var getAccountIntro = function (_account_name) {
      sdk.fetchAccountInfo({ //查询账户余额
        accountName: _account_name
      })
      .then(function (res) {
        res.data.secretKey = $('.private').val();
        accountIntro = res;
        $('.pledge-btn').removeAttr('disabled').addClass('pledge_start');
        
        var total = (parseFloat(res.data.unstaking)+parseFloat(res.data.balance)+parseFloat(res.data.staked_of_cpu)+parseFloat(res.data.staked_of_net)).formatMoney(4,'.',',');

        $('.balance-num').html(total);//账户余额
        $('.pledge-num').html(parseInt(parseFloat(res.data.staked_of_cpu)+parseFloat(res.data.staked_of_net)));//已质押
        $('.repayment-num').html(parseInt(res.data.unstaking));//回款中

        $('.range-content__intro--num').html(parseInt(parseFloat(res.data.staked_of_cpu)+parseFloat(res.data.staked_of_net)));
        $('.range-content__bar').val(parseInt(parseFloat(res.data.staked_of_cpu)+parseFloat(res.data.staked_of_net))).change();
        if (parseInt(parseFloat(res.data.staked_of_cpu)+parseFloat(res.data.staked_of_net)) > 0) {
          $('.poll-content__btn').addClass('vote_start').removeAttr('disabled');
        }
        $('input[type="range"]').attr({
          max: parseInt(parseFloat(res.data.unstaking)+parseFloat(res.data.balance)+parseFloat(res.data.staked_of_cpu)+parseFloat(res.data.staked_of_net))-parseInt(res.data.unstaking),
          step: 1
        }).rangeslider('update', true);
      })
      .catch(function (error) {
        vue.warning(true, tip.tip2);//'失败，请重试！'
      })
    }
    //导入账户
    $('.import-account__import--btn').on('click', function () {
      var _account_name = '';
      if ('' == $('.change-account').val()) {//没有输入修改后的账户名
        if (accountNameNum > 1) {
          _account_name = $('.import-account__name--desc .current-language').html();
        } else {
          _account_name = $('.import-account__name--desc').html();
        }
      } else {
        _account_name = $('.change-account').val();
      }
      
      sdk.checkAccountExist({
        accountName: _account_name
      })
      .then(function (resp) {
        if (true == resp.data.account_existed) {//账户存在
          $('.pledge-load').show();
          $('.poll-content__btn').show();
          $('.self_account').show();
          $('.empty-vote').hide();
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
              n: n,
              p: p
            })
            .then(function (resp) {
              $('.pledge-load').hide();
              if (1 != resp.data.has_next) {
                has_next = 0;
              }
              if (resp.data.candidates.length > 0) {
                var _html = '';
                resp.data.candidates.forEach(function (e, index) {
                  if (true == e.is_voted) {
                    voted_arr.push(e.accountName);//获取已经被投过票的选举人
                  }
                  var _left_change = '';
                  if (index%4 == 0) {
                    _left_change = 'left_change';
                  } else {
                    _left_change = '';
                  }
                  _html += 
                  '<div class="pledge-change__single '+_left_change+'">' +
                    '<span class="pledge-change__single--inteo">'+e.displayName+'</span>' +
                    '<input class="pledge-change__single--checked" type="checkbox" name="pledge" accountName="'+e.accountName+'" is_voted="'+e.isVoted+'"/>' +
                  '</div>';
                })
                
                $('.list_box').append(_html);
                
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
            if (($(this)[0].scrollTop + $(this).height() + 60) >= $(this)[0].scrollHeight) {
              clearTimeout(timers);
              //这里还可以用 [ 延时执行 ] 来控制是否加载 （这样就解决了 当上页的条件满足时，一下子加载多次的问题啦）
              timers = setTimeout(function() {
                if (has_next == 1) {
                  page++;
                  LoadingDataFn(page,40); //调用执行上面的加载方法
                }
              }, 300);
            }
          });

          //还可以基window窗口（body）来添加滚动事件, (因为布局不同,所以在这里没效果，因为[上面是基于body中的某个元素来添加滚动事的])
          // $(window).scroll(function() {
          //   //当时滚动条离底部60px时开始加载下一页的内容
          //   if (($(window).height() + $(window).scrollTop() + 60) >= $(document).height()) {
          //     clearTimeout(timers);
          //     timers = setTimeout(function() {
          //       if (has_next == 1) {
          //         page++;
          //         LoadingDataFn(page,40); //调用执行上面的加载方法
          //       }
          //     }, 300);
          //   }
          // });
          getAccountIntro(_account_name);
          
        }
      })
    })
    
    //质押
    $('.pledge-btn').off().on('click', function (e) {
      if (parseFloat($('.pledge-content__account--asset--single--num--unit').html())) {

      }

      sdk.stake({
        accountName: accountIntro.data.account_name,
        stakeCount: $('.range-content__intro--num').html(),
        secretKey: $('.input-box__detail').val(),
        broadcast: true//todo上线时要修改为true
      })
      .then(function (res) {
        getAccountIntro(accountIntro.data.account_name);
      })
      .catch(function (error) {
        vue.warning(true, tip.tip7);//'失败，请重试！'
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
    })

    //投票
    $('.poll-content__btn').off().on('click', function () {
      var is_voted_arr = [];
      var candidates = [];//所有被投票的选举人
      var vote_num = 0;//之前被投过票
      $(".pledge-change__single").each(function () {
        if ($(this).children("input[type='checkbox']").is(':checked')) {
          if ($.inArray($(this).children("input[type='checkbox']").attr('accountName'), voted_arr) == -1) { //如果不存在则插到所有投票选举人数组中
            candidates.push($(this).children("input[type='checkbox']").attr('accountName'));
          } else {
            vote_num += 1;
          }
        }
      })
      console.log(candidates);
      console.log($('.input-box__detail').val())
      sdk.vote({
        candidates: candidates,
        secretKey: $('.input-box__detail').val(),
        broadcast: false
      })
      .then(function (res) {
        console.log(res)
        if (vote_num == 0) {
          vue.warning(true, tip.tip8);//投票成功'投票成功！ '
        } else {
          if (window.location.pathname == '#english') {
            vue.warning(true, (30-parseFloat(vote_num)) + tip.tip_tick + tip.tip_suc+'，'+vote_num+tip_fail);//投票成功'投票成功！ '
          } else {
            vue.warning(true, tip.tip_suc+(30-parseFloat(vote_num))+tip.tip_tick+'，'+tip_fail+vote_num+tip.tip_tick );//投票成功'投票成功！ '
          } 
        }
      })
      .catch(function (error) {
        vue.warning(true, tip.tip11);//投票失败
      })
    })
  })
})