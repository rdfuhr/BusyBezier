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
    P = new Point(3,4);
    startParagraph();
    document.write("P = " + P.toString());
    endParagraph();
    startParagraph();
    document.write("P.norm() = " + P.norm());
    endParagraph();    
}


