const glob=require("glob");
const path=require("path");
const program=require("commander");
const fs=require("fs");
const logUpdate=require("log-update");

var testsrc="test1";
var testdest="test2";
var testfilter="*.png";

// var testsrc="..";
// var testdest="g:/videos";
// var testfilter="*.mkv";

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
        this.filePaths={}; //object containing files paths
                           //for src files and destination files
        this.readyCount=0; //count of file path arrays recieved from async functions.
                           //action begins at 2
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

        this.totalFileActions=this.filePaths.srcfiles.length;

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
            this.handleMoveOutFiles(moveOutDestFiles);
        }

        this.mainCopyTransfer();
    }

    //move files into delete folder of destpath
    handleMoveOutFiles(files)
    {
        this.totalFileActions+=files.length;
        if (!fs.existsSync(`${destpath}/delete`))
        {
            fs.mkdirSync(`${destpath}/delete`);
        }

        files.forEach((x,i)=>{
            var bname=path.basename(x);
            fs.rename(x,`${destpath}/delete/${bname}`,(err)=>{
                console.log(`${this.currentFileAction}/${this.totalFileActions} ${bname} (moved)`);
                this.currentFileAction++;
            });
        });
    }

    //copy all srcfiles in filePaths to the destination
    mainCopyTransfer()
    {
        var srcfiles=this.filePaths.srcfiles;

        srcfiles.forEach((x)=>{
            var bname=path.basename(x);
            fs.copyFile(x,`${destpath}/${bname}`,fs.constants.COPYFILE_EXCL,
                (err)=>{
                    if (err)
                    {
                        if (err.code=="EEXIST")
                        {
                            console.log(`${this.currentFileAction}/${this.totalFileActions} ${bname} (already exist)`);
                            this.currentFileAction++;
                        }

                        else
                        {
                            console.log(`${bname} (err)`);
                        }

                        return;
                    }

                    console.log(`${this.currentFileAction}/${this.totalFileActions} ${bname}`);
                    this.currentFileAction++;
                }
            );
        });
    }
}

main();