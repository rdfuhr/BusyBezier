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
   for (i = 0; i < n; i++)
   {
      curveData += "<p>"
      curveData += "CtrlPt[" + i + "] = ";
      curveData += this.CtrlPt[i].toString();
      curveData += "</p>";
   }
   return curveData;
}
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

}

// End Testing Utilities


