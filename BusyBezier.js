// The following is from http://www.2ality.com/2012/01/js-inheritance-by-example.html
// I made some changes; for instance, the function that I call "norm" was called "dist"
function Point(x, y) 
{
	this.x = x;
	this.y = y;
}

Point.prototype.norm = function () {
	return Math.sqrt((this.x*this.x)+(this.y*this.y));
};

Point.prototype.toString = function () {
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

Point.prototype.scalarmult = function(s)
{
   var x = s*this.x;
   var y = s*this.y;
   return new Point(x,y);
}

function startParagraph()
{
    document.write("<p>");
}

function endParagraph()
{
    document.write("</p>");
}



function SayHello()
{
	alert("Hello!");
}

function DoPointTests()
{
    startParagraph();
    document.write("Doing Point Tests");
    endParagraph();
    var P = new Point(3,4);
    startParagraph();
    document.write("P = " + P.toString());
    endParagraph();
    startParagraph();
    document.write("P.norm() = " + P.norm());
    endParagraph();
    var Q = new Point(5,12);
    startParagraph();
    document.write("Q = " + Q.toString());
    endParagraph();
    startParagraph();
    document.write("Q.norm() = " + Q.norm());
    endParagraph();  
    var R = P.plus(Q);
    startParagraph();
    document.write("R = P.plus(Q) = " + R); 
    endParagraph();
    var S = R.minus(Q);  
    startParagraph(); 
    document.write("S = R.minus(Q) = " + S); 
    endParagraph()
    var T = P.scalarmult(10);
    startParagraph();
    document.write("T = P.scalarmult(10) = " + T);
    endParagraph();
}


