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
	HBO_SCHAKEL: 79,
	MINORS_EWI:103,
})



var studiegids = {

	faculty 	: FACULTY.EWI, 	//Default 
	year 		: YEAR["2014"], 	//Default
	baseUrl		: "https://api.tudelft.nl/v0/opleidingen/",
	debug		: true,
	rawData		: {},
	opleiding   : OPLEIDING.MINORS_EWI,
	courseData 	: new CourseData(),
	coursesFetched : 0,
	fields 		: [],


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
				//if(parseInt(opleiding.id) == this.opleiding ){
					console.log("Starting to parse:" + opleiding.id + ": " + opleiding.naamNL);
					depth = 0;
					this.parseStudieProgrammas(opleiding.studieprogrammaboom.studieprogramma, opleiding.code, depth);
				//}
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
				this.parseStudieProgramma(studieprogramma, opleidingnaam, depth);
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
			this.parseStudieProgrammas(studieprogramma.studieprogrammaboom.studieprogramma, name, depth); // Er kunnen studieprogrammas in studieprogramma's zitten :')
		}
	},

	// TODO: if needed, add support for one course! 
	parseVakken : function(vakken, program){
		for (var j = 0; j < vakken.length; j++){
			var vak = vakken[j];
			this.parseVak(vak, program)
		}
	},

	// Parses just one course.
	parseVak : function(vak, program){
		console.log("Starting to parse:          course: " + vak.kortenaamNL);

		var course = new Course();
		course.code = vak.kortenaamNL;
		course.name = vak.langenaamEN;
		course.ects = vak.ects;
		this.courseData.addCourse(course, program);

	},

	// Fetched detailed information about a course
	fetchDetailedCourse : function(course){
		var $this = this;
		$.ajax({
		  dataType: "jsonp",
		  url: "https://api.tudelft.nl/v0/vakken/"+course.code+"?studiejaarid=11",
		  success: function(data){
		  	course.addRawData(data);
		  	$this.coursesFetched++;
		  	if($this.coursesFetched == $this.courseData.numCourses){
		  		$this.fetchedAllCourses();
		  	}
		  },
		  error: function(){
		  	console.log(course);
		  	$this.errorFetchingCourse(course);
		  }
		  
		});
	},

	fetchedAllCourses : function(){
		var csvContent = "data:text/csv;charset=utf-8,";

		// Create the header
		for(var i = 0; i < this.fields.length - 1; i++){
			csvContent += this.fields[i] + ",";
		}
		csvContent += this.fields[this.fields.length-1] + "\n";

		// Generate the content
		for(var key in this.courseData.courses){
			var course = this.courseData.courses[key];
			csvContent += course.createCSVRow(this.fields) + "\n";
		}
		var encodedUri = encodeURI(csvContent);
		window.open(encodedUri);
	},

	errorFetchingCourse : function(course){
		console.log("error loading course", course.code);
		this.courseData.numCourses;
	}
}

function parseCourse(data){
	console.log(data);
	var velden = data.vak.extraUnsupportedInfo.vakUnsupportedInfoVelden
	var test = false;
	console.log(data.vak)
	for(var i = 0; i < velden.length; i++){
		veld = velden[i];
		if(veld["@label"].toUpperCase() == "JUDGEMENT" || veld["@label"].toUpperCase() == "BEOORDELING" || veld["@label"].toUpperCase() == "ASSESSMENT" || veld["@label"].toUpperCase() == "WIJZE VAN TOETSEN"){
			appendLine("<br /><b>" + data.vak.cursusid + "</b> " + data.vak.kortenaamNL +"(" + veld["@label"] + ") -->" + veld.inhoud + "<br /><hr>");
			test = true;
		}

	}
	if(!test){
		appendLine("<hr><hr><hr>" + data.vak.cursusid + " !!!!!!! Dit vak heeft geen beschrijving!<hr><hr><hr>");
	}
}
