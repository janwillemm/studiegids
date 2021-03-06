var COURSELABELS = {
	contacturen : "contacturen",
	onderwijsVorm : "onderwijsvorm",
	toetsing : "wijze van toetsen",
	beoordeling : "beoordeling",
	onderwijsPeriode : "onderwijsPeriode",
	startOnderwijs : "startOnderwijs",
	tentamenPeriode : "tentamenPeriode",
	cursusTaal : "cursusTaal",
}

var LANGUAGE = {
	DUTCH : "Nederlands",
	ENG : "Engels"
}

var extraCourseLabels = {
	contacturen : {
		nl : "Contacturen / week  x/x/x/x",
		en : "Contact Hours / Week  x/x/x/x"
	},
	onderwijsVorm : {
		nl : "Onderwijsvorm",
		en : "Education Method"
	},
	toetsing : {
		nl : "Wijze van toetsen",
		en : "Assessment",
	},
	beoordeling : {
		nl : "Beoordeling",
		en : "Judgement"
	},
	onderwijsPeriode : {
		nl : "Onderwijsperiode",
		en : "Education Period"
	},
	startOnderwijs : {
		nl : "Start onderwijs",
		en : "Start Education"
	},
	tentamenPeriode : {
		nl : "Tentamenperiode",
		en : "Exam Period"	
	},
	cursusTaal : {
		nl : "Cursustaal",
		en : "Course Language"
	}
}

var extraCourseLabelsTeacher = {
	hoofdDocent : {
		nl : "Verantwoordelijk Docent",
		en : "Responsible Instructor"
	},
	docent : {
		nl : ["Docent", ],
		en : "Instructor"
	}
}

function Course() {
	this.id;
	this.code;
	this.name;
	this.programs = [];
	this.ects;

	this.courseInformation;

	this.equals = function(other){
		return this.name == other.code;
	}

	this.addProgram = function(program){
		this.programs.push(program);
	}

	this.addRawData = function(rawData){
		// Some courses have NO information!
		if(rawData){
			if(rawData.vak.extraUnsupportedInfo){
				this.courseInformation = new CourseInformation(rawData);
			}
		}
		//Logger.debug(this.createCSVRow());
		//this.courseInformation.printExtraCourseData("nl", $("body"));
	}


	this.getTeacherInfo = function(label){
		if(Array.isArray(label)){
			var teachers = "";
			for(var idx = 0; idx < label.length; idx++){
				if(idx > 0){
					teachers += ",";
				}
				teachers += this.courseInformation.findLabelInTeachers(label[idx]);
			}
			return teachers;
		}
		else {
			return this.courseInformation.findLabelInTeachers(label);
		}
		
	}

	this.getLabelInfo = function(label){
		return this.courseInformation.findLabelInInfoFields(label);
	}
}

function CourseInformation(rawData){

	this.rawData = rawData;

	this.courseLabels = {
		vakCode 	: "kortenaamNL",
		naamNL		: "langeNaamNL",
		naamEN		: "langeNaamEN",
		ects		: "ects",
		verrekening	: "opleiding.faculteit.organisatieOnderdeel.organisatieEenheidCode", // Does this work?
	}

	// Extra informatie
	// this.extraCourseLabels = {}
	// this.extraCourseLabels[COURSELABELS.contacturen] = {}
	// this.extraCourseLabels[COURSELABELS.contacturen][LANGUAGE.nl] = "Contacturen / week x/x/x/x";
	// this.extraCourseLabels[COURSELABELS.contacturen][LANGUAGE.en] = "Contact Hours / Week x/x/x/x";

	this.printExtraCourseData = function(language, elementToAppend){
		for(var index in extraCourseLabels) { 
			var label = extraCourseLabels[index][language];

			elementToAppend.append("<strong>" + label + " </strong> " + this.findLabelInInfoFields(label) + "</br>");
		}
	}

	this.findLabelInTeachers = function(label){
		var informationFields = this.rawData.vak.extraUnsupportedInfo.vakMedewerkers;

		
		for(var index in informationFields) { 
			var informationField = informationFields[index];
			
			if(informationField["@label"] == label){
				var teachers = "";
				if(Array.isArray(informationField.medewerker)){
					for(index in informationField.medewerker){
						teachers += ", " + informationField.medewerker[index].naam;
					}
				}
				else {
					teachers = informationField.medewerker.naam;
				}
				return teachers;
			}
		}
	}

	this.findLabelInInfoFields = function(label){
		var informationFields = this.rawData.vak.extraUnsupportedInfo.vakUnsupportedInfoVelden;

		for(var index in informationFields) { 
			var informationField = informationFields[index];
			
			if(informationField["@label"] == label){
				return informationField.inhoud;
			}
		}
	}
}


function Program(){
	this.id;
	this.name;
	this.courses = [];

	this.equals = function(other){
		return this.name == other.name;
	}

	this.addCourse = function(course){
		this.courses.push(course);
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
	this.courses = {};
	this.numCourses = 0;
	this.programs = {};
	this.numPrograms = 0;
	this.errorCourses = [];

	this.addCourse = function(course, program){
		if(!this.courses[course.code]){
			this.courses[course.code] = course;
			studiegids.fetchDetailedCourse(course);
			this.numCourses++;	
		}
		this.courses[course.code].addProgram(program);
		this.addProgram(program).addCourse(course);
	}

	this.addErrorCourse = function(course){
		this.errorCourses.push(course);
	}

	this.addProgram = function(program){
		var curProgram = this.programs[program.name];
		console.log(curProgram);
		if(!curProgram){
			console.log(curProgram);
			this.programs[program.name] = program;
			curProgram = this.programs[program.name];
			this.numPrograms++;
		}

		return curProgram;
	}

}