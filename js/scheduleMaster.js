var numSessions = 35;
var numCRs = 4;							// Total number of classes in the school, in this case, 4
var numSubjects = 7; 					// number of possible subjects, maximum is 31
var numDaySessions = 7;					// number of sessions per day. Can be set to any number.
var currTable;

var classRooms = ["9A","8A","7A","6A","5A","4A","3A","2A","1A"];
var subjects = ["MA","EN","CH","BI","PH","HI","LA"];
var days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

// basic data structures

function Table() {
	this.table = [];                   	// create a field in this object called table
	
	var i, j;
	
	for (i=0; i<numCRs; i++) {			// initialise table with numCRs rows, 
		var temp = [];						// each row having numSessions columns; all cells are 0
		for (j=0; j<numSessions; j++)
			temp.push(0);
		this.table.push(temp);	
	}
	
	this.cell = { sn : 0, cr : 0};		// create a field called cell in this object, 
										// whose two fields sn (for session) 
										// and cr(for classroom) ars set to 0
										
	this.set = function(cr, sn, n) { 	// sets value of a table cell
		if (this.getDone(cr,sn)) return;
		this.table[cr][sn] = n;
	};
	
	this.get = function(cr, sn) {		// gets value of a table cell
		return (this.table[cr][sn] & 0x7FFF);
	};

	this.setDone = function(cr, sn) {	// sets the cell cr,sn to done by setting first bit to 1
		this.table[cr][sn] |= 0x01<<31; //31 right-shifts since there are 31 subjects.
	};
	
	this.getDone = function(cr, sn) {   // checks the first bit of cr,sn for 1
		var n = this.table[cr][sn];
		return (((n >> 31) & 0x01) == 1);  
	};
	
	this.invalid = function() {			// invalid checks if the table has any cell which is 0
		for (i=0; i<numCRs; i++) 
			for (j=0; j<numSessions; j++)
				if (this.table[i][j] == 0) return true;
		return false;
	};
	
	this.done = function() {			// checks if the table is done 
										// all cells have exactly one subject allocated
		for (i=0; i<numCRs; i++) 
			for (j=0; j<numSessions; j++)
				if (!singleChoice(this.get(i,j))) return false;
		return true;
	};
	
	this.choice = function() {			// checks if the current cell has alternatives
		var currCellValue = this.get(this.cell.cr,this.cell.sn);
		return (!singleChoice(currCellValue)) && !(currCellValue == 0);
	};
}

var Stack = {   						// Maintains the stack of Tables
	stack:[],
	
	push: function(el) {
		this.stack.push(el);
	},
	
	pop: function() {
		currTable = this.stack.pop();
	},
	
	empty: function() {
		return this.stack.length == 0;
	}
}

var Allocation = {						// Holds the allocation of teachers to classrooms and subjects
	allocTable: [],
	
	set : function(crs,subjs,teacher,n) {	// function to set the teacher/hours for a cr+subject
		var cr = classRooms.indexOf(crs);
		var subj = subjects.indexOf(subjs);
		this.allocTable[cr][subj].teacher = teacher;
		this.allocTable[cr][subj].hours = n;
	},
	
	init: function() {
		for (var i=0; i<numCRs; i++) {		
			var temp = []; 
			for (var j=0; j<numSubjects; j++) {
				var rec = {};
				rec.teacher = ""; rec.hours = 0;
				temp.push(rec);
			}
			this.allocTable.push(temp);	
		}
	},
	
	subjects : function(teacher) {		// returns all the subjects taught by the teacher
		var n = 0, cum = 0;
		for (var i=0; i<numCRs; i++) {
			n = 0;
			for (var j=numSubjects-1; j>=0; j--) {
				n = n << 1;
				if (this.allocTable[i][j].teacher == teacher) 
					n++;					// Bit is set if teacher is allocated to this subject
			}
			cum |= n;
		}
		return cum;
	},
	
	relevant : function(cr, subject) { 		// checks if the subject is relevant for the cr
		if (this.allocTable[cr][subject].teacher != "") 
				return true;			// Returns true if a teacher is allocated to the subject
		else return false;				// No teacher allocated to the subject => not relevant
	}	
}

// utility functions on bit vectors

