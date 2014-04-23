// The following is from http://www.2ality.com/2012/01/js-inheritance-by-example.html
// I made some changes; for instance, the function that I call "norm" was called "dist"

// We are also going to refer to my Python code in
// /Users/richardfuhr/Documents/Sandbox/pythonLearn/BezierCurves/standalone

"use strict";

// Begin declarations and initializations of global variables
var globalIndexOfModifiedControlPoint = -1; // -1 means none is being modified.
var globalCircleAreaFactor = 2.0; // we will experiment with this
var globalCircleRadiusFactor = Math.sqrt(globalCircleAreaFactor);

var tGlobal = 0.0; // global
var tDeltaGlobal = 0.001;

var globalModifyingPointOnCurve = false;
var globalPointOnCurveForParm; // we may eventually do some better design for this.

function tGlobalUpdate() // updates the global t
{
   tGlobal = tGlobal + tDeltaGlobal;
   if (tGlobal > 1.0)
   {
      tGlobal = 1.0;
      tDeltaGlobal = -1.0*tDeltaGlobal;
   }
   else
   if (tGlobal < 0.0)
   {
      tGlobal = 0.0;
      tDeltaGlobal = -1.0*tDeltaGlobal;
   }   
}


// Begin Point Utilities /////////////////////////////////////////////////////////////////

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

Point.prototype.distanceTo = function(that)
{
   var thisMinusThat = this.minus(that);
   var distanceToThat = thisMinusThat.norm();
   return distanceToThat;
}

// End Point Utilities ///////////////////////////////////////////////////////////////////

// Begin Circle Utilities ////////////////////////////////////////////////////////////////
function Circle(center, radius)
{
   this.center = center;
   this.radius = radius;
}

Circle.prototype.toString = function () 
{
	return "center " + this.center.toString() + "radius = " + this.radius;
};

//   End Circle Utilities ////////////////////////////////////////////////////////////////

// Begin pair of containment routines ////////////////////////////////////////////////////
Point.prototype.isInsideCircle = function(theCircle)
{
   var isInsideCircle;
   var C = theCircle.center;
   var r = theCircle.radius;
   if (this.distanceTo(C) < r)
   {
      isInsideCircle = true;
   }
   else
   {
      isInsideCircle = false;
   }
   return isInsideCircle;
}

Circle.prototype.containsPoint = function(P)
{
   return P.isInsideCircle(this);
}

//   End pair of containment routines ////////////////////////////////////////////////////

// Begin CircleDrawData Utilities ////////////////////////////////////////////////////////

function CircleDrawData(fillColor, strokeColor, curveWidth)
{
   this.fillColor = fillColor;
   this.strokeColor = strokeColor;
   this.curveWidth = curveWidth;
}

CircleDrawData.prototype.toString = function()
{
   var stringRep = "fillColor = " + this.fillColor;
   stringRep = stringRep + "\n";
   stringRep = stringRep + "strokeColor = " + this.strokeColor;
   stringRep = stringRep + "\n";
   stringRep = stringRep + "curveWidth = " + this.curveWidth;
   return stringRep;
}

CircleDrawData.prototype.updateContext = function(context)
{
   context.fillStyle = this.fillColor;
   context.strokeStyle = this.strokeColor;
   context.lineWidth = this.curveWidth;
}

//   End CircleDrawData Utilities ////////////////////////////////////////////////////////

// Begin CurveDrawData Utilities /////////////////////////////////////////////////////////
function CurveDrawData(strokeColor, curveWidth)
{
   this.strokeColor = strokeColor;
   this.curveWidth = curveWidth;
}

CurveDrawData.prototype.toString = function()
{
   var stringRep = "strokeColor = " + this.strokeColor;
   stringRep = stringRep + "\n";
   stringRep = stringRep + "curveWidth = " + this.curveWidth;
   return stringRep;
}

CurveDrawData.prototype.updateContext = function(context)
{
   context.strokeStyle = this.strokeColor;
   context.lineWidth = this.curveWidth;
}

//   End CurveDrawData Utilities /////////////////////////////////////////////////////////

// Begin Bezier Curve Utilities //////////////////////////////////////////////////////////
function cubicBezierCurve(P0, P1, P2, P3)
{
   this.CtrlPts = new Array(P0, P1, P2, P3);
}

cubicBezierCurve.prototype.toString = function()
{
   var curveData = "Data for Bezier Curve\n";
   var n = this.CtrlPts.length;
   for (var i = 0; i < n; i++)
   {
      curveData += "<p>"
      curveData += "CtrlPts[" + i + "] = ";
      curveData += this.CtrlPts[i].toString();
      curveData += "</p>";
   }
   return curveData;
}

// Begin Bezier Curve Evaluator Utilities ////////////////////////////////////////////////

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
      for (var i = 0; i < n-1; i++)
      {
         P = doOneDeCasteljauStep(P, t); // so we are overwriting P
      }
      return P[0];
   }
}


cubicBezierCurve.prototype.positionAtParm = function(t)
{
   var P = this.CtrlPts; 
   var pos = doAllDeCasteljauSteps(P, t);
   return pos;
}


