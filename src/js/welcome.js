/*
  title: eos官网
  author: xueke
  time: 5/10
*/
var language_all = {};
var tip_intro = {};
var select_change = {};//手机浏览器中的语言选择提示
$('.input-box__detail').on('focus', function () {
  $(this).parent($('.input-box')).addClass('input_focus');
})
$('.input-box__detail').on('blur', function () {
  $(this).parent($('.input-box')).removeClass('input_focus');
})
$('.body').hide();

$.ajax({
  url: '/js/json/pacific-language.json',
  type: 'get',
  success: function (res) {
    
    language_all = res;
    tip_intro = language_all.english.confirm;
    select_change = language_all.english.select_change;
    if (window.location.hash != '' && window.location.hash != undefined) {
      current_language(window.location.hash.split('#')[1]);
      $('.body').show();
      $('.dropdown-menu__li').each(function (e) {
        if ('#' + $(this).attr('data-language') == window.location.hash) {
          $('.current-language').html($(this).children('a').html());
          $('.dropdown-toggle .current-language').html($(this).children('a').html());
          $(this).addClass('active');
          $('.pacific_tab').attr('href', '/vote' + window.location.hash);
          $('.home_tab').attr('href', '/' + window.location.hash);
        }
      })
    } else {
      $('.body').show();
    }
  }
})

//当前展示的语言需要修改文案的地方
var current_language = function (tip) {
  language_all[tip].title.forEach(function (e, index) {
    $('.navbar-nav li:eq('+(index+1)+') a').html(e);//tab标题
  })
  //home文案修改点
  $('.eos-header__content--title').html(language_all[tip].home.first_title);
  $('.eos-header__content--tip').html(language_all[tip].home.second_title);
  $('.eos-header__content--include').html(language_all[tip].home.three_title);
  $('.eos-header__content--desc').html(language_all[tip].home.desc);
  $('.input-box__error').html(language_all[tip].confirm.eamil_error);
  $('.eos-header__content--email--btn').html(language_all[tip].home.email_btn);
  $('.input-box__detail').attr('placeholder', language_all[tip].home.email_placeholder);
  //eos.pacific 文案修改点
  $('.pacific-content__title').html(language_all[tip].pacific.title);
  $('.pacific-content__desc').html(language_all[tip].pacific.desc);
  //Asian Access文案修改点
  $('.asian-access__content__title').html(language_all[tip].asian_access.title);
  $('.asian-access__content__desc').html(language_all[tip].asian_access.desc);
  //community文案修改点
  $('.community-content__title').html(language_all[tip].community.title);
  $('.community-content__desc').html(language_all[tip].community.desc);
  //solution文案修改点
  $('.solution-content__title').html(language_all[tip].solution.title);
  $('.education-title').html(language_all[tip].solution.education_talent.title);
  $('.education-desc').html(language_all[tip].solution.education_talent.desc);
  $('.technology-title').html(language_all[tip].solution.technology.title);
  $('.technology-desc').html(language_all[tip].solution.technology.desc);
  $('.incubation-title').html(language_all[tip].solution.incubation.title);
  $('.incubation-desc').html(language_all[tip].solution.incubation.desc);
  //联系我们 文案修改点
  $('.contact-content__title').html(language_all[tip].contact_us.title);
  $('.input_name').attr('placeholder', language_all[tip].contact_us.name_placeholder);
  $('.input_email').attr('placeholder', language_all[tip].contact_us.email_placeholder);
  $('.input_message').attr('placeholder', language_all[tip].contact_us.message_placeholder);
  $('.contact-content__detail--btn').html(language_all[tip].contact_us.contact_btn);
  //提示框
  tip_intro = language_all[tip].confirm;
  select_change = language_all[tip].select_change;
  $('.confirm-content__title').html(tip_intro.title);
  $('.confirm-content__btn').html(tip_intro.btn);
  $('.footer-content__copyright').html(language_all[tip].copyright);
  $('.copyright-intro').html(language_all[tip].copyright);
}

