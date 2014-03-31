The purpose of this folder is to implement an HTML5 and JavaScript version of my BusyBezier app.

If this works, then I will try implementing an HTML5 and JavaScript version of my BusyBSpline app.

I will also try managing this with git and using GitHub.

I was able to stage and commit the first version of the README.txt file.

Now I have checked it out and am adding these lines and will check it back in.

I will use this file to keep track of what I have learned and what still puzzles me.

What puzzles me is when I go into my git account, I can not find the file README.txt in GitHub.  Why would that be.

Note that I am now in the following directory:
/Users/richardfuhr/Dropbox/Public/Sandbox/javaScriptLearn/gitPractice/BusyBezier

and my default directory in my SourceTree settings is the project folder

/Users/richardfuhr/Dropbox/Public/Sandbox/javaScriptLearn/gitPractice/

After a bit of a pause, README.txt shows up in the working tree in the SourceTree window.

That is reassuring. I want to move it from “Files in the working tree” to “Files staged in the index”  I was able to drag and drop it there, but if I do a save, will it move it back to the working tree?  No it didn’t.  Oh, now it did, and there is one in both.

What if I drag the one in the working tree to the index?  That seemed to work.

I am now editing the README.txt file using vi.  I want to see whether this shows up in git status when I save the changes.

I noticed, to my horror, that this README.txt file was NOT showing up in GitHub.  Do I need to “push” it there?


Yes, that is exactly what I needed to do.  Now it shows up in GitHub.  For my last test, I will see whether I can access this from the MacBook Pro.

I was able to see it from the MacBook Pro but I got out of sync because I forgot to do a push from somewhere.  So, I will just have to be careful and also will have to look for the red badges near the Push items.

Pushing it there seemed to work.  Now I am editing the file while on my MacBook Pro.  What I am going to do is to save these lines, while on my MacBook Pro, commit the file, push to GitHub, then delete this folder from the MacBook Pro and check whether things are still OK on the iMac.

This whole thing was a nightmare, because I forgot to “push” somewhere and have perhaps sorted things out now.

I want to see whether I can see this line on the MacBook Pro.

<<<<<<< .merge_file_IV00ax
Something is still wrong.  There are lines that I see on GitHub that I do not see on this checked out version of the file.
=======
Yes, I can see the above line on the MacBook Pro, and I am editing this file on the MacBook Pro and will stage, commit, and push, then verify that I can see this line from iMac (and delete this folder from MacBook Pro).
>>>>>>> .merge_file_ewPtIP

This whole thing was rather a nightmare.  It was only thanks to Dropbox that I did not lose the file.  I guess I have to remember that if I push on one computer I probably need to pull on the other.  So I am going to commit this file from the iMac and push from the iMac, then will probably need to pull from the MacBook Pro.

OK, I am on the MacBook Pro and see the most recent entries above.  Now, I will commit this file from the MBP and push from the MBP and then pull from the iMac.

I pulled from the iMac and now things seem to be working better.  I can see the lines most recently entered on the MBP.  But I can see how this can be very insidious.

———-

So, now that we have done all that stuff, what are the next steps?

Well, I think I will carry out my original plan of implementing a basic Bezier curve model first in JavaScript, write some tests for it, and have some very basic HTML that essentially just launches the tests in the JavaScript code.  If that works, then I can start to implement the “view” component of the whole thing.
