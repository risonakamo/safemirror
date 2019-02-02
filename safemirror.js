const glob=require("glob");
const path=require("path");
const program=require("commander");
const fs=require("fs");

var testsrc="test1";
var testdest="test2";
var testfilter="*.png";

var srcpath=testsrc;
var destpath=testdest;
var filters=testfilter;

// program.arguments("<srcpath> <destpath> [filters]")
// .action((sp,dp,fts)=>{
//     console.log("a");
// }).parse(process.argv);


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

//main action class of program
//recieves directory data and then does things
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

        if (moveOutDestFiles.length)
        {
            console.log(moveOutDestFiles);
            this.handleMoveOutFiles(moveOutDestFiles);
        }

        console.log(this.filePaths);
    }

    //move files into delete folder of destpath
    handleMoveOutFiles(files)
    {
        if (!fs.existsSync(`${destpath}/delete`))
        {
            fs.mkdirSync(`${destpath}/delete`);
        }

        for (var x=0,l=files.length;x<l;x++)
        {
            fs.rename(files[x],`${destpath}/delete/${path.basename(files[x])}`,()=>{});
        }
    }

    mainCopyTransfer()
    {

    }
}

main();