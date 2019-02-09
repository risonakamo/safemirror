## safemirror
safemirror is a node.js command line program for mirroring files in directories "safely" (without deleting). **Files that would normally be deleted by mirroring are instead moved into a new directory within the destination directory**, to be handled later.

![](https://i.imgur.com/5bicEtz.png)

![](https://i.imgur.com/VWDHkup.png)

### what is mirroring
Mirroring a directory requires a source and destination directory.  Mirroring attempts to make the destination directory essentially the same as the source directory.  This means copying over any files that are in the source directory but are not in the destination directory, and deleting any files that are in the destination but are not in the source directory.

### whats the safe part
Mirroring is already performed standard programs, for example robocopy.  However, these programs will delete files that are not present in the source directory, as required by mirroring.  Safemirror was made because I didn't want those files to be deleted, as I might use them again soon. So it's "safe" because nothing gets lost, hopefully.

### usage
```safemirror <src> <dest> [filters] [-d]```
- filters should be globs, for example \*.\* is all files
- filters defaults to all files

```safemirror -p|--preset <preset> [-d]```
- use a preset src, dest, and filters
- right now preset support is bad

```-d|--move-delete``` flag
- optionally appendable given other arguments
- enables move-delete mode
    - files present in the "delete" folder inside of the destination folder, essentially, files that have been "safe-deleted" by safemirror, will be considered for "move-back" during copy operations
    - this means, if a file that is about to be copied from the source directory to the destination directory is present inside the "delete" folder, then the file from the "delete" directory will instead be moved out of the "delete" directory and back into the destination directory, preventing a copy operation and saving time
    - in the case where a file that is about to be copied already exists in the destination directory, "move-back" will still occur, and the file in the "delete" directory will overwrite the one in the destination directory, and will still no longer be present inside the "delete" directory

### careful
- It's relatively untested.
- currently not made to work on subdirectories, because I haven't needed that feature yet