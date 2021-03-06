#!/usr/bin/env node

const glob=require("glob");
const path=require("path");
const program=require("commander");
const fs=require("fs");
const logUpdate=require("log-update");
const chalk=require("chalk");

var srcpath; //main src directory for copying out of
var destpath; //directory to copy into
var filters; //file filter globs

//temporary preset storage
//one day move it to an external file
const presets={
    "vids":{
        src:"send to drive",
        dest:"g:/videos",
        filter:"*.mkv"
    },
    "test":{
        src:"test1",
        dest:"test2",
        filter:"*.png"
    }
};

function commanderSetup()
{
    program.arguments("<srcpath> <destpath> [filters]");
    program.option("-p --preset <preset>","use a preset");
    program.option("-d --move-delete","use deleted files for move-back");

    program.action((inputsrc,inputdest,inputfilters="*.*")=>{
        srcpath=inputsrc;
        destpath=inputdest;
        filters=inputfilters;
    });

    program.parse(process.argv);
    main();
}

function main()
{
    if (program.preset)
    {
        srcpath=presets[program.preset].src;
        destpath=presets[program.preset].dest;
        filters=presets[program.preset].filter;
    }

    if (!fs.existsSync(srcpath))
    {
        console.log("src path doesn't exist");
        return;
    }

    if (!fs.existsSync(destpath))
    {
        console.log("dest path doesn't exist");
        return;
    }

    var filehandler=new FileHandler;

    glob(`${srcpath}/${filters}`,(err,files)=>{
        filehandler.recieveFiles(files,"srcfiles");
    });

    glob(`${destpath}/${filters}`,(err,files)=>{
        filehandler.recieveFiles(files,"destfiles");
    });

    //if move delete is enabled, scan the delete folder for deleted files
    //applicable for move-back
    if (program.moveDelete)
    {
        glob(`${destpath}/delete/${filters}`,(err,files)=>{
            filehandler.recieveFiles(files,"deletefiles");
        });
    }

    //otherwise set deletefiles to empty
    else
    {
        filehandler.recieveFiles([],"deletefiles");
    }
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

        this.fileStatuses=[]; //array that should include every file object that
                              //we care about tracking completion status for
    }

    //public
    //recieve file data array. should get an array of file paths
    //from async glob actions. which folder should be a string, either
    //"srcfiles" or "destfiles"
    recieveFiles(files,whichFolder)
    {
        this.filePaths[whichFolder]=files;
        this.readyCount++;

        //wait for 3 files to come in, srcfiles, destfiles, and deletefiles
        if (this.readyCount==3)
        {
            this.filesReady();
        }
    }

    //function executes once all async file recieves are done
    filesReady()
    {
        var srcFilesSet=new Set(this.filePaths.srcfiles.map((x,i)=>{
            this.filePaths.srcfiles[i]={path:x,base:path.basename(x)};
            this.fileStatuses.push(this.filePaths.srcfiles[i]);
            return this.filePaths.srcfiles[i].base;
        }));

        //determine which files are not source files and shuold be moved away
        var moveOutDestFiles=[];
        var destfiles=this.filePaths.destfiles;
        for (var x=0,l=destfiles.length;x<l;x++)
        {
            destfiles[x]={path:destfiles[x],base:path.basename(destfiles[x])};

            if (!srcFilesSet.has(destfiles[x].base))
            {
                moveOutDestFiles.push(destfiles[x]);
                this.fileStatuses.push(destfiles[x]);
            }
        }

        this.renderLog();

        if (moveOutDestFiles.length)
        {
            this.handleMoveOutFiles(moveOutDestFiles);
        }

        this.mainCopyTransfer();
    }

    //move files into delete folder of destpath
    handleMoveOutFiles(files)
    {
        if (!fs.existsSync(`${destpath}/delete`))
        {
            fs.mkdirSync(`${destpath}/delete`);
        }

        files.forEach((x,i)=>{
            fs.rename(x.path,`${destpath}/delete/${x.base}`,(err)=>{
                x.status=chalk.yellow("moved");
                this.renderLog();
            });
        });
    }

    //copy all srcfiles in filePaths to the destination
    mainCopyTransfer()
    {
        var srcfiles=this.filePaths.srcfiles;

        //set of deleted files' basenames
        var deleteFilesSet=new Set(this.filePaths.deletefiles.map((x)=>{
            return path.basename(x);
        }));

        srcfiles.forEach((x)=>{
            //check deleted files set to see if any files about to be copied are
            //in the deleted files set. if there are, move it instead of copying
            if (deleteFilesSet.has(x.base))
            {
                fs.rename(`${destpath}/delete/${x.base}`,`${destpath}/${x.base}`,(err)=>{
                    x.status=chalk.yellowBright("move-back");
                    this.renderLog();
                });

                return;
            }

            fs.copyFile(x.path,`${destpath}/${x.base}`,fs.constants.COPYFILE_EXCL,
                (err)=>{
                    if (err)
                    {
                        if (err.code=="EEXIST")
                        {
                            x.status=chalk.blue("already exist");
                            this.renderLog();
                        }

                        else
                        {
                            x.status=chalk.bgRed("err");
                            this.renderLog();
                        }

                        return;
                    }

                    x.status=chalk.green("copied");
                    this.renderLog();
                }
            );
        });
    }

    //uses fileStatuses to render the log
    renderLog()
    {
        var res="";
        var status;
        var lastNewline="\n";
        for (var x=0,l=this.fileStatuses.length;x<l;x++)
        {
            status=chalk.magenta("working...");
            if (this.fileStatuses[x].status)
            {
                status=this.fileStatuses[x].status;
            }

            if (x==l-1)
            {
                lastNewline="";
            }

            res+=`${chalk.yellow.dim(x+1)} ${status} ${this.fileStatuses[x].base}${lastNewline}`;
        }

        logUpdate(res);
    }
}

// main();
commanderSetup();