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
	opleidingen : [],
	courseData 	: new CourseData(),
	coursesFetched 	: 0,
	coursesError 	: 0,
	fields 		: [],


	// Fetches the studiegids for the cafulty and the year
	fetch: function(callback){
		var url = this.baseUrl + this.faculty + "?studiejaarid=" + this.year; 
		var $this = this;
		$.ajax({
			dataType: "jsonp",
			url: url,
			error: function(jqXHR, textStatus, errorThrown){Logger.debug("Error for url:" + url); Logger.debug(textStatus + "\r\n" + errorThrown)},
			success: function(data){ $this.rawData = data;}
		});		
	},

	// Sets the data this object can use instead of the fetch function
	useData: function(data){
		this.rawData = data;
	},

	// Parses all.
	parse: function(){
		this.parseOpleidingen();
	},

	// Starts with parsing all the opleidingen.
	parseOpleidingen : function(){
		var opleidingen = this.rawData.getOpleidingenByFacultyAndYearResponse.opleiding;

		for(var i = 0; i < opleidingen.length; i++){
			this.parseOpleiding(opleidingen[i]);
		}
	},

	// Parses each opleiding. Also checks if the opleiding is wanted.
	parseOpleiding : function(opleiding){
			if(opleiding.studieprogrammaboom){
				var bool = false;
				for(var i = 0; i < this.opleidingen.length; i++){
					var curOpleid = this.opleidingen[i];
					if(parseInt(curOpleid.id) == parseInt(opleiding.id)){
						bool = true;
						break;
					}
				}

				if(bool){
					Logger.debug("Starting to parse:" + opleiding.id + ": " + opleiding.naamNL);
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
		Logger.debug("Starting to parse:     programm: " + name);

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
		Logger.debug("Starting to parse:          course: " + vak.kortenaamNL);

		var course = new Course();
		course.code = vak.kortenaamNL;
		course.name = vak.langenaamEN;
		course.ects = vak.ects;
		this.courseData.addCourse(course, program);

	},

	// Fetched detailed information about a course
	fetchDetailedCourse : function(course){
		var $this = this;
		$.jsonp({
			url: "https://api.tudelft.nl/v0/vakken/"+course.code+"?studiejaarid=11&callback=?",
			success: function(data){
			  	Logger.info($this.coursesFetched + " - " + $this.coursesError + " - " + $this.courseData.numCourses + " - " + " - Fetched course: " + course.code);
			  	course.addRawData(data);
			  	$this.coursesFetched++;
			  	if($this.coursesFetched+$this.coursesError == $this.courseData.numCourses){
			  		$this.fetchedAllCourses();
			  	}
			},
			error: function(xOptions, textStatus){
				$this.errorFetchingCourse(textStatus, course);
			}
		});
	},

	fetchedAllCourses : function(){
		StudyGuideDownloader.csvData(this.courseData, this.fields);
	},

	errorFetchingCourse : function(status, course){
		Logger.info("==== Warning! ====");
		Logger.info("Error loading course: " + course.code);
		if(status && status != ""){
			Logger.info("Fout bericht: " + status);
		}
		Logger.info("==== ======== ====");
		this.coursesError++;
		this.courseData.addErrorCourse(course);
	}
}

function parseCourse(data){
	Logger.debug(data);
	var velden = data.vak.extraUnsupportedInfo.vakUnsupportedInfoVelden
	var test = false;
	Logger.debug(data.vak)
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