function singleChoice(n) {				// checks if a single subject is allocated to the cell
	var bitSet = false;
	for (var i=0; i<numSubjects; i++) 
		if ((n >> i)&0x01 == 1) 		// test if the last bit after shifting right i bits is 1
			if (bitSet) return false;	// two bits are 1 !! 
			else bitSet = true;			// found the first bit which is set
	return bitSet;
}

function pickAChoice(n) {				// picks first choice that is set in n, starting from the right
	for (var i=0; i<numSubjects; i++) 
		if ((n >> i)&0x01 == 1) 		// test if the last bit after shifting right i bits is 1
			return (0x01 << i);			// shift the 1 back to its original place, other places are 0
	return 0;
}

function numChoices(k) {				// finds number of choices at a cell
	var n = 0;
	for (var i=0; i<numSubjects; i++) 
		if ((k >> i)&0x01 == 1) 		// test if the last bit after shifting right i bits is 1
			n++;			 			// increment counter if 1 is found
	return n;
}

function findSubject(n) {				// finds the subject index that is chosen in the cell
	if (!singleChoice(n)) return -1;
	for (var i=0; i<numSubjects; i++) 
		if ((n >> i)&0x01 == 1) 		// test if the last bit after shifting right i bits is 1
			return i;			 		
	return -1;
}

function countSubjectHours(subject,cr) { // counts the number of hours allocated to this cr+subject
	var n = 0;
	for (var i=0; i<numSessions; i++) 
		if (singleChoice(currTable.get(cr,i)))
			if ((currTable.get(cr,i) >> subject)&0x01 == 1) 
				n++;
	return n;		
}

function countSubjectHoursPerDay(subject,cr,day) { // counts hours allocated to this cr+subject per day
	var n = 0;
	for (var i=day*numDaySessions; i<(day+1)*numDaySessions; i++) 
		if (singleChoice(currTable.get(cr,i)))
			if ((currTable.get(cr,i) >> subject)&0x01 == 1) 
				n++;
	return n;		
}

function isTeaching(teacher,cr,sn) {
	for (var i=0; i<numSubjects; i++)
		if ((Allocation.allocTable[cr][i].teacher == teacher) && (findSubject(currTable.get(cr,sn)) == i))
			return true;
	return false;
}

// table functions
// loadAllocationTable and loadInitValues are in a separate input.js file to facilitate data entry

function set(crn,day,period,subject) {
	var cr = classRooms.indexOf(crn);
	var d = days.indexOf(day);
	var sn = d*numDaySessions + period - 1;
	var sj = (0x01) << subjects.indexOf(subject);
	currTable.set(cr,sn,sj);
	currTable.setDone(cr,sn);
}

function init() {						
	currTable = new Table();				// Initialises the current table with initial values
	var n;
	
	Allocation.init();
	loadAllocationTable();
//	alert(JSON.stringify(Allocation.allocTable));
	
	for (i=0; i<numCRs; i++) 			 
		for (j=0; j<numSessions; j++) {
			n = 0;
			for (var k=0; k<numSubjects; k++) {
				n = n << 1; 
				if (Allocation.relevant(i,k)) n++;	// bits set to 1 for all relevant subjects
			}
			currTable.set(i,j,n);
		}
	
	loadInitValues();
}

function clone(table) {					// clone a table
	var nTable = new Table();
	for (i=0; i<numCRs; i++) 
		for (j=0; j<numSessions; j++)
			nTable.set(i,j,table.get(i,j));
	nTable.cell.sn = table.cell.sn;
	nTable.cell.cr = table.cell.cr;
	return nTable;
}

function split() {					// Splits the current table into two tables at the current cell
	var newCurrTable = clone(currTable);
	var choiceTable = clone(currTable);
	var i = currTable.cell.cr, j = currTable.cell.sn;
	var n = currTable.get(i,j);
	var b = pickAChoice(n);
	var nChoices = n & (~b);
	console.log("split:" + n + "->" + b + "," + nChoices);
	newCurrTable.set(i,j,b);
	choiceTable.set(i,j,nChoices); 
	currTable = newCurrTable;			// currTable set to the one with curr cell allocated
	Stack.push(choiceTable);			// remaining choices are stacked in the Stack
}

function random(n) { 
	return Math.floor(Math.random()*n); 
}

function dist(cr,sn) {						// distance of s from current session
	return (sn - currTable.cell.sn)^2 + (cr - currTable.cell.cr)^2;
}

