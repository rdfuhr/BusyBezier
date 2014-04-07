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

That is reassuring. I want to move it from “Files in the working tree” to “Files staged in the index”  
I was able to drag and drop it there, but if I do a save, will it move it back to the working tree?  
No it didn’t.  Oh, now it did, and there is one in both.

What if I drag the one in the working tree to the index?  That seemed to work.

I am now editing the README.txt file using vi.  I want to see whether this shows up in git status when I save the changes.

I noticed, to my horror, that this README.txt file was NOT showing up in GitHub.  Do I need to “push” it there?


Yes, that is exactly what I needed to do.  Now it shows up in GitHub.  For my last test, I will see whether 
I can access this from the MacBook Pro.

I was able to see it from the MacBook Pro but I got out of sync because I forgot to do a push from somewhere.  
So, I will just have to be careful and also will have to look for the red badges near the Push items.

Pushing it there seemed to work.  Now I am editing the file while on my MacBook Pro.  
What I am going to do is to save these lines, while on my MacBook Pro, commit the file, push to GitHub, 
then delete this folder from the MacBook Pro and check whether things are still OK on the iMac.

This whole thing was a nightmare, because I forgot to “push” somewhere and have perhaps sorted things out now.

I want to see whether I can see this line on the MacBook Pro.

<<<<<<< .merge_file_IV00ax
Something is still wrong.  There are lines that I see on GitHub that I do not see on this checked out version of the file.
=======
Yes, I can see the above line on the MacBook Pro, and I am editing this file on the MacBook Pro 
and will stage, commit, and push, then verify that I can see this line from iMac (and delete this folder from MacBook Pro).
>>>>>>> .merge_file_ewPtIP

This whole thing was rather a nightmare.  It was only thanks to Dropbox that I did not lose the file.  
I guess I have to remember that if I push on one computer I probably need to pull on the other.  
So I am going to commit this file from the iMac and push from the iMac, then will probably need to pull from the MacBook Pro.

OK, I am on the MacBook Pro and see the most recent entries above.  
Now, I will commit this file from the MBP and push from the MBP and then pull from the iMac.

I pulled from the iMac and now things seem to be working better.  I can see the lines most recently entered 
on the MBP.  But I can see how this can be very insidious.

———-

So, now that we have done all that stuff, what are the next steps?

Well, I think I will carry out my original plan of implementing a basic Bezier curve model first in JavaScript, 
write some tests for it, and have some very basic HTML that essentially just launches the tests in the JavaScript code.  

Now on iMac, had "pushed" from MBP and have "pulled" from iMac. 
Editing this now in vi.
If that works, then I can start to implement the “view” component of the whole thing.

I am adding this paragraph using iA Writer on my iPad. One thing that we need to check is whether a web site using 
separate HTML and JavaScript files can be hosted somewhere, in a free web hosting site such as WordPress, so that, 
when accessed by someone with a web browser, it behaves properly. In particular, the JavaScript should be 
able to be seen from the HTML. It seem that we can not do this from Dropbox, but I will need to explore that in more detail. 
If there is no way to do it using separate files, from any reasonable web hosting service, 
I may have no choice but to stick everything in one big HTML file, which is not my preferred approach. 

I was able to see the above entries (made using iA Writer on my iPad) from my iMac.  So now I will stage, commit, and push.

I am now on the MacBook Pro, and see the comments added when I was using iAWriter.

I need to do experiments with different web hosting sites, to determine whether, on any of them, the HTML file can see the JavaScript file.

There are still problems.  I don’t think that I have mastered the concept of pulling and pushing.  I will try this again.  I am now on the iMac, adding these remarks.  I will stage, commit, and push.

OK, now I can see this on the MacBook Pro.  I will stage, commit and push from the MacBook Pro.

Now I am back on the iMac, but I did not see anything telling me that I should do a Pull, but I did one anyway.  This is rather worrisome.  I think that I need to mainly do development from one computer and also to rely heavily on Dropbox.

My experiments so far show that the only place where “web hosting” seems to work properly when I have separate HTML and JS files is in a subfolder of the Public folder of Dropbox, when I do a “copy public link”.  If I try Dropbox files outside of the Public folder, it does not work the same way.  Nor does Box work.  I have not yet tried OneDrive or Google Drive or any of the web-hosting services.

I am now going to add my first HTML and JS files to the repository.

I added the HTML and JS files, but now it does not seem to let me checkout this README file, but perhaps by editing it, it will become visible.

Now I am working with all three at a time, and they all seem visible.  I will add more operations to point.  But I may want to search the web 
for some examples.

I will try one of my own.
It seemed to work.

Now we will do dotprod and make the names dotProd and scalarMult.

Let's do some refactoring by writing a doParagraph function.

Now add a LinearCombination function that is not a member function but which calls member functions.

I am having trouble getting used to the loose typing.

Soon we will need to located the Python source code for my Bezier app and make a note of its location here.

See /Users/richardfuhr/Documents/Sandbox/pythonLearn/BezierCurves/standalone

Now I will start implementing the Bezier class.

I have implemented the constructor and the toString methods, next comes the evaluator.

Implemented doOneDeCasteljauStep now will implement doAllDeCasteljauSteps

Implemented doAllDeCasteljauSteps now will implement the Bezier curve evaluator.

Implemented Bezier curve evaluator, but got hung up because I was using self when I should have been using this.

Next I will implement the derivative evaluator.

The derivative evaluator has been implemented, next, I will implement the evaluators for
the Bernstein basis functions, together with a binomial coefficient calculator.  I will 
not necessarily try to be efficient.

I implemented the position and derivative evaluators for the Bernstein functions
Consider using a modified version of
 file:///Users/richardfuhr/Documents/Sandbox/html5CanvasLearn/html5-curves/
 for initial work with Canvas
 
 Also consider using ideas from /Users/richardfuhr/Documents/Sandbox/html5CanvasLearn/Core HTML5 Canvas/code-master
  In particular, example 2.29 looks promising
  
  Time to do the first baby steps using the Canvas element.
  
  We were able to display a blank canvas and to verify that we could access the drawing context.
  
  Now let's draw something.
  
  Successfully drew a Bezier curve!
  
  Next step; draw the control polygon.

We just added drawControlPolygon!

Next drawFilledCircleAtPoint(P, radius, fillColor, strokeColor)
Next drawControlPoints
Next drawControlPointsWeightedForParm
Next DrawPointOnCurveForParm

We implemented the above.

Now we will implement DoAnimatedCanvasTests.

The initial work on animation went better than expected.  Even though a lot of 
computations are being done, and even though it is inefficient, it still seems to work
smoothly.  Next I will make use of drawAllBezierArtifacts. 