function hodographPoints(P)
{
   // Assume we are given a list of points P that are the control
   // points of a Bezier curve C.  We will construct and return a
   // list of points Q for the hodograph of that curve.
   // That is, we will return a list of points Q that are the
   // control points for the Bezier curve C'
   var Q = new Array();
   var d = P.length - 1; // so d can be interpreted as the degree of C
   for(var i = 0; i < d; i++)
   {
      var LinComb = linearCombination(d, P[i+1], -1.0*d, P[i]);
	  Q.push(LinComb);
   }
   
  
   return Q;
}

cubicBezierCurve.prototype.derivativeAtParm = function(t)
{
   var Q = hodographPoints(this.CtrlPts);
   var der = doAllDeCasteljauSteps(Q, t);
   return der;
}

//   End Bezier Curve Evaluator Utilities ////////////////////////////////////////////////

cubicBezierCurve.prototype.scale = function(xScale, yScale)
{
   for (var i = 0; i < this.CtrlPts.length; i++)
   {
      this.CtrlPts[i].x *= xScale;
      this.CtrlPts[i].y *= yScale;
   }
}

cubicBezierCurve.prototype.translate = function(P)
{
   for (var i = 0; i < this.CtrlPts.length; i++)
   {
      this.CtrlPts[i].x += P.x;
      this.CtrlPts[i].y += P.y;
   }
}

// 	  End Bezier Curve Utilities /////////////////////////////////////////////////////////

// Begin Bernstein Polynomial Utilities //////////////////////////////////////////////////
// http://rosettacode.org/wiki/Evaluate_binomial_coefficients#JavaScript
function binom(n, k) 
{
    var coeff = 1;
    for (var i = n-k+1; i <= n; i++) coeff *= i;
    for (var i = 1;     i <= k; i++) coeff /= i;
    return coeff;
}

// http://web.mit.edu/hyperbook/Patrikalakis-Maekawa-Cho/node9.html
function bernsteinValue(i, n, t)
{
   var value;
   if ((i < 0) || (i > n))
   {
      value = 0.0;
   }
   else 
   {
      value = binom(n,i)*Math.pow(t,i)*Math.pow(1.0-t,n-i);
   }
   return value;
}

// http://web.mit.edu/hyperbook/Patrikalakis-Maekawa-Cho/node9.html
function bernsteinDeriv(i, n, t)
{
   var deriv = n*(bernsteinValue(i-1,n-1,t) - bernsteinValue(i,n-1,t));
   return deriv;
}
//   End Bernstein Polynomial Utilities //////////////////////////////////////////////////

// Begin Canvas Utilities ////////////////////////////////////////////////////////////////
// Consider using a modified version of
//  file:///Users/richardfuhr/Documents/Sandbox/html5CanvasLearn/html5-curves/
//  for initial work with Canvas
// Also consider using ideas from /Users/richardfuhr/Documents/Sandbox/html5CanvasLearn/Core HTML5 Canvas/code-master
// In particular, example 2.29 looks promising

cubicBezierCurve.prototype.drawCurve = function(drawData, context)
{
   context.beginPath();
   drawData.updateContext(context);
   var P = this.CtrlPts;
   context.moveTo(P[0].x, P[0].y);
   context.bezierCurveTo(P[1].x, P[1].y, P[2].x, P[2].y, P[3].x, P[3].y);
   context.stroke();
}

cubicBezierCurve.prototype.drawControlPolygon = function(drawData, context)
{
   context.beginPath();
   drawData.updateContext(context);
   var P = this.CtrlPts;
   context.moveTo(P[0].x, P[0].y);
   context.lineTo(P[1].x, P[1].y);
   context.lineTo(P[2].x, P[2].y);
   context.lineTo(P[3].x, P[3].y);
   context.stroke();
}

Point.prototype.drawCircleHere = function(radius, drawData, context)
{
   context.beginPath();
   drawData.updateContext(context);
   var anticlockwise = true; // It doesn't really matter for a full circle
   context.arc(this.x, this.y, radius, 0, Math.PI*2, anticlockwise);
   context.fill();
   context.stroke();
}

// This one is somewhat redundant given the one above
Circle.prototype.draw = function(drawData, context)
{
   var center = this.center;
   var radius = this.radius;
   center.drawCircleHere(radius, drawData, context);
}

cubicBezierCurve.prototype.drawControlPoints = function(radius, drawData, context)
{
   var controlPoints = this.CtrlPts;
   var n = controlPoints.length;
   for (var i = 0; i < n; i++)
   {
      controlPoints[i].drawCircleHere(radius, drawData, context);
   }
}

cubicBezierCurve.prototype.drawControlPointsWeightedForParm = function(t, 
                                                                       sumOfAreas, 
                                                                       drawData, 
                                                                       context,
                                                                       controlPointCircles)
{
   var controlPoints = this.CtrlPts;
   var order = controlPoints.length;
   var degree = order - 1;

   for (var i = 0; i < order; i++)
   {
      var actualArea = sumOfAreas*bernsteinValue(i, degree, t);
      // NOTE: actualArea = Math.PI*(actualRadius)^2
      // so actualRadius = sqrt(actualArea/Math.PI)
      var actualRadius = Math.sqrt(actualArea/Math.PI);
      controlPoints[i].drawCircleHere(actualRadius, drawData, context);
      controlPointCircles[i] = new Circle(controlPoints[i], actualRadius);
   }

}

