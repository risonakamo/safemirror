const fs=require("fs");
const child_process=require("child_process");
const glob=require("glob");
const path=require("path");

var testsrc="test1";
var testdest="test2";
var testfilter="*.png";

glob(`${testsrc}/${testfilter}`,(err,files)=>{
    console.log(files);
});

glob(`${testdest}/${testfilter}`,(err,files)=>{
    console.log(files);
    console.log(path.basename(files[0]));
});