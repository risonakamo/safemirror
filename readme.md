## safemirror
safemirror is a node.js command line program for mirroring files in directories "safely" (without deleting). **Files that would normally be deleted by mirroring are instead moved into a new directory within the destination directory**, to be handled later.

![](https://i.imgur.com/5bicEtz.png)

### what is mirroring
Mirroring a directory requires a source and destination directory.  Mirroring attempts to make the destination directory essentially the same as the source directory.  This means copying over any files that are in the source directory but are not in the destination directory, and deleting any files that are in the destination but are not in the source directory.

### whats the safe part
Mirroring is already performed standard programs, for example robocopy.  However, these programs will delete files that are not present in the source directory, as required by mirroring.  Safemirror was made because I didn't want those files to be deleted, as I might use them again soon. So it's "safe" because nothing gets lost, hopefully.

### usage
```safemirror <src> <dest> [filters]```
- filters should be globs, for example \*.\* is all files
- filters defaults to all files

```safemirror -p|--preset <preset>```
- use a preset src, dest, and filters
- right now preset support is bad

### careful
- It's relatively untested.
- currently not made to work on subdirectories, because I haven't needed that feature yet