cubicBezierCurve.prototype.drawPointOnCurveForParm = function(t, 
                                                              radius, 
                                                              drawData,
                                                              context)
{
   var P = this.positionAtParm(t);
   P.drawCircleHere(radius, drawData, context);
}

function drawTextForNumber(t,
                           textLocation,
                           fontSpec,
                           context)
{
   // TODO - How can we make the font thinner?
   context.font = fontSpec; 
   context.strokeText(t.toFixed(2), textLocation.x, textLocation.y);
}

// This is a special-purpose function meant to be called from drawBasisFunctionsWithParm
cubicBezierCurve.prototype.drawVerticalLineFromCurveForParm = function(t, 
                                                                       strokeColor,
                                                                       lineWidth, 
                                                                       context)
{
   var P = this.positionAtParm(t);
   // Now, we will create a point Q that has the same x coordinate as P and whose
   // y coordinate is equal to the maximum of the y coordinates of the control points
   // of this cubicBezierCurve.  That is because y increases as we go downward.
   var controlPoints = this.CtrlPts;
   var yMax = controlPoints[0].y;
   for (var i = 1; i < controlPoints.length; i++)
   {
      var yCurr = controlPoints[i].y;
      if (yMax < yCurr) 
      {
         yMax = yCurr;
      }
   }
   var  Q = new Point(P.x, yMax);
   
   context.beginPath();
   context.strokeStyle = strokeColor;
   context.lineWidth = lineWidth;
   context.moveTo(P.x, P.y);
   context.lineTo(Q.x, Q.y);
   context.stroke();
   

} 

function annotateGraphOfCubicBernstein(i,
                                       t,
                                       graphOfCubicBernstein,
                                       context)
{
   var fontSpec = 'lighter 45px Sans-Serif';
   var P = graphOfCubicBernstein.positionAtParm(t);
   var degree = graphOfCubicBernstein.CtrlPts.length - 1; // don't assume 3

   // We still have to evaluate the value of the Bernstein polynomial
   var y = bernsteinValue(i, degree, t);
   // If and only if the index i is 3, we will shift the base point of the text
   // to the left so that it is on the other side of the graph
   if (i==3)
   {
      context.font = fontSpec; 
      var textWidth = context.measureText(t.toFixed(2)).width;
      P.x = P.x - textWidth;
   }
   drawTextForNumber(y, P, fontSpec, context); // For now
}                                                                      

cubicBezierCurve.prototype.drawBasisFunctionsWithParm = function(t,
                                                                 graphStrokeColor,
                                                                 graphWidth,
                                                                 sumOfControlPointAreas,
                                                                 context)
{
   // We will use maxRadius to help position the graphs.
   // Of course we are recalculating maxRadius each time, which is not efficient
   // Later (if later ever becomes now), we will see about making this more efficient.
   var maxRadius = Math.sqrt(sumOfControlPointAreas/Math.PI);
   
   var delta1 = new Point( 1.0*maxRadius, -1.0*maxRadius);
   var delta2 = new Point(-3.0*maxRadius, -1.0*maxRadius); 
   var upperLeft

   for (var indx = 0; indx < 4; indx++)
   {
      if (indx % 2 == 0) // i.e., the even indices
      {
         upperLeft = (this.CtrlPts[indx]).plus(delta1);
      }
      else
      {
         upperLeft = (this.CtrlPts[indx]).plus(delta2);
      }    
      var graphOfCubicBernstein = buildGraphOfCubicBernstein(indx,
                                                             upperLeft,
                                                             2.0*maxRadius,
                                                             2.0*maxRadius);
                                                             
      var drawDataForGraphOfCubicBernstein = new CurveDrawData(graphStrokeColor, 
                                                               graphWidth);                                                       
      graphOfCubicBernstein.drawCurve(drawDataForGraphOfCubicBernstein, context); 
      
      var pointOnGraphRadius = 3.0;
      var pointOnGraphFillColor = "black"
      var pointOnGraphStrokeColor = "black"
      var pointOnGraphStrokeWidth = 5.0;
      var drawDataForPointOnGraph = new CircleDrawData(pointOnGraphFillColor,
                                                       pointOnGraphStrokeColor,
                                                       pointOnGraphStrokeWidth);
                                        
      graphOfCubicBernstein.drawPointOnCurveForParm(t,
                                                    pointOnGraphRadius,
                                                    drawDataForPointOnGraph,
                                                    context);
                                                    
      graphOfCubicBernstein.drawVerticalLineFromCurveForParm(t,
                                                             "black",
                                                             graphWidth,
                                                             context);
                                                             
      annotateGraphOfCubicBernstein(indx,
                                    t,
                                    graphOfCubicBernstein,
                                    context);                                                       
                                                                      
                                                     
   }   
   
}
                                             

