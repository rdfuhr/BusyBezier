// The following is from http://www.2ality.com/2012/01/js-inheritance-by-example.html
// I made some changes; for instance, the function that I call "norm" was called "dist"

// We are also going to refer to my Python code in
// /Users/richardfuhr/Documents/Sandbox/pythonLearn/BezierCurves/standalone

// Begin Point Utilities

function Point(x, y) 
{
	this.x = x;
	this.y = y;
}

Point.prototype.norm = function () 
{
	return Math.sqrt((this.x*this.x)+(this.y*this.y));
};

Point.prototype.toString = function () 
{
	return "("+this.x+", "+this.y+")";
};

// TODO - We need to implement the basic point operations, adding subtracting, 
// scalar multiplication, dot product

// I am going to try this, but I am not sure it is going to work
Point.prototype.plus = function(that)
{
   var x = this.x + that.x;
   var y = this.y + that.y;
   return new Point(x,y);
}

Point.prototype.minus = function(that)
{
   var x = this.x - that.x;
   var y = this.y - that.y;
   return new Point(x,y);
}

Point.prototype.scalarMult = function(s)
{
   var x = s*this.x;
   var y = s*this.y;
   return new Point(x,y);
}

Point.prototype.dotProd = function(that)
{
   return this.x*that.x + this.y*that.y;
}

// The following is not a prototype for Point, but it will call prototypes
function linearCombination(a, P, b, Q)
{
   var aP = P.scalarMult(a);
   var bQ = Q.scalarMult(b);
   var aPplusbQ = aP.plus(bQ);
   return aPplusbQ;
}

// End Point Utilities

// Begin Bezier Curve Utilities
function cubicBezierCurve(P0, P1, P2, P3)
{
   this.CtrlPt = new Array(P0, P1, P2, P3);
}

cubicBezierCurve.prototype.toString = function()
{
   var curveData = "Data for Bezier Curve\n";
   var n = this.CtrlPt.length;
   for (var i = 0; i < n; i++)
   {
      curveData += "<p>"
      curveData += "CtrlPt[" + i + "] = ";
      curveData += this.CtrlPt[i].toString();
      curveData += "</p>";
   }
   return curveData;
}

// Begin Bezier Curve Evaluator Utilities

// NOTE: We will try modeling these after the utilities in BezUtils.py
// NOTE: position_at_parm calls do_all_decasteljau_steps
// NOTE: do_all_decasteljau_steps calls do_one_decasteljau_step
// NOTE: do_one_decasteljau_step invokes linear combination function

// We will write these starting with the lowest level routine
// We will use a naming convention different than what we used in Python
// We will use camelCase here; we used underscores there.

function doOneDeCasteljauStep(P,t)
{
	// Do one step of the DeCasteljau algorithm
	var s = 1.0 - t
	var Q = new Array();
	var n = P.length;
	for (var i = 0; i < n-1; i++)
	{
		Q.push(linearCombination(s, P[i], t, P[i+1]));
	}
	return Q;
}

function doAllDeCasteljauSteps(P, t)
{
   // Do all steps of the DeCasteljau algorithm
   var n = P.length
   if (n < 1)
   {
      return nil;
   }
   else
   {
      for (i = 0; i < n-1; i++)
      {
         P = doOneDeCasteljauStep(P, t); // so we are overwriting P
      }
      return P[0];
   }
}

//   End Bezier Curve Evaluator Utilities

// 	  End Bezier Curve Utilities

// Begin Testing Utilities

function startParagraph()
{
    document.write("<p>");
}

function endParagraph()
{
    document.write("</p>");
}

function doParagraph(theContents)
{
   startParagraph();
   document.write(theContents);
   endParagraph();
}



function SayHello()
{
	alert("Hello!");
}

function DoPointTests()
{

    doParagraph("Doing Point Tests");

    var P = new Point(3,4);
    doParagraph("P = " + P.toString());
    doParagraph("P.norm() = " + P.norm());

    var Q = new Point(5,12);
    doParagraph("Q = " + Q.toString());
    doParagraph("Q.norm() = " + Q.norm());
  
    var R = P.plus(Q);
    doParagraph("R = P.plus(Q) = " + R); 
    
    var S = R.minus(Q);  
    doParagraph("S = R.minus(Q) = " + S); 

    var T = P.scalarMult(10);
    doParagraph("T = P.scalarMult(10) = " + T);

    var dotproduct = P.dotProd(Q);
    doParagraph(P.toString() + ".dotProd(" + Q.toString() + ") = " + dotproduct); 
    
    var U = linearCombination(10, P, 100, Q);
    doParagraph("linearCombination(10, P, 100, Q) = " + U.toString());
    
    var P0 = new Point(0, 0);
    var P1 = new Point(1, 1);
    var P2 = new Point(2, 8);
    var P3 = new Point(3, 27);
    
    var C = new cubicBezierCurve(P0, P1, P2, P3);
    doParagraph(C.toString());
    
    var ctrlPts = C.CtrlPt;
    var t = 0.5;
    var derivedPts = doOneDeCasteljauStep(ctrlPts, t)
    doParagraph("After doOneDeCasteljauStep with t = " + t + " derivedPts.length = " + derivedPts.length); 
    for (var i = 0; i < derivedPts.length; i++)
    {
       doParagraph("derivedPts[" + i + "] = " + derivedPts[i].toString());
    }
    
    var derivedPt = doAllDeCasteljauSteps(ctrlPts, t);
    doParagraph("After doAllDeCasteljauSteps with t = " + t + " derivedPt = " + derivedPt.toString());
    
    doParagraph("Construct the Bezier curve that is the graph of y = x^3 for 0 <= x <= 1 and evaluate it");
    
    var oneThird = 1.0/3.0;
    var twoThirds = 2.0/3.0;
    
    var Q0 = new Point(0.0, 0.0)
    var Q1 = new Point(oneThird, 0.0);
    var Q2 = new Point(twoThirds, 0.0);
    var Q3 = new Point(1.0, 1.0);
    
    var GraphOfXcubed = new cubicBezierCurve(Q0, Q1, Q2, Q3);
    
    var nIntervals = 10;
    var delta = 1.0/nIntervals;
    var s;
    var cPts = GraphOfXcubed.CtrlPt; // Looks like cPts are not destroyed during calls.
    for (var i = 0; i <= nIntervals; i++)
    {
       s = i*delta;
       var ptOnCrv = doAllDeCasteljauSteps(cPts, s);
       doParagraph("For s = " + s + " ptOnCrv = " + ptOnCrv.toString());
    }
    

}

// End Testing Utilities


