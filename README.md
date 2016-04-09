# scheduleMaster
In schools and universities, it takes time to sort out which class has which subject or which teacher teaches every class. This is a simple algorithm that can make a time table for sessions in a university.

Grade 9 Project- Pranay Venkatesh (BloodshedThrone), 2015-16.

...

#Highlights
*Main Table <br>
The primary function of the program is creating the main table. The table is a cr x sn array, where cr is the classroom and sn is the session.

*Vector <br>
Each cell in the main table is a 32 bit vector, each bit containing a true or false for availability of a subject for allocation into a particular class's session. So, there can be a maximum of 31 subjects, (the 32nd bit for final check-up as to whether the cell has a subject or not).

*Choices/Splitting <br>
Multiple choices are available for each table. If a table has multiple choices for allocation, then two tables are formed. In one the subject with the most priority (the subjects are sorted with priority) is added and in the second, the available choices are left for consideration. So, if the person involved in scheduling does not like a table, a stack of tables is created for multiple choices.

#Working
![Flowchart](https://raw.github.com/BloodshedThrone/scheduleMaster/master/Untitled.png "Flowchart")