cubicBezierCurve.prototype.drawAllBezierArtifacts = function(drawDataForBezierCurve,
                                                             drawDataForControlPolygon,
                                                             sumOfControlPointAreas,
                                                             drawDataForControlPoints,
                                                             pointOnCurveRadius,
                                                             drawDataForPointOnCurve,
                                                             context,
                                                             controlPointCircles)
{
   this.drawCurve(drawDataForBezierCurve, context);
   this.drawControlPolygon(drawDataForControlPolygon, context);

   this.drawControlPointsWeightedForParm(tGlobal, 
                                         sumOfControlPointAreas, 
                                         drawDataForControlPoints,
                                         context,
                                         controlPointCircles);
                                         
                 
   this.drawPointOnCurveForParm(tGlobal,
                                pointOnCurveRadius,
                                drawDataForPointOnCurve,
                                context);
    
    var pointOnCurve = this.positionAtParm(tGlobal);                           
    globalPointOnCurveForParm = new Circle(pointOnCurve, pointOnCurveRadius); 
    
    var textLocation = new Point(pointOnCurve.x, pointOnCurve.y - pointOnCurveRadius);
    
    var fontSpec = 'lighter 45px Sans-Serif';
    drawTextForNumber(tGlobal,
                      textLocation,
                      fontSpec,
                      context);                            

// temporarily hard-code some of the input parameters
   var graphStrokeColor = "green";
   var graphWidth = 2;
   this.drawBasisFunctionsWithParm(tGlobal, 
                                   graphStrokeColor, 
                                   graphWidth, 
                                   sumOfControlPointAreas, 
                                   context);
                                   
                                                                 
                                                                     
}                                                             




//   End Canvas Utilities ////////////////////////////////////////////////////////////////

// Begin Testing Utilities ///////////////////////////////////////////////////////////////

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
    
    var ctrlPts = C.CtrlPts;
    var t = 0.5;
    var derivedPts = doOneDeCasteljauStep(ctrlPts, t)
    doParagraph("After doOneDeCasteljauStep with t = " + t + " derivedPts.length = " + derivedPts.length); 
    for (var i = 0; i < derivedPts.length; i++)
    {
       doParagraph("derivedPts[" + i + "] = " + derivedPts[i].toString());
    }
    
    var derivedPt = doAllDeCasteljauSteps(ctrlPts, t);
    doParagraph("After doAllDeCasteljauSteps with t = " + t + " derivedPt = " + derivedPt.toString());
    
    doParagraph("Construct the Bezier curve that is the graph of y = x^3 for 0 <= x <= 1 ");
    
    doParagraph("We will first test doAllDeCasteljauSteps");
    
    var oneThird = 1.0/3.0;
    var twoThirds = 2.0/3.0;
    
    var Q0 = new Point(0.0, 0.0)
    var Q1 = new Point(oneThird, 0.0);
    var Q2 = new Point(twoThirds, 0.0);
    var Q3 = new Point(1.0, 1.0);
    
    var GraphOfXcubed = new cubicBezierCurve(Q0, Q1, Q2, Q3);
    var thePts = GraphOfXcubed.CtrlPts;
    
    var nIntervals = 10;
    var delta = 1.0/nIntervals;
    var s;
    for (var i = 0; i <= nIntervals; i++)
    {
       s = i*delta;
       var ptOnCrv = doAllDeCasteljauSteps(thePts, s);
       doParagraph("For s = " + s + " ptOnCrv = " + ptOnCrv.toString());
    }
    
    doParagraph("We will now test positionAtParm");
    for (var i = 0; i <= nIntervals; i++)
    {
       s = i*delta;
       var pt2OnCrv = GraphOfXcubed.positionAtParm(s);
       doParagraph("For s = " + s + " pt2OnCrv = " + pt2OnCrv.toString());
    } 
    
    doParagraph("We will now test hodographPoints");
    var hodoPts = hodographPoints(GraphOfXcubed.CtrlPts);
    doParagraph("hodoPts.length = " + hodoPts.length); 
    for (var i = 0; i < hodoPts.length; i++)
    {
       doParagraph("hodoPts[" + i + "] = " + hodoPts[i].toString());
    }
    
    doParagraph("We will now test derivativeAtParm");
    for (var i = 0; i <= nIntervals; i++)
    {
       s = i*delta;
       var vecOnCrv = GraphOfXcubed.derivativeAtParm(s);
       doParagraph("For s = " + s + " vecOnCrv = " + vecOnCrv.toString());
    }
    
    doParagraph("We will now test distanceTo");
    var A = new Point(2958, 7033);
    var B = new Point(A.x + 5, A.y + 12);
    var distAB = A.distanceTo(B);
    doParagraph("distAB = " + distAB + " which should equal 13"); 
    var distBA = B.distanceTo(A);
    doParagraph("distBA = " + distBA + " which should equal 13");
    
    doParagraph("We will now test the Circle class");
    var myCenter = new Point(3, 4);
    var myRadius = 5.0;
    var myCircle = new Circle(myCenter, myRadius);
    doParagraph("myCenter.isInsideCircle(myCircle) = " + myCenter.isInsideCircle(myCircle));  
    doParagraph("myCircle.containsPoint(A) = " + myCircle.containsPoint(A));   
}

function DoBernsteinTests()
{
   for (var n = 0; n < 10; n++)
   {
	   for (var k = 0; k <= n; k++)
	   {
		  doParagraph("binom(" + n + " , " + k + ") = " + binom(n,k));
	   }
	   doParagraph("---");
   }
   
   var t = 0.1;
   for (var n = 0; n < 10; n++)
   {
       var valueSum = 0.0;
       var derivSum = 0.0; 
	   for (var k = 0; k <= n; k++)
	   {
	      var value = bernsteinValue(k,n,t);
	      var deriv = bernsteinDeriv(k,n,t);
	      valueSum += value;
	      derivSum += deriv;
		  doParagraph("bernsteinValue(" + k + " , " + n + " , " + t + ") = " + value);
		  doParagraph("bernsteinDeriv(" + k + " , " + n + " , " + t + ") = " + deriv);
	   }
	   doParagraph("valueSum = " + valueSum);
	   doParagraph("derivSum = " + derivSum);
	   doParagraph("---");
   }
}

