// The following is from http://www.2ality.com/2012/01/js-inheritance-by-example.html
// I made some changes; for instance, the function that I call "norm" was called "dist"

// We are also going to refer to my Python code in
// /Users/richardfuhr/Documents/Sandbox/pythonLearn/BezierCurves/standalone

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
      for (i = 0; i < n-1; i++)
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

cubicBezierCurve.prototype.drawCurve = function(strokeColor, curveWidth, context)
{
   context.beginPath();
   context.strokeStyle = strokeColor;
   P = this.CtrlPts;
   context.moveTo(P[0].x, P[0].y);
   context.bezierCurveTo(P[1].x, P[1].y, P[2].x, P[2].y, P[3].x, P[3].y);
   context.lineWidth = curveWidth;
   context.stroke();
}

cubicBezierCurve.prototype.drawControlPolygon = function(strokeColor, lineWidth, context)
{
   context.beginPath();
   context.strokeStyle = strokeColor;
   P = this.CtrlPts;
   context.moveTo(P[0].x, P[0].y);
   context.lineTo(P[1].x, P[1].y);
   context.lineTo(P[2].x, P[2].y);
   context.lineTo(P[3].x, P[3].y);
   context.lineWidth = lineWidth;
   context.stroke();
}

Point.prototype.drawCircleHere = function(radius, fillColor, strokeColor, context)
{
   context.beginPath();
   context.fillStyle = fillColor;
   context.strokeStyle = strokeColor;
   anticlockwise = true; // It doesn't really matter for a full circle
   context.arc(this.x, this.y, radius, 0, Math.PI*2, anticlockwise);
   context.fill();
   context.stroke();
}

// This one is somewhat redundant given the one above
Circle.prototype.draw = function(fillColor, strokeColor, context)
{
   var center = this.center;
   var radius = this.radius;
   center.drawCircleHere(radius, fillColor, strokeColor, context);
}

cubicBezierCurve.prototype.drawControlPoints = function(radius, fillColor, strokeColor, context)
{
   var controlPoints = this.CtrlPts;
   var n = controlPoints.length;
   for (var i = 0; i < n; i++)
   {
      controlPoints[i].drawCircleHere(radius, fillColor, strokeColor, context);
   }
}

cubicBezierCurve.prototype.drawControlPointsWeightedForParm = function(t, sumOfAreas, fillColor, strokeColor, context)
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
      controlPoints[i].drawCircleHere(actualRadius, fillColor, strokeColor, context);
   }

}

cubicBezierCurve.prototype.drawPointOnCurveForParm = function(t, 
                                                              radius, 
                                                              fillColor, 
                                                              strokeColor, 
                                                              context)
{
   var P = this.positionAtParm(t);
   P.drawCircleHere(radius, fillColor, strokeColor, context);
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
      if (indx < 3)
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
      graphOfCubicBernstein.drawCurve(graphStrokeColor, graphWidth, context); 
      
      var pointOnGraphRadius = 3.0;
      var pointOnGraphFillColor = "black"
      var pointOnGraphStrokeColor = "black"
      graphOfCubicBernstein.drawPointOnCurveForParm(t,
                                                    pointOnGraphRadius,
                                                    pointOnGraphFillColor,
                                                    pointOnGraphStrokeColor,
                                                    context);
                                                    
      graphOfCubicBernstein.drawVerticalLineFromCurveForParm(t,
                                                             "black",
                                                             graphWidth,
                                                             context);
                                                                                                                                                               
                                                     
   }   
   
}
                                             

