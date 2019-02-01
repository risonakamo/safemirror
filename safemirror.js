const fs=require("fs");
const child_process=require("child_process");
const glob=require("glob");
const path=require("path");

var testsrc="test1";
var testdest="test2";
var testfilter="*.png";

function main()
{
    var filehandler=new FileHandler;

    glob(`${testsrc}/${testfilter}`,(err,files)=>{
        console.log(files);
        filehandler.recieveFiles(files,"srcfiles");
    });

    glob(`${testdest}/${testfilter}`,(err,files)=>{
        console.log(files);
        filehandler.recieveFiles(files,"destfiles");
    });
}

class FileHandler
{
    constructor()
    {
        this.filePaths={};
        this.readyCount=0;
    }

    //public
    //recieve file data array. should get an array of file paths
    //from async glob actions. which folder should be a string, either
    //"srcfiles" or "destfiles"
    recieveFiles(files,whichFolder)
    {
        this.filePaths[whichFolder]=files;
        this.readyCount++;

        if (this.readyCount==2)
        {
            this.filesReady();
        }
    }

    //function executes once all async file recieves are done
    filesReady()
    {
        console.log("gomegalul");
    }
}

main();