function DoStaticCanvasTests()
{
   var drawingCanvas = document.getElementById('drawingCanvas');
   var drawingContext = drawingCanvas.getContext('2d');
   var width = drawingCanvas.width;
   var height = drawingCanvas.height;
   drawingContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
   var lowerMargin = 0.18;
   var upperMargin = 1.0 - lowerMargin;
   var xDelta = (upperMargin - lowerMargin)/3.0;
   var P0 = new Point(lowerMargin*width, lowerMargin*height)
   var P1 = new Point(P0.x + xDelta*width, upperMargin*height);
   var P2 = new Point(P1.x + xDelta*width, P0.y);
   var P3 = new Point(upperMargin*width, P1.y);
   var C = new cubicBezierCurve(P0, P1, P2, P3);

   var curveStrokeColor = "red";
   var curveWidth = 10;
   var drawDataForBezierCurve = new CurveDrawData(curveStrokeColor, curveWidth);
   var lineWidth = 5;
   var polygonStrokeColor = "black";
   var drawDataForControlPolygon = new CurveDrawData(polygonStrokeColor, lineWidth);
   tGlobal = 1.0 - 2.0/(1.0 + Math.sqrt(5.0)); // 1 - reciprocal of golden ratio
   var sumOfControlPointAreas = globalCircleAreaFactor*10000.0; 
   var controlPointFillColor = "blue";
   var controlPointStrokeColor = "green";
   var controlPointStrokeWidth = 5.0;
   var drawDataForControlPoints = new CircleDrawData(controlPointFillColor,
                                                     controlPointStrokeColor,
                                                     controlPointStrokeWidth);
                                                        
   var pointOnCurveRadius = globalCircleRadiusFactor*15.0;
   var pointOnCurveFillColor = "yellow";
   var pointOnCurveStrokeColor = "black";
   var pointOnCurveStrokeWidth = 5.0;
   var drawDataForPointOnCurve = new CircleDrawData(pointOnCurveFillColor,
                                                    pointOnCurveStrokeColor,
                                                    pointOnCurveStrokeWidth);
   var controlPointCircles = new Array();
   
   
   C.drawAllBezierArtifacts(drawDataForBezierCurve,
                            drawDataForControlPolygon,
                            sumOfControlPointAreas,
                            drawDataForControlPoints,
                            pointOnCurveRadius,
                            drawDataForPointOnCurve,
                            drawingContext,
                            controlPointCircles);   

}

// Use http://www.html5canvastutorials.com/advanced/html5-canvas-mouse-coordinates/
// as a guide for how to handle the mouse.
// We will gradually morph this into what we actually want; i.e., we will detect
// whether the mouse is over one of the control points or over the point on the curve

function writeMessage(canvas, message) 
{
	var context = canvas.getContext('2d');
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.font = '18pt Calibri';
	context.fillStyle = 'black';
	context.fillText(message, 10, 25);
}

// We need to be sure that this is being implemented correctly!
// http://stackoverflow.com/questions/12772943/getting-cursor-position-in-a-canvas-without-jquery
function getMousePos(canvas, evt) 
{
	var rect = canvas.getBoundingClientRect();
	var x = evt.clientX - rect.left;
	var y = evt.clientY - rect.top;
	var mousePos = new Point(x,y);
	return mousePos;
}

// Here is an alternative implementation of getMousePos
// My tests so far show that it agrees with getMousePos
function getMousePos2(canvas, evt)
{
   var x = evt.clientX - canvas.offsetLeft;
   var y = evt.clientY - canvas.offsetTop;
   var mousePos = new Point(x,y);
   return mousePos;
}

function onMouseDown(evt, 
                     theBezierCurve, 
                     theSumOfControlPointAreas, 
                     thePointOnCurveRadius,
                     theCanvas,
                     controlPointCircles)
{
   var mousePos = getMousePos(theCanvas, evt);

   globalIndexOfModifiedControlPoint = -1;
   
   if (mousePos.isInsideCircle(globalPointOnCurveForParm))
   {
      globalModifyingPointOnCurve = true;
      globalIndexOfModifiedControlPoint = -1;
      return;
   }

   for (var i = 0; i < controlPointCircles.length; i++)
   {
         if(mousePos.isInsideCircle(controlPointCircles[i]))
         {
            globalIndexOfModifiedControlPoint = i;
            globalModifyingPointOnCurve = false;
            break; 
         }
         else
         {
             // do nothing for now
         }
   }
}

