function loadAllocationTable() {

	//The input values go in the order : CLASS, SUBJECT, TEACHER, NUMBER OF SESSIONS (weekly)
	Allocation.set("9A","MA","name1",7); // 9 Maths
	Allocation.set("7A","MA","name1",7); // 7 Maths
	Allocation.set("8A","MA","name1",7); // 8 Maths
	Allocation.set("6A","MA","name1",7); // 6 Maths
	Allocation.set("9A","EN","name2",7); // 9 English
	Allocation.set("7A","EN","name2",6); // 7 English
	Allocation.set("8A","EN","name2",6); // 8 English
	Allocation.set("6A","EN","name2",6); // 6 English
	Allocation.set("9A","HI","name3",6); // 9 SS
	Allocation.set("7A","HI","name3",6); // 7 SS
	Allocation.set("8A","HI","name3",6); // 8 SS
	Allocation.set("6A","HI","name3",6); // 6 SS
	Allocation.set("9A","PH","name4",4); // 9 Physics
	Allocation.set("7A","PH","name4",3); // 7 Physics
	Allocation.set("8A","PH","name4",3); // 8 Physics
	Allocation.set("6A","PH","name4",3); // 6 Physics
	Allocation.set("9A","CH","name5",4); // 9 Chemistry
	Allocation.set("7A","CH","name5",3); // 7 Chemistry
	Allocation.set("8A","CH","name5",3); // 8 Chemistry
	Allocation.set("6A","CH","name5",3); // 6 Chemistry
	Allocation.set("9A","BI","name6",4); // 9 Biology
	Allocation.set("7A","BI","name6",3); // 7 Biology
	Allocation.set("8A","BI","name6",3); // 8 Biology
	Allocation.set("6A","BI","name6",3); // 6 Biology
	Allocation.set("9A","LA","name7",3); // 9 Sanskrit
	Allocation.set("7A","LA","name7",7); // 7 Sanskrit
	Allocation.set("8A","LA","name7",7); // 8 Sanskrit
	Allocation.set("6A","LA","name7",7); // 6 Sanskrit
}

//initial values
function loadInitValues() {
	set("9A","Monday",1,"MA");
	set("8A","Tuesday",1,"MA");
	set("7A","Wednesday",1,"MA");
	set("6A","Thursday",1,"MA");
}