$('.dropdown').on('click', function () {
  if ($(this).children().children('.caret').hasClass('change-select')) {
    $(this).children().children('.caret').removeClass('change-select');
  } else {
    $(this).children().children('.caret').addClass('change-select');
  }
})
// 获取 hash 参数：
// location.href = ...?market=1
// _search_get('market'); //output:1
function _search_get(name){
  var params = {};
  location.search.replace(/^\?/,'').split('&').forEach(function(x){
    params[ x.replace(/\=.*/,'') ] = decodeURIComponent( x.replace(/.*\=/,'') );
  });

  _search_get = function(name){
    return params[name];
  };

  return _search_get(name);
}

//语言切换事件
$('.dropdown-menu__li').on('click', function () {
  $('.current-language').html($(this).children('a').html());
  $('.dropdown-toggle .current-language').html($(this).children('a').html());
  var tip = $(this).attr('data-language');
  current_language(tip);
  $(this).addClass('active').siblings().removeClass('active');
  $('.pacific_tab').attr('href', '/vote#' + tip);
  $('.home_tab').attr('href', '/#' + tip);
})

//邮箱格式判断
var is_email = function(s) {
  var r = /^[\w\-\.]+@[\w\-\.]+(\.\w+)+$/i;
  if(!s) {
    return false;
  } else if(!r.test(s)) {
    return false;
  }
  return true;
}

//订阅
$('.eos-header__content--email--btn').off().on('click', function () {
  var _email =  '' + $('.eos-header__content--email .input-box__detail').val();
  var _this = this;
  if (!is_email(_email)) {
    $(this).prev($('.input-box')).children($('.input-box__error')).show();
    $(this).prev($('.input-box')).addClass('input_error');
    return false;
  }
  
  $.ajax({
    url: '/email/post',
    type: 'POST',
    data: {
      id: 2,
      email: _email
    },
    success: function (res) {
      if (0 == res.code) {
        //成功
        $(_this).prev($('.input-box')).children('.input-box__error').hide();
        $(_this).prev().removeClass('input_error');
        $('.input-box .input-box__detail').val('');
        $('.confirm').show();
        $('.confirm-content__detail--desc').html(tip_intro.subscription_desc);
        $('.confirm .confirm-content .confirm-content__detail .confirm-content__detail--icon').show();
        return false;
      }
      $(_this).prev($('.input-box')).children('.input-box__error').show();
      $(_this).prev($('.input-box')).addClass('input_error');
    }
  })
})

//联系我们
$('.contact-content__detail--btn').off().on('click', function () {
  var _name = $('.input_name').val();
  var _email = $('.input_eamil').val();
  var _message = $('.input_message').val();
  var _this = this;
  if ('' == _name || '' == _email || '' == _message) {
    $('.confirm').show();
    $('.confirm .confirm-content .confirm-content__detail .confirm-content__detail--icon').hide();
    $('.confirm-content__detail--desc').html(tip_intro.information_miss);
    return false;
  }
  if (!is_email(_email)) {
    $(this).prev().prev($('.input-box')).children('.input-box__error').show();
    $(this).prev().prev($('.input-box')).addClass('input_error');
    return false;
  }
  $.post('/contactus', {id: 2, name: _name, email: _email, message: _message}, function (res) {
    if (0 == res.code) {
      //成功
      $('.confirm').show();
      $('.confirm .confirm-content .confirm-content__detail .confirm-content__detail--icon').show();
      $('.confirm-content__detail--desc').html(tip_intro.opinion_desc);
      $('.contact-content__detail .input-box__detail').val('');
      $(_this).prev().prev($('.input-box')).children('.input-box__error').hide();
      $(_this).prev().prev($('.input-box')).removeClass('input_error');
      return false;
    }
    $('.confirm').show();
    $('.confirm .confirm-content .confirm-content__detail .confirm-content__detail--icon').show().attr('src', '/images/confirm-fail.png');
    $('.confirm-content__detail--desc').html(tip_intro.message_fail);
  })
})

//点击关闭
$('.confirm-content__btn').on('click', function () {
  $('.confirm').hide();
})
$('.confirm-content__close').on('click', function () {
  $('.confirm').hide();
})