function pick() {						// picks a cell from the table which has least no of choices
	var i, j, min = 33, mini = -1, minj = -1, n = 0;
	var listOfChoices = [];
	for (i=0; i<numCRs; i++) 
		for (j=0; j<numSessions; j++) {
			n = numChoices(currTable.get(i,j));
			if (n==0 || n == 1) continue;
			if (min > n) {				// find the min and the place where min was found
				min = n; mini = i; minj = j; 
			} 
/*			else if (min == n && dist(i,j) > dist(mini,minj)) { // look for something farthest away 
				mini = i; minj = j;
			}  */
		}
	for (i=0; i<numCRs; i++) 
		for (j=0; j<numSessions; j++) {
			n = numChoices(currTable.get(i,j));
			if (n==0 || n == 1) continue;
			if (min == n) 			// accumulate the min locations in a list
				listOfChoices.push([i,j]);	
		}
	var r = random(listOfChoices.length);

	mini = listOfChoices[r][0];
	minj = listOfChoices[r][1]; 
	
	currTable.cell.cr = mini;
	currTable.cell.sn = minj;
	console.log("Pick:" + mini + "," + minj + ":" + min + "choices");
}

// pruning 

function prune(cr,sn) {						// prunes the table entries based on a set of constraints
	if (currTable.getDone(cr,sn)) return;
	currTable.setDone(cr,sn);
	teacherConstraint(cr,sn);				// apply the teacher constraints
	teacherTooManyClassesConstraint(cr,sn); 	// if teacher has been teaching continuously for some time
	subjectDoneConstraint(cr,sn); 			// check if the number of hours/week of the subject is done
//	sameSubjectRepeatConstraint(cr,sn); 		// Same subject can't repeat more than twice per day
	sameSubjectDistributedConstraint(cr,sn); 
										// Same subject can't repeat in neighbouring days ("6A"h/wk subjects)
}

function teacherConstraint(cr,sn) {  		// teacher can be allocated to only one classroom per session
	var subject = findSubject(currTable.get(cr,sn)); // get the single subject allocated to cell 
	var teacher = Allocation.allocTable[cr][subject].teacher;  
										// find teacher associated with this class/subject

	var tSubjects = Allocation.subjects(teacher);
										// tSubjects will hold the subjects taught by this teacher 
	
	for (var i=0; i<numCRs; i++) {		// remove any subject allocated to this teacher from the session
		if (i == cr) continue; 			// don't do anything if it is the current classroom
		currTable.set(i,sn,currTable.get(i,sn) & (~tSubjects));	// remove tSubjects from the cell
		if (singleChoice(currTable.get(i,sn))) prune(i,sn); // prune from cell <i,sn>
	}
}

function teacherTooManyClassesConstraint(cr,sn) { // if teacher has been teaching for too long
	var subject = findSubject(currTable.get(cr,sn)); // get the single subject allocated to cell 
	var teacher = Allocation.allocTable[cr][subject].teacher;  
										// find teacher associated with this class/subject
	
	var tSubjects = Allocation.subjects(teacher); // find subjects taught by the teacher for this cr
	var snday = sn%numDaySessions;
	if (snday >= 2 && snday < numDaySessions-1) 	// there is one session after current one in the day 
		if (isTeaching(teacher,cr,sn-1) && isTeaching(teacher,cr,sn-2)) { 
													// teacher is doing 3 classes in a row
			currTable.set(cr,sn+1,currTable.get(cr,sn+1) & (~tSubjects)); 
													// remove these subjects from next session
			if (singleChoice(currTable.get(cr,sn+1))) prune(cr,sn+1);										
		}
}

function subjectDoneConstraint(cr,sn) {			// Check num of hours/week of subject are completed
	var subject = findSubject(currTable.get(cr,sn)); // get the single subject allocated to cell 
	var hours = Allocation.allocTable[cr][subject].hours;  // find the max hours per week for the subject
	
	if (countSubjectHours(subject,cr) == hours) 
		for (var i=0; i<numSessions; i++) 
			if (!singleChoice(currTable.get(cr,i))) {
				currTable.set(cr,i,currTable.get(cr,i) & (~(0x01 << subject))); 
													// remove the subject from the row
				if (singleChoice(currTable.get(cr,i))) prune(cr,i);
			}
}