// The following Python code is here for reference.  It is from BezierCanvas.py and I
// will use it as a guide for implementing a counterpart in JavaScript here.
// def EditPointOnCurve(event):
// 	"""Called when we are editing a point on the curve"""
// 	global theBezierCurve
// 	global theCurrentParm
// 	global control_points
// 	
// 	# Need special handling in the case of a single point
// 	if len(control_points)==1: 
// 		return;
// 
// 	# let t be the current parameter
// 	t = theBezierCurve.currentParm
// 	
// 	# calculate the current point P on the curve
// 	P = theBezierCurve.position_at_parm(t)
// 	
// 	# calculate the current tangent vector V on the curve
// 	V = theBezierCurve.derivative_at_parm(t)
// 	
// 	
// 	# get the current mouse point M
// 	M = Point(event.x, event.y)
// 	
// 	# let dt = (M-P)*V/V*V
// 	vdotv = V*V
// 	if vdotv > 0.0:
// 		dt = ((M-P)*V)/vdotv
// 	else:
// 		dt = 0.0	
// 
// 	# let set the new parameter t = t + dt
// 	t += dt
// 	
// 	# but make sure that it is in [0, 1]
// 	t = max(0.0, t)
// 	t = min(t, 1.0)
// 	
// 	# Reset theBezierCurve.currentParm to the updated t
// 	theCurrentParm = t
// 	
// 	# redraw everything
// 	redraw_everything()

cubicBezierCurve.prototype.editPointOnCurve = function(evt,
                                                       drawDataForBezierCurve,
                                                       drawDataForControlPolygon,
                                                       sumOfControlPointAreas,
                                                       drawDataForControlPoints,
                                                       pointOnCurveRadius,
                                                       drawDataForPointOnCurve,
                                                       context,
                                                       canvas,
                                                       controlPointCircles)
{
   var P = this.positionAtParm(tGlobal);
   var V = this.derivativeAtParm(tGlobal);
   var M = getMousePos(canvas, evt);
   var vdotv = V.dotProd(V);
   var dt = 0.0;
   if (vdotv > 0.0)
   {
      dt = ((M.minus(P)).dotProd(V))/vdotv
   }
   tGlobal += dt;
   if (tGlobal < 0.0) tGlobal = 0.0;
   if (tGlobal > 1.0) tGlobal = 1.0;
   
   context.clearRect(0, 0, canvas.width, canvas.height);   
   this.drawAllBezierArtifacts(drawDataForBezierCurve,
                               drawDataForControlPolygon,
                               sumOfControlPointAreas,
                               drawDataForControlPoints,
                               pointOnCurveRadius,
                               drawDataForPointOnCurve,
                               context,
                               controlPointCircles);       
}

cubicBezierCurve.prototype.editControlPoint = function(evt,
                                                       drawDataForBezierCurve,
                                                       drawDataForControlPolygon,
                                                       sumOfControlPointAreas,
                                                       drawDataForControlPoints,
                                                       pointOnCurveRadius,
                                                       drawDataForPointOnCurve,
                                                       context,
                                                       canvas,
                                                       controlPointCircles)
{
   var mousePos = getMousePos(drawingCanvas, evt);
   this.CtrlPts[globalIndexOfModifiedControlPoint] = mousePos;
   context.clearRect(0, 0, drawingCanvas.width, canvas.height);
   
   this.drawAllBezierArtifacts(drawDataForBezierCurve,
                               drawDataForControlPolygon,
                               sumOfControlPointAreas,
                               drawDataForControlPoints,
                               pointOnCurveRadius,
                               drawDataForPointOnCurve,
                               context,
                               controlPointCircles);    
}

function onMouseMove(evt, 
                     C, 
                     drawDataForBezierCurve,
                     drawDataForControlPolygon,
                     sumOfControlPointAreas,
                     drawDataForControlPoints,
					 pointOnCurveRadius,
                     drawDataForPointOnCurve,
					 drawingContext,
					 drawingCanvas,
					 controlPointCircles)
{

	if (globalModifyingPointOnCurve==true)
	{
	   C.editPointOnCurve(evt,
						  drawDataForBezierCurve,
						  drawDataForControlPolygon,
						  sumOfControlPointAreas,
						  drawDataForControlPoints,
						  pointOnCurveRadius,
						  drawDataForPointOnCurve,
						  drawingContext,
						  drawingCanvas,
						  controlPointCircles);  

						
	}
	else if (globalIndexOfModifiedControlPoint > -1)
	{

	   C.editControlPoint(evt,
                          drawDataForBezierCurve,
						  drawDataForControlPolygon,
						  sumOfControlPointAreas,
						  drawDataForControlPoints,
						  pointOnCurveRadius,
						  drawDataForPointOnCurve,
						  drawingContext,
						  drawingCanvas,
						  controlPointCircles);  
	}
	else
	{
	   // for now; do nothing
	}
}

function onMouseUp(evt, 
                   C, 
                   drawDataForBezierCurve,
                   drawDataForControlPolygon,
                   sumOfControlPointAreas,
                   drawDataForControlPoints,
                   pointOnCurveRadius,
                   drawDataForPointOnCurve,
                   drawingContext,
                   drawingCanvas,
                   controlPointCircles)
{
   if(globalModifyingPointOnCurve==true)
   {
      globalModifyingPointOnCurve = false;
   }
   else if (globalIndexOfModifiedControlPoint > -1)
   {
						   	
      globalIndexOfModifiedControlPoint = -1;                          
   } 
}

