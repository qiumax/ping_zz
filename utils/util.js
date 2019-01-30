const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}



function randomString()
{
  var chars='ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
  var len = 32
  var result=''
  var i
  for(i=0;i<32;i++)
  {
    result += chars.charAt(Math.random()*35)
  }
  return result
}

function randomStringnum() {
  var len = 6
  var result = ''
  var i
  for (i = 0; i < 6; i++) {
    result += Math.floor(Math.random() * 10);
  }
  return result
}

function calRemaintime(timeexpire)
{
  //计算拼团剩余时间
  var expire = parseInt(timeexpire - Date.parse(new Date()) / 1000);
  var day = 0
  var hour = 0
  var minute = 0
  var second = 0
  //
  day = parseInt(expire / 86400)
  hour = parseInt(expire % 86400 / 3600)
  minute = parseInt(expire % 86400 % 3600 / 60)
  second = parseInt(expire % 86400 % 3600 % 60)
  var expired
  expired = day > 0 ? (day.toString() + "天") : ''

  expired = expired + (hour > 0 ? (hour.toString() + "小时") : '')

  expired = expired + (minute > 0 ? (minute.toString() + "分") : '')
  expired = expired + (second > 0 ? (second.toString() + "秒") : '')
  if (day == 0 && hour == 0 && minute == 0 && second == 0) {
    expired = 0
  }
  return expired
}

function utcformat(utctime) {

  function formatFunc(str) {    //格式化显示
    return str > 9 ? str : '0' + str
  }
  
  var date2 = new Date(utctime);     //这步是关键
  var year = date2.getFullYear();
  var mon = formatFunc(date2.getMonth() + 1);
  var day = formatFunc(date2.getDate());
  var hour = date2.getHours();
  hour = hour > 9 ? hour : '0' + hour;
  var min = formatFunc(date2.getMinutes());
  var dateStr = year + '-' + mon + '-' + day +  ' ' + hour + ':' + min;
  return dateStr;
}


function formatDateTime(timeStamp) {
  var date = new Date();
  date.setTime(timeStamp * 1000);
  var y = date.getFullYear();
  var m = date.getMonth() + 1;
  m = m < 10 ? ('0' + m) : m;
  var d = date.getDate();
  d = d < 10 ? ('0' + d) : d;
  var h = date.getHours();
  h = h < 10 ? ('0' + h) : h;
  var minute = date.getMinutes();
  var second = date.getSeconds();
  minute = minute < 10 ? ('0' + minute) : minute;
  second = second < 10 ? ('0' + second) : second;
  return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
}

function compareVersion(v1, v2) {
  v1 = v1.split('.')
  v2 = v2.split('.')
  const len = Math.max(v1.length, v2.length)

  while (v1.length < len) {
    v1.push('0')
  }
  while (v2.length < len) {
    v2.push('0')
  }

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i])
    const num2 = parseInt(v2[i])

    if (num1 > num2) {
      return 1
    } else if (num1 < num2) {
      return -1
    }
  }

  return 0
}

//短信
function sendsms(phone){
  console.log('ok')
}


module.exports = {
  formatTime: formatTime,
  randomString:randomString,
  calRemaintime: calRemaintime,
  utcformat: utcformat,
  sendsms: sendsms,
  randomStringnum: randomStringnum,
  formatDateTime: formatDateTime,
  compareVersion: compareVersion
}
