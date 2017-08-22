var datachan = require('data-chan').lib;
var dc_search_results = require('data-chan').search_enum;
var ref = require('ref');
var arr = require('ref-array');
var f_arr = arr('float');
var struct = require('ref-struct');
var measure_t = struct({
  'type' : ref.types.uint8,
  'mu' : ref.types.uint8,
  'channel' : ref.types.uint8,
  'value' : ref.types.float,
  'time' : ref.types.uint32,
  'millis' : ref.types.uint16
});
const EventEmitter = require('events');
var handler = new EventEmitter();
var usb;
var thread;
var on=false;
var a;
var b;
var scope = {
  'time' : 0,
  'ch1'  : 0,
  'ch2'  : 0,
  'ch3'  : 0,
  'ch4'  : 0,
  'ch5'  : 0,
  'ch6'  : 0,
  'ch7'  : 0,
  'ch8'  : 0
};
var debug;
module.exports = {
  handler:handler,
  init : function(){
    datachan.datachan_send_async_command(usb.device,4,new Buffer(1),1);
    var buf = new Buffer(4);
    buf.writeFloatLE(0,0);
    datachan.datachan_send_async_command(usb.device,1,buf,buf.length);
    buf = new Buffer([0]);
    datachan.datachan_send_async_command(usb.device,2,buf,buf.length);
    buf = new Buffer([1,6]);
    datachan.datachan_send_async_command(usb.device,3,buf,buf.length);
    buf = new Buffer([2,6]);
    datachan.datachan_send_async_command(usb.device,3,buf,buf.length);
    buf = new Buffer([3,6]);
    datachan.datachan_send_async_command(usb.device,3,buf,buf.length);
    buf = new Buffer([5,6]);
    datachan.datachan_send_async_command(usb.device,3,buf,buf.length);
    buf = new Buffer([6,6]);
    datachan.datachan_send_async_command(usb.device,3,buf,buf.length);
    buf = new Buffer([7,6]);
    datachan.datachan_send_async_command(usb.device,3,buf,buf.length);
    this.handler.emit('init');
  },
  on : function(aa,bb,deb=false){
    datachan.datachan_init();
    a=aa;
    b=bb;
    on = true;
    debug=deb;
    usb=datachan.datachan_device_acquire();
    if(debug){
      thread=setInterval(read,200);
    }
    else if(usb.result === dc_search_results.success){
      datachan.datachan_device_enable(usb.device);
      this.init();
      thread=setInterval(read,200);
    }
    return usb.result === dc_search_results.success || debug ;
  },
  off : function(){
    if(debug){
      clearInterval(thread);
    }
    else if(usb.result === dc_search_results.success){
      datachan.datachan_device_disable(usb.device);
      clearInterval(thread);
      on = false;
      datachan.datachan_send_async_command(usb.device,4,new Buffer(1),1);
      datachan.datachan_device_release(usb.device);
      datachan.datachan_shutdown();
    }
  },
  ison: function(){
    return on;
  },
  send_command:function(command){
    var buf;
    if(datachan.datachan_device_is_enabled(usb.device)){
      switch(command.id){
        case "set_current_output" :
          buf = new Buffer(8);
          buf.writeFloatLE(a-command.value/b,0);
          buf.writeFloatLE(a+command.value/b,4);
          datachan.datachan_send_async_command(usb.device,1,buf,buf.length);
        break;
        case "set_heater_state" :
          buf = new Buffer([parseInt(command.value*255)]);
          datachan.datachan_send_async_command(usb.device,2,buf,buf.length);
        break;
        case "set_gain" :
          buf = new Buffer([parseInt(command.channel),parseInt(command.value)]);
          datachan.datachan_send_async_command(usb.device,3,buf,buf.length);
        break;
      }
    }
  },

};

function read(){
  if(!debug){
  if(datachan.datachan_device_acquire().result===dc_search_results.not_found_or_inaccessible){
    handler.emit('usb-fail');
    return;
  }
  var measure;
  var mes;
  if(datachan.datachan_device_is_enabled(usb.device) && !debug){
    n_mes=datachan.datachan_device_enqueued_measures(usb.device);
    for(var i=0;i<n_mes;i++){
      mes = datachan.datachan_device_dequeue_measure(usb.device);
      measure =ref.deref(mes);
      if(i==n_mes-1){
        scope.time=measure.time*1000+measure.millis;
        for(i=0;i<measure.measureNum;i++){
          scope['ch'+measure.channels[i]]=measure.values[i];
        }
      }
      datachan.datachan_clean_measure(mes);
    }
  }
}
  else{
      scope= {
        'time' : process.hrtime(),
        'ch1' : Math.floor(Math.random() * (-1 + 5 + 1)) + 1,
        'ch2' : Math.floor(Math.random() * (-5 + 10 + 1)) + 5,
        'ch3' : Math.floor(Math.random() * (-10 + 15 + 1)) + 10,
        'ch4' : Math.floor(Math.random() * (-15 + 20 + 1)) + 15,
        'ch5' : Math.floor(Math.random() * (-20 + 25 + 1)) + 20,
        'ch6' : Math.floor(Math.random() * (-25 + 30 + 1)) + 25,
        'ch7' : Math.floor(Math.random() * (-30 + 35 + 1)) + 30,
        'ch8' : Math.floor(Math.random() * (-35 + 40 + 1)) + 35
      };
  }

  handler.emit('measure', scope);
}