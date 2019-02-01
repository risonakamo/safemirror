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
        filehandler.recieveFiles(files,"srcfiles");
    });

    glob(`${testdest}/${testfilter}`,(err,files)=>{
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
        var srcFilesSet=new Set(this.filePaths.srcfiles.map((x,i)=>{
            return path.basename(x);
        }));

        //determine which files are not source files and shuold be moved away
        var moveOutDestFiles=[];
        var destfiles=this.filePaths.destfiles;
        for (var x=0,l=destfiles.length;x<l;x++)
        {
            if (!srcFilesSet.has(path.basename(destfiles[x])))
            {
                moveOutDestFiles.push(destfiles[x]);
            }
        }

        console.log(moveOutDestFiles);
    }
}

main();