// Begin adding code based on 
// http://stackoverflow.com/questions/5186441/javascript-drag-and-drop-for-touch-devices/6362527#6362527
function touchHandler(event) {
    var touch = event.changedTouches[0];

    var simulatedEvent = document.createEvent("MouseEvent");
        simulatedEvent.initMouseEvent({
        touchstart: "mousedown",
        touchmove: "mousemove",
        touchend: "mouseup"
    }[event.type], true, true, window, 1,
        touch.screenX, touch.screenY,
        touch.clientX, touch.clientY, false,
        false, false, false, 0, null);

    touch.target.dispatchEvent(simulatedEvent);
    event.preventDefault();
    
}
//   End adding code based on 
// http://stackoverflow.com/questions/5186441/javascript-drag-and-drop-for-touch-devices/6362527#6362527  


function DoDynamicMouseTests()
{
   var drawingCanvas = document.getElementById('drawingCanvas');
   var drawingContext = drawingCanvas.getContext('2d');
   var width = drawingCanvas.width;
   var height = drawingCanvas.height;
   drawingContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
   var lowerMargin = 0.18;
   var upperMargin = 1.0 - lowerMargin;
   var xDelta = (upperMargin - lowerMargin)/3.0;
   var P0 = new Point(lowerMargin*width, lowerMargin*height)
   var P1 = new Point(P0.x + xDelta*width, upperMargin*height);
   var P2 = new Point(P1.x + xDelta*width, P0.y);
   var P3 = new Point(upperMargin*width, P1.y);
   var C = new cubicBezierCurve(P0, P1, P2, P3);

   var curveStrokeColor = "red";
   var curveWidth = 10;
   var drawDataForBezierCurve = new CurveDrawData(curveStrokeColor, curveWidth);
   var lineWidth = 5;
   var polygonStrokeColor = "black";
   var drawDataForControlPolygon = new CurveDrawData(polygonStrokeColor, lineWidth);
   tGlobal = 1.0 - 2.0/(1.0 + Math.sqrt(5.0)); // 1 - reciprocal of golden ratio
   var sumOfControlPointAreas = globalCircleAreaFactor*10000.0;
   var controlPointFillColor = "blue";
   var controlPointStrokeColor = "green";
   var controlPointStrokeWidth = 5.0;
   var drawDataForControlPoints = new CircleDrawData(controlPointFillColor,
                                                     controlPointStrokeColor,
                                                     controlPointStrokeWidth);
                                                        
   var pointOnCurveRadius = globalCircleRadiusFactor*15.0; 
   var pointOnCurveFillColor = "yellow";
   var pointOnCurveStrokeColor = "black";
   var pointOnCurveStrokeWidth = 5.0;
   var drawDataForPointOnCurve = new CircleDrawData(pointOnCurveFillColor,
                                                    pointOnCurveStrokeColor,
                                                    pointOnCurveStrokeWidth);
                                                        
   var controlPointCircles = new Array();
   
   
   C.drawAllBezierArtifacts(drawDataForBezierCurve,
                            drawDataForControlPolygon,
                            sumOfControlPointAreas,
                            drawDataForControlPoints,
                            pointOnCurveRadius,
                            drawDataForPointOnCurve,
                            drawingContext,
                            controlPointCircles); 
                            
   
      drawingCanvas.addEventListener('mousedown', function(evt) 
         {
            onMouseDown(evt, 
                          C, 
                          sumOfControlPointAreas, 
                          pointOnCurveRadius, 
                          drawingCanvas,
                          controlPointCircles);
         }, false); 
         
      drawingCanvas.addEventListener('mousemove', function(evt) 
         {
            onMouseMove(evt, 
                        C, 
                        drawDataForBezierCurve,
                        drawDataForControlPolygon,
                        sumOfControlPointAreas,
                        drawDataForControlPoints,
                        pointOnCurveRadius,
                        drawDataForPointOnCurve,
                        drawingContext,
                        drawingCanvas,
                        controlPointCircles);
         }, true); 
         
      drawingCanvas.addEventListener('mouseup', function(evt) 
         {
            onMouseUp(evt, 
                      C, 
                      drawDataForBezierCurve,
                      drawDataForControlPolygon,
                      sumOfControlPointAreas,
                      drawDataForControlPoints,
                      pointOnCurveRadius,
                      drawDataForPointOnCurve,
                      drawingContext,
                      drawingCanvas,
                      controlPointCircles);
         }, false);
         
// Begin adding code based on 
// http://stackoverflow.com/questions/5186441/javascript-drag-and-drop-for-touch-devices/6362527#6362527
    drawingCanvas.addEventListener("touchstart", touchHandler, true);
    drawingCanvas.addEventListener("touchmove", touchHandler, true);
    drawingCanvas.addEventListener("touchend", touchHandler, true);
//   End adding code based on 
// http://stackoverflow.com/questions/5186441/javascript-drag-and-drop-for-touch-devices/6362527#6362527        
}