function sameSubjectRepeatConstraint(cr,sn) {	// Same subject cant repeat for two classes together
	var subject = findSubject(currTable.get(cr,sn)); // get the single subject allocated to cell 	
	var snday = sn%numDaySessions;
	if (snday < numDaySessions-1) {				// there is one session after current one in the day 
		currTable.set(cr,sn+1,currTable.get(cr,sn+1) & (~(0x01 << subject))); 
												// remove the subject from next session
		if (singleChoice(currTable.get(cr,sn+1))) prune(cr,sn+1);									
	}
}

function sameSubjectDistributedConstraint(cr,sn) { // Same subject should be spread across days of week
	var subject = findSubject(currTable.get(cr,sn)); // get the single subject allocated to cell 
	var hours = Allocation.allocTable[cr][subject].hours;  // find the max hours per week for the subject

	var hoursPerDay = Math.floor(hours/5) + 1;
	var snday = Math.floor(sn/numDaySessions);
	
	if (countSubjectHoursPerDay(subject,cr,snday) == hoursPerDay) 
		for (var i=snday*numDaySessions; i<(snday+1)*numDaySessions; i++) {	
			if (!singleChoice(currTable.get(cr,i))) {
										// remove the subject from the day
				currTable.set(cr,i,currTable.get(cr,i) & (~(0x01 << subject))); 
				if (singleChoice(currTable.get(cr,i))) prune(cr,i);
			}										
		}	
}

// finally, the search algorithm

function success() {
	displayMasterTable();
}

function fail() {
	alert("Fail");
	alert(JSON.stringify(currTable));
}

function search() {
	while (true) {
		if (currTable.invalid()) 
			if (Stack.empty()) { fail(); return; }
			else Stack.pop();
		else if (currTable.done()) { success(); return; }
		else pick();
		if (currTable.choice()) split();
		prune(currTable.cell.cr,currTable.cell.sn);
	}
}

function searchAgain() {
	if (Stack.empty()) { fail(); return; }
	Stack.pop();
	search();
}

init();
search();

// Pretty printing functions

function displayMasterTable() {
	var str = "<table border='2' width='50%'>\n";
	var i,j;
	
	str += "<tr><th></th>";
	for (j=0; j < (numSessions/numDaySessions); j++) 			// print the day 
		str += '<th colspan="' + numDaySessions + '">' + days[j] + "</th>\n";
	str += "</tr>\n";
	
	str += "<tr><th></th>\n";
	for (j=0; j < numSessions; j++) 			// print the session no for the day 
		str += "<th>" + (j%numDaySessions + 1) + "</th>\n";
	str += "</tr>\n";
	
	for (i=0; i<numCRs; i++) {
		str += "<tr>\n";
		str += "<td>" + classRooms[i] + "</td>\n";
		for (j=0; j < numSessions; j++) {
			str += "<td>\n";
			str += subjects[findSubject(currTable.get(i,j))];
			str += "</td>\n";
		}
		str += "</tr>\n";
	}
	str += "</table>\n";
	document.getElementById("masterTable").innerHTML = str;
}

function printClassTimeTables() {
	var str = "";
	var name = "";
	for (var cr=0; cr<numCRs; cr++) {
		str = "";
		name = classRooms[cr];
		str += "<html>\n<head>\n";
		str += '<link rel="stylesheet" href="eventsTT.css" type="text/css" media="all">\n';
		str += "<title>Time Table for class " + name + "</title>\n";
		str += "</head>\n";
		str += "<body>\n";
		str += '<script src="events.js"></' + 'script>\n';
		str += '<div id="events">List of Events</div>\n';
		str += '<script>\n';
		str += 'var str = "<h2>List of Events</h2>";\n';
		str += 'for (var i=0; i<eventList.length; i++) {\n';
		str += '	if (eventList[i][3] == "' + name + '") \n';
		str += '		str += "<p>" + eventList[i][1] + ":" + eventList[i][0] + "</p>";\n';	
		str += '}\n';
		str += 'document.getElementById("events").innerHTML = str;\n';
		str += '</' + 'script>\n';
		str += '<div id="section">\n';
		
		str += "<h2>Time Table for class " + name + "</h2>\n";		
		str += '<table border="2" width="50%">\n';				// create a table
		str += "<tr>\n<th></th>\n";		// leave a blank cell
		for (var i=0; i<numDaySessions; i++) {
			str += "<th>" + (i+1) + "</th>\n";	// printing the header as periods
		}

		for (var sn=0; sn<numSessions; sn++) {
			if (sn%numDaySessions == 0) str += "</tr>\n<tr>\n<th>" + days[sn/numDaySessions] + "</th>\n";
			var n = currTable.get(cr, sn);
			str += '<td align="center">' + subjects[findSubject(n)] + "</td>\n"; 
		}
		str += "</tr>\n";
		str += "</table>\n";
		str += '</div>\n';
		str += "</body>\n</html>\n";
		writeToFile(str,name);	
	}
}

