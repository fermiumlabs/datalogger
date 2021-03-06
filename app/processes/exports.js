
/*jshint esversion: 6*/
" use strict";
var fs = require('fs');
var path = require('path');
var fsPath = require('fs-path');
var json2csv = require('json2csv');
var math = require('mathjs');
var _ = require('lodash');

var values={};
var cols = [];
function export_data(file,sep,extension){
  var data = JSON.parse(fs.readFileSync(file, 'utf8'));
  var name = path.normalize(path.join(path.dirname(file),path.basename(file,'.json'),'experiment_data.'+extension));

	json2csv({ data: data._data , fields:cols,del: sep}, (err,csv) => {
  		if (err) console.log(err);
      fsPath.writeFile(name, csv, function(err) {
          if(err) console.log(err);
          else process.send({action:'end',message:name});
      });
	});
}
function init_math(mathsh,to_export){

    cols.push('time');
    for(var i in to_export){
      cols.push(_.clone({
        label: to_export[i],
        value: function(row,field,data){
          values=math.eval(mathsh,row);
          return row[this.label].value;
        }
      }));
    }
  }
  function scidavis(file){
    var data = JSON.parse(fs.readFileSync(file, 'utf8'));
    var name = path.normalize(path.join(path.dirname(file),path.basename(file,'.json'),'tmp.tsv'));
  	json2csv({ data: data._data ,fields:cols,del: '\t',quotes:''}, (err,csv) => {
    		if (err) throw err;
        fsPath.writeFile(name, csv, function(err) {
            if(err) throw err;
            else{
              let scidavis_path = '';
              switch(process.platform){
                case 'darwin':
                  scidavis_path='/Applications/scidavis.app/Contents/MacOS/scidavis';
                break;
                case 'linux':
                  scidavis_path='scidavis';
                break;
                case 'win32':
                  scidavis_path='%programfiles(x86)%\\scidavis\\scidavis.exe';
                break;
              }
              require('child_process').exec(scidavis_path+' '+name,function(e, stdout, stderr) {
              console.log(stdout);
              console.log(stderr);
              if (e) process.send({action:'error',message:'Scidavis error'});
              });
              process.send({action:'end',message:name});
            }
        });
  	});
}
var data=JSON.parse(process.argv[2]);
init_math(data.math,data.to_export);
if(data.ex.extension!='scidavis')
  export_data(data.file,data.ex.sep,data.ex.extension);
else {
  scidavis(data.file);
}