function animation()
{
   var drawingCanvas = document.getElementById('drawingCanvas');
   var drawingContext = drawingCanvas.getContext('2d');
   var width = drawingCanvas.width;
   var height = drawingCanvas.height;
   drawingContext.clearRect(0, 0, width, height);
   var lowerMargin = 0.18;
   var upperMargin = 1.0 - lowerMargin;
   var xDelta = (upperMargin - lowerMargin)/3.0;
   var P0 = new Point(lowerMargin*width, lowerMargin*height)
   var P1 = new Point(P0.x + xDelta*width, upperMargin*height);
   var P2 = new Point(P1.x + xDelta*width, P0.y);
   var P3 = new Point(upperMargin*width, P1.y);
   var C = new cubicBezierCurve(P0, P1, P2, P3);
   
   var curveStrokeColor = "red";
   var curveWidth = 10;
   var drawDataForBezierCurve = new CurveDrawData(curveStrokeColor, curveWidth);
   var lineWidth = 5;
   var polygonStrokeColor = "black";
   var drawDataForControlPolygon = new CurveDrawData(polygonStrokeColor, lineWidth);
   tGlobalUpdate(); // the global value of t is adjusted
   var sumOfControlPointAreas = globalCircleAreaFactor*10000.0;
   var controlPointFillColor = "blue";
   var controlPointStrokeColor = "green";
   var controlPointStrokeWidth = 5.0;
   var drawDataForControlPoints = new CircleDrawData(controlPointFillColor,
                                                     controlPointStrokeColor,
                                                     controlPointStrokeWidth);
                                                     
   var pointOnCurveRadius = globalCircleRadiusFactor*15.0;
   var pointOnCurveFillColor = "yellow";
   var pointOnCurveStrokeColor = "black";
   var pointOnCurveStrokeWidth = 5.0;
   var drawDataForPointOnCurve = new CircleDrawData(pointOnCurveFillColor,
                                                    pointOnCurveStrokeColor,
                                                    pointOnCurveStrokeWidth);
   var controlPointCircles = new Array();
   
 
   C.drawAllBezierArtifacts(drawDataForBezierCurve,
                            drawDataForControlPolygon,
                            sumOfControlPointAreas,
                            drawDataForControlPoints,
                            pointOnCurveRadius,
                            drawDataForPointOnCurve,
                            drawingContext,
                            controlPointCircles);   
   

}

var globalLoop;

function StartAnimatedCanvasTests()
{
   document.getElementById("StartAnimation").disabled = true;
   document.getElementById("StopAnimation").disabled = false;
   
   // Disable all the other buttons while animation is in progress
//    document.getElementById("SayHello").disabled = true;
//    document.getElementById("DoPointTests").disabled = true;
//    document.getElementById("DoBernsteinTests").disabled = true;
//   document.getElementById("DoGraphTests").disabled = true;
   document.getElementById("DoStaticCanvasTests").disabled = true;
   document.getElementById("DoDynamicMouseTests").disabled = true; 
                        
   globalLoop = setInterval(animation, 10);
}

function StopAnimatedCanvasTests()
{
   document.getElementById("StartAnimation").disabled = false;
   document.getElementById("StopAnimation").disabled = true;
   
   // Enable all the other buttons after animation has stopped.
//    document.getElementById("SayHello").disabled = false;
//    document.getElementById("DoPointTests").disabled = false;
//    document.getElementById("DoBernsteinTests").disabled = false;
//   document.getElementById("DoGraphTests").disabled = false;
   document.getElementById("DoStaticCanvasTests").disabled = false;
   document.getElementById("DoDynamicMouseTests").disabled = false;    
   
   clearInterval(globalLoop);
}

function buildGraphOfCubicBernstein(indx, upperLeft, width, height)
{
    var oneThird = 1.0/3.0;
    var twoThirds = 2.0/3.0;
    
    var degree = 3;
    var order = degree + 1;
    
    var Q0 = new Point(0.0, 1.0)
    var Q1 = new Point(oneThird, 1.0);
    var Q2 = new Point(twoThirds, 1.0);
    var Q3 = new Point(1.0, 1.0);
    
    // clumsy but we will do this for now
    if (indx==0) Q0.y = 0.0;
    if (indx==1) Q1.y = 0.0;
    if (indx==2) Q2.y = 0.0;
    if (indx==3) Q3.y = 0.0;
    
    var graphOfCubicBernstein = new cubicBezierCurve(Q0, Q1, Q2, Q3);
    var drawingCanvas = document.getElementById('drawingCanvas');
    var drawingContext = drawingCanvas.getContext('2d');
    
    graphOfCubicBernstein.scale(width, height);
    graphOfCubicBernstein.translate(upperLeft);
    return graphOfCubicBernstein;
}

function DoGraphTests()
{
   var drawingCanvas = document.getElementById('drawingCanvas');
   var drawingContext = drawingCanvas.getContext('2d');
   var width = drawingCanvas.width;
   var height = drawingCanvas.height;
   drawingContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);

   var upperLeft = new Point(0.0, 0.0) // for now
   var colors = new Array("blue", "green", "red", "black");
   var curveWidth = 2;
   for (var indx = 0; indx < 4; indx++)
   {    
      var graphOfCubicBernstein = buildGraphOfCubicBernstein(indx,
                                                            upperLeft,
                                                            width,
                                                            height);
      var drawDataForGraphOfCubicBernstein = new CurveDrawData(colors[indx], curveWidth);                                                     
      graphOfCubicBernstein.drawCurve(drawDataForGraphOfCubicBernstein, drawingContext);                                                     
                                                     
   }
}                                                             

// End Testing Utilities /////////////////////////////////////////////////////////////////


