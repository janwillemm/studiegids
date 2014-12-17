function Course() {
	this.id;
	this.code;
	this.name;

	this.equals = function(other){
		return this.name == other.name;
	}
}

function Program(){
	this.id;
	this.name;

	this.equals = function(other){
		return this.name == other.name;
	}
}

function Program_Course(){
	this.program;
	this.course;

	this.equals = function(other){
		return (other.program.equals(this.program) && other.course.equals(this.course))
	}
}


function CourseData(){
	this.courses = [];
	this.programs = [];
	this.program_courses = [];

	this.addCourse = function(course, program){
		this.courses[course.kortenaamNL] = course;
		
		var program_course = new Program_Course();
		program_course.program = program;
		program_course.course = course;
		
		this.program_courses.push(program_course);
		// TODO: add program to course and vice versa?
	}

	this.addProgram = function(program){
		this.programs[program.name] = program;
	}

}