cubicBezierCurve.prototype.drawAllBezierArtifacts = function(curveStrokeColor,
                                                             curveWidth,
                                                             lineWidth,
                                                             polygonStrokeColor,
                                                             t,
                                                             sumOfControlPointAreas,
                                                             controlPointFillColor,
                                                             controlPointStrokeColor,
                                                             pointOnCurveRadius,
                                                             pointOnCurveFillColor,
                                                             pointOnCurveStrokeColor,
                                                             context)
{
   this.drawCurve(curveStrokeColor, curveWidth, context);
   this.drawControlPolygon(polygonStrokeColor, lineWidth, context);
   this.drawControlPointsWeightedForParm(t, 
                                         sumOfControlPointAreas, 
                                         controlPointFillColor, 
                                         controlPointStrokeColor, 
                                         context);
   this.drawPointOnCurveForParm(t,
                                pointOnCurveRadius,
                                pointOnCurveFillColor,
                                pointOnCurveStrokeColor,
                                context); 

// temporarily hard-code some of the input parameters
   var graphStrokeColor = "green";
   var graphWidth = 2;
   this.drawBasisFunctionsWithParm(t, 
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
   var lowerMargin = 0.1;
   var upperMargin = 1.0 - lowerMargin;
   var xDelta = (upperMargin - lowerMargin)/3.0;
   var P0 = new Point(lowerMargin*width, lowerMargin*height)
   var P1 = new Point(P0.x + xDelta*width, upperMargin*height);
   var P2 = new Point(P1.x + xDelta*width, P0.y);
   var P3 = new Point(upperMargin*width, P1.y);
   var C = new cubicBezierCurve(P0, P1, P2, P3);

   var curveStrokeColor = "red";
   var curveWidth = 10;
   var lineWidth = 5;
   var polygonStrokeColor = "black";
   var t = 1.0 - 2.0/(1.0 + Math.sqrt(5.0)); // 1 - reciprocal of golden ratio
   var sumOfControlPointAreas = 10000.0; // may want to make it f(width, height)
   var controlPointFillColor = "blue";
   var controlPointStrokeColor = "green";
   var pointOnCurveRadius = 15.0; // may want to make it f(width, height)
   var pointOnCurveFillColor = "yellow";
   var pointOnCurveStrokeColor = "black";
   
   C.drawAllBezierArtifacts(curveStrokeColor,
                            curveWidth,
                            lineWidth,
                            polygonStrokeColor,
                            t,
                            sumOfControlPointAreas,
                            controlPointFillColor,
                            controlPointStrokeColor,
                            pointOnCurveRadius,
                            pointOnCurveFillColor,
                            pointOnCurveStrokeColor,
                            drawingContext);   

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

function getMousePos(canvas, evt) 
{
	var rect = canvas.getBoundingClientRect();
	var x = evt.clientX - rect.left;
	var y = evt.clientY - rect.top;
	var mousePos = new Point(x,y);
	return mousePos;
}

function DoStaticMouseTests()
{
   var drawingCanvas = document.getElementById('drawingCanvas');
   var drawingContext = drawingCanvas.getContext('2d');
   var width = drawingCanvas.width;
   var height = drawingCanvas.height;
   var lowerMargin = 0.1;
   var upperMargin = 1.0 - lowerMargin;
   var xDelta = (upperMargin - lowerMargin)/3.0;
   var P0 = new Point(lowerMargin*width, lowerMargin*height)
   var P1 = new Point(P0.x + xDelta*width, upperMargin*height);
   var P2 = new Point(P1.x + xDelta*width, P0.y);
   var P3 = new Point(upperMargin*width, P1.y);
   var C = new cubicBezierCurve(P0, P1, P2, P3);

   var curveStrokeColor = "red";
   var curveWidth = 10;
   var lineWidth = 5;
   var polygonStrokeColor = "black";
   var t = 1.0 - 2.0/(1.0 + Math.sqrt(5.0)); // 1 - reciprocal of golden ratio
   var sumOfControlPointAreas = 10000.0; // may want to make it f(width, height)
   var controlPointFillColor = "blue";
   var controlPointStrokeColor = "green";
   var pointOnCurveRadius = 15.0; // may want to make it f(width, height)
   var pointOnCurveFillColor = "yellow";
   var pointOnCurveStrokeColor = "black";
   
   C.drawAllBezierArtifacts(curveStrokeColor,
                            curveWidth,
                            lineWidth,
                            polygonStrokeColor,
                            t,
                            sumOfControlPointAreas,
                            controlPointFillColor,
                            controlPointStrokeColor,
                            pointOnCurveRadius,
                            pointOnCurveFillColor,
                            pointOnCurveStrokeColor,
                            drawingContext); 
                            
//       drawingCanvas.addEventListener('mousemove', function(evt) {
//         var mousePos = getMousePos(drawingCanvas, evt);
//         var message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;
//         writeMessage(drawingCanvas, message);
//       }, false); 
   
      drawingCanvas.addEventListener('mousedown', function(evt) {
         var mousePos = getMousePos(drawingCanvas, evt)
         var message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;
         alert(message);
         }, false);                             

}


tGlobal = 0.0; // global
tDeltaGlobal = 0.001;

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

function animation()
{
   var drawingCanvas = document.getElementById('drawingCanvas');
   var drawingContext = drawingCanvas.getContext('2d');
   var width = drawingCanvas.width;
   var height = drawingCanvas.height;
   drawingContext.clearRect(0, 0, width, height);
   var lowerMargin = 0.1;
   var upperMargin = 1.0 - lowerMargin;
   var xDelta = (upperMargin - lowerMargin)/3.0;
   var P0 = new Point(lowerMargin*width, lowerMargin*height)
   var P1 = new Point(P0.x + xDelta*width, upperMargin*height);
   var P2 = new Point(P1.x + xDelta*width, P0.y);
   var P3 = new Point(upperMargin*width, P1.y);
   var C = new cubicBezierCurve(P0, P1, P2, P3);
   
   var curveStrokeColor = "red";
   var curveWidth = 10;
   var lineWidth = 5;
   var polygonStrokeColor = "black";
   tGlobalUpdate(); // the global value of t is adjusted
   var sumOfControlPointAreas = 10000.0; // may want to make it f(width, height)
   var controlPointFillColor = "blue";
   var controlPointStrokeColor = "green";
   var pointOnCurveRadius = 15.0; // may want to make it f(width, height)
   var pointOnCurveFillColor = "yellow";
   var pointOnCurveStrokeColor = "black";
   
   C.drawAllBezierArtifacts(curveStrokeColor,
                            curveWidth,
                            lineWidth,
                            polygonStrokeColor,
                            tGlobal,
                            sumOfControlPointAreas,
                            controlPointFillColor,
                            controlPointStrokeColor,
                            pointOnCurveRadius,
                            pointOnCurveFillColor,
                            pointOnCurveStrokeColor,
                            drawingContext);   
   

}

function DoAnimatedCanvasTests()
{
    
   // All the work is done inside of the animation function.
   // We can probably do some refactoring and perhaps make some things global. 
  
                        
    var loop = setInterval(animation, 10);                        
      
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

   var upperLeft = new Point(0.0, 0.0) // for now
   var colors = new Array("blue", "green", "red", "black");
   var curveWidth = 2;
   for (var indx = 0; indx < 4; indx++)
   {    
      var graphOfCubicBernstein = buildGraphOfCubicBernstein(indx,
                                                            upperLeft,
                                                            width,
                                                            height);
      graphOfCubicBernstein.drawCurve(colors[indx], curveWidth, drawingContext);                                                     
                                                     
   }
}                                                             

// End Testing Utilities /////////////////////////////////////////////////////////////////


