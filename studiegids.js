// Enum for faculties. 
// Can be found at https:/api.tudelft.nl/v0/faculteiten
// or http://apidoc.tudelft.nl/categories/tu-delft-organisation/faculties/

var FACULTY = Object.freeze({
	EWI: "EWI"
});

// Enum for studyyears.
// Can be found at  https://api.tudelft.nl/v0/studiejaren
// Or http://apidoc.tudelft.nl/categories/educational-resources/study-years/

var YEAR = Object.freeze({
	"2014" : "11",
});

var OPLEIDING = Object.freeze({
	MSC_ES : 76,
	MSC_AM : 13,
	BSC_TI : 12,
	MSC_CS : 15,
	BSC_TW : 28,
	BSC_EE : 11,
	MSC_CE : 14,
	MSC_EE : 16,
	MSC_MKE :17,
	HBO_SCHAKEL: 79,
	MINORS_EWI:103,
})



var studiegids = {

	faculty 	: FACULTY.EWI, 	//Default 
	year 		: YEAR["2014"], 	//Default
	baseUrl		: "https://api.tudelft.nl/v0/opleidingen/",
	debug		: true,
	rawData		: {},
	opleiding   : OPLEIDING.BSC_TI,
	courseData 	: new CourseData(),

	fetch: function(callback){
		var url = this.baseUrl + this.faculty + "?studiejaarid=" + this.year; 
		var $this = this;
		$.ajax({
			dataType: "jsonp",
			url: url,
			error: function(jqXHR, textStatus, errorThrown){console.log("Error for url:" + url); console.log(textStatus + "\r\n" + errorThrown)},
			success: function(data){ $this.rawData = data;}
		});		
	},

	useData: function(data){
		this.rawData = data;
	},

	parse: function(){
		this.parseOpleidingen();
	},

	parseOpleidingen : function(){
		var opleidingen = this.rawData.getOpleidingenByFacultyAndYearResponse.opleiding;

		for(var i = 0; i < opleidingen.length; i++){
			this.parseOpleiding(opleidingen[i]);
		}
		//getCourses(courses);
	},

	parseOpleiding : function(opleiding){
			if(opleiding.studieprogrammaboom){
				if(parseInt(opleiding.id) == this.opleiding ){
					console.log("Starting to parse:" + opleiding.id + ": " + opleiding.naamNL);
					depth = 0;
					this.parseStudieProgrammas(opleiding.studieprogrammaboom.studieprogramma, opleiding.code, depth);
				}
			}		
	},

	// We should first parse the studieprograms
	// It can be an array or just a single object, so a difference is made
	parseStudieProgrammas : function(studieprogrammas, opleidingnaam, depth){
		if(!Array.isArray(studieprogrammas)){
			this.parseStudieProgramma(studieprogrammas, opleidingnaam, depth);
		}
		else {
			for (var i = 0; i < studieprogrammas.length; i++){
				var studieprogramma = studieprogrammas[i];
				this.parseStudieProgramma(studieprogramma, name, depth);
			}
		}
	},
	// Each studieprogramma can have courses AND 
	// can have more embedded studieprogrammas
	// So we should take care of both situations
	parseStudieProgramma : function(studieprogramma, name, depth){
		if(depth < 2)
			name = name + " " + studieprogramma.programmacode;
		console.log("Starting to parse:     programm: " + name);

		// Als het studieprogramma vakken heeft, voeg deze vakken toe aan het programma
		if(studieprogramma.vak){
			// Maak het programma aan.
			var program = new Program();
			program.name = name;
			this.courseData.addProgram(program);
			
			this.parseVakken(studieprogramma.vak, program);
		}
		// If there is a nested studieprogrammaboom
		// Parse it!
		if(studieprogramma.studieprogrammaboom){
			this.parseStudieProgrammas(studieprogramma.studieprogrammaboom.studieprogramma, name, depth+1); // Er kunnen studieprogrammas in studieprogramma's zitten :')
		}
	},

	// TODO: if needed, add support for one course! 
	parseVakken : function(vakken, program){
		for (var j = 0; j < vakken.length; j++){
			var vak = vakken[j];
			this.parseVak(vak, program)
		}
	},

	parseVak : function(vak, program){
		console.log("Starting to parse:          course: " + vak.kortenaamNL);

		var course = new Course();
		course.code = vak.kortenaamNL;
		course.name = vak.langenaamEN;
		this.courseData.addCourse(course, program);

	},


}


/* 
	Some helpers
*/





// // Nu gaan we alle vakken ophalen!

// function getCourses(courses){
// 	for(var i = 0; i < courses.length; i++){
// 		course = courses[i];
// 		fetchCourse(course.code);
// 	}
// }

// function fetchCourse(courseID){
// 	$.ajax({
// 	  dataType: "jsonp",
// 	  url: "https://api.tudelft.nl/v0/vakken/"+courseID+"?studiejaarid=11",
// 	  success: parseCourse
// 	});

// }

// function parseCourse(data){
// 	console.log(data);
// 	var velden = data.vak.extraUnsupportedInfo.vakUnsupportedInfoVelden
// 	var test = false;
// 	console.log(data.vak)
// 	for(var i = 0; i < velden.length; i++){
// 		veld = velden[i];
// 		if(veld["@label"].toUpperCase() == "JUDGEMENT" || veld["@label"].toUpperCase() == "BEOORDELING" || veld["@label"].toUpperCase() == "ASSESSMENT" || veld["@label"].toUpperCase() == "WIJZE VAN TOETSEN"){
// 			appendLine("<br /><b>" + data.vak.cursusid + "</b> " + data.vak.kortenaamNL +"(" + veld["@label"] + ") -->" + veld.inhoud + "<br /><hr>");
// 			test = true;
// 		}

// 	}
// 	if(!test){
// 		appendLine("<hr><hr><hr>" + data.vak.cursusid + " !!!!!!! Dit vak heeft geen beschrijving!<hr><hr><hr>");
// 	}
// }
