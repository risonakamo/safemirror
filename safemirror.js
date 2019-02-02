const child_process=require("child_process");
const glob=require("glob");
const path=require("path");

var testsrc="test1";
var testdest="test2";
var testfilter="*.*";

const srcpath=testsrc;
const destpath=testdest;
const filters=testfilter;

function main()
{
    var filehandler=new FileHandler;

    glob(`${srcpath}/${filters}`,(err,files)=>{
        filehandler.recieveFiles(files,"srcfiles");
    });

    glob(`${destpath}/${filters}`,(err,files)=>{
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
        console.log(this.filePaths);
        var srcFilesSet=new Set(this.filePaths.srcfiles.map((x,i)=>{
            return path.basename(x);
        }));

        //determine which files are not source files and shuold be moved away
        var moveOutDestFiles=[];
        var destfiles=this.filePaths.destfiles;
        var destfile;
        for (var x=0,l=destfiles.length;x<l;x++)
        {
            destfile=path.basename(destfiles[x]);
            if (!srcFilesSet.has(destfile))
            {
                moveOutDestFiles.push(destfile);
            }
        }

        if (moveOutDestFiles.length)
        {
            console.log(moveOutDestFiles);
            child_process.exec(`robocopy ${destpath} ${destpath}/delete ${moveOutDestFiles.join(" ")} /move`);
        }

        child_process.exec(`robocopy ${srcpath} ${destpath} ${filters}`);
    }
}

main();