function findAllTeachers() {
	var teachers = [];
	var t = "";
	for (var cr=0; cr<numCRs; cr++)
		for (var s=0; s<numSubjects; s++) {
			t = Allocation.allocTable[cr][s].teacher;
			if ((teachers.length == 0) || (teachers.indexOf(t) == -1)) 
				teachers.push(t);
		}
	return teachers;
}

function findAlloc(teacher,sn) {
	var alloc = "Free";
	for (var cr=0; cr<numCRs; cr++) 
		if (isTeaching(teacher,cr,sn)) 
			alloc = classRooms[cr] + "/" + subjects[findSubject(currTable.get(cr,sn))];
	return alloc;
}

function printTeacherTimeTables() {
	var str = "";
	var name = "";
	teachers = findAllTeachers();

	for (var i=0; i<teachers.length; i++) {
		str = "";
		name = teachers[i];
		
		str += "<html>\n<head>\n";
		str += '<link rel="stylesheet" href="eventsTT.css" type="text/css" media="all">\n';
		str += "<title>Time Table for " + name + "</title>\n";
		str += "</head>\n";
		str += "<body>\n";
		str += '<script src="events.js"></' + 'script>\n';
		str += '<div id="events">List of Events</div>\n';
		str += '<script>\n';
		str += 'var str = "<h2>List of Events</h2>";\n';
		str += 'for (var i=0; i<eventList.length; i++) {\n';
		str += '	if (eventList[i][2] == "' + name + '") \n';
		str += '		str += "<p>" + eventList[i][1] + ":" + eventList[i][0] + "</p>";\n';	
		str += '}\n';

		str += 'document.getElementById("events").innerHTML = str;\n';
		str += '</' + 'script>\n';
		str += '<div id="section">\n';
		
		str += "<h2>Time Table for " + name + "</h2>\n";
		str += '<table border="2" width="50%">\n';				// create a table
		str += "<tr>\n<th></th>\n";		// leave a blank cell
		for (var sdn=0; sdn<numDaySessions; sdn++) {
			str += "<th>" + (sdn+1) + "</th>\n";	// printing the header as periods
		}

		for (var sn=0; sn<numSessions; sn++) {
			if (sn%numDaySessions == 0) str += "</tr>\n<tr>\n<th>" + days[sn/numDaySessions] + "</th>\n";
			str += '<td align="center">';
			str += findAlloc(name,sn);
			str += "</td>\n";
		}
		str += "</tr>\n";
		str += "</table>\n";
		str += '</div>\n';
		str += "</body>\n</html>\n";
		writeToFile(str,name);	
	}
}

function prettyPrint() {			// Print the class time tables and the teacher time tables as 
									// individual html files called className.html and teacherName.html
	printClassTimeTables();
	printTeacherTimeTables();
}

// File writing functions
function writeUTFBytes(view, offset, string) { 
	var lng = string.length;
	for (var i = 0; i < lng; i++) view.setUint8(offset + i, string.charCodeAt(i));
}

function writeToFile(str,name) {
	var workSpaceBuffer = new ArrayBuffer(str.length);  
	var	view = new DataView(workSpaceBuffer); 
	writeUTFBytes(view,0,str);
	var	blob = new Blob ( [ view ], { type : 'text/html' } );    
	var url = (window.URL || window.webkitURL).createObjectURL(blob);
	var	link = window.document.createElement('a');	document.body.appendChild(link);
	link.setAttribute('href',url); link.setAttribute('download',name + ".html");
	link.click();  document.body.removeChild(link);
}