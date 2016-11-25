var app = require('electron').remote;
var dialog = app.dialog;
var config = app.getGlobal('config');
var handler = require('./usb-handler');
var slider = require('bootstrap-slider');

var mathjaxHelper = require('mathjax-electron');


var formulas = [
	{
		'id':'res',
		'formula': '\\sum\\limits_{i=0}^{\\infty} \\frac{1}{n^2}'
	},
	{
		'id':'vr-cal',
		'formula': '\\sum\\limits_{i=0}^{\\infty} \\frac{2}{n^3}=\\hat{\\beta_{1}}'
	}
]


/*
mathjax example
var container = document.getElementById('vh');
container.innerHTML = '$$\\sum\\limits_{i=0}^{\\infty} \\frac{1}{n^2}$$';
mathjaxHelper.loadAndTypeset(document, container);
*/





$(function() {
	$("[name='start-stop']").bootstrapSwitch({
    onText : 'REC',
    offText : '<i class="icon-pause2"></i>',
    onSwitchChange: (event,state) => {
      if(state){
        if(!handler.start()){
					$("[name='start-stop']").bootstrapSwitch('state',false);
				}
      }
      else{
        handler.stop();
      }
    }
	});
	$("[name='on-off']").bootstrapSwitch({
    onText : 'ON',
    offText : 'OFF',
    onSwitchChange: (event,state) => {
      if(state){
				handler.on();
				bootbox.prompt({
				    size: 'small',
						inputType: 'text',
				    title: 'Input the experiment name or skip for default value',
				    callback: function(result){
							console.log(result);
							text = (result==null || result.trim()=='') ? config._experiment : result;
							$('#experiment').text(text);
							$('#date').text(' - '+config._date);
						}
				});
				$("[name='start-stop']").bootstrapSwitch('toggleDisabled');
      }
      else{
				handler.off();
				$("[name='start-stop']").bootstrapSwitch('state',false);
				$("[name='start-stop']").bootstrapSwitch('toggleDisabled');
      }
    }
	});
});



$('#plot').click(function(){
    window.open('./plot/index.html')
})
$('.gain li a').click(function(){
  var selText = $(this).text();
  $(this).parents('.gain-wrap').find('.dropdown-toggle').html(selText+' <i class="caret"></i>');
});
$('#power').ionRangeSlider({
	min:0,
	max:100,
	prefix : 'Power: ',
	postfix : '%'
});
$('#k-slider').ionRangeSlider({
	min:0,
	max:1,
	step:0.001,
	prefix : 'K: ',
	keyboard : true,
	onChange: function(data){
		$('#k-value').val(data.from);
	},
	onStart: function(data){
		$('#k-value').val(data.from);
	}
});
$('#k-value').change(function(){
	val = $('#k-value').val();
	if(val>1){
		val=1;
		$('#k-value').val(val);
	}
	if(val<0){
		val=0;
		$('#k-value').val(val);
	}
	$("#k-slider").data("ionRangeSlider").update({
		from : val
	});

})
formulas.forEach(function(item){
	$('#'+item.id).popover({
		 trigger: 'hover',
		 title : 'Formula',
		 html : true,
		 content: '<div id="'+item.id+'_formula">$$'+item.formula+'$$</div>'
	}).on('shown.bs.popover',function(){
		mathjaxHelper.loadAndTypeset(document, document.getElementById(item.id+'_formula'));
	});
});
/*$('#res').popover({
	 trigger: 'hover',
	 title : 'Formula',
	 html : true,
	 content: '<div id="res_formula">$$\\sum\\limits_{i=0}^{\\infty} \\frac{1}{n^2}$$</div>'
}).on('shown.bs.popover',function(){
	mathjaxHelper.loadAndTypeset(document, document.getElementById('res_formula'));
});*/



/*
$('#experiment').keydown(function(e) {
     if(e.keyCode == 13) {
       e.preventDefault(); // Makes no difference
			 $(this).blur(function() {
         $(this).attr('contentEditable', false);
			 });
   }
});

$('#experiment').bind('dblclick', function() {
        $(this).attr('contentEditable', true);
    }).blur(
        function() {
            $(this).attr('contentEditable', false);
